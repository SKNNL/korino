import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { reportSchema } from "@/lib/validations";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "user" | "item";
  targetId: string;
  targetName: string;
}

const ReportModal = ({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<string>("spam");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    { value: "spam", label: "Spam ou publicité" },
    { value: "inappropriate", label: "Contenu inapproprié" },
    { value: "fraud", label: "Fraude ou escroquerie" },
    { value: "other", label: "Autre" },
  ];

  const handleSubmit = async () => {
    // Validate with schema
    const validation = reportSchema.safeParse({
      reason,
      description: description.trim(),
    });

    if (!validation.success) {
      toast({
        title: "Erreur de validation",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const reportData: any = {
        reporter_id: user.id,
        reason: validation.data.reason,
        description: validation.data.description,
      };

      if (targetType === "user") {
        reportData.reported_user_id = targetId;
      } else {
        reportData.reported_item_id = targetId;
      }

      const { error } = await supabase.from("reports").insert(reportData);

      if (error) throw error;

      toast({
        title: "Signalement envoyé",
        description: "Merci pour votre signalement. Nous allons l'examiner rapidement.",
      });

      onOpenChange(false);
      setDescription("");
      setReason("spam");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le signalement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Signaler {targetType === "user" ? "un utilisateur" : "un objet"}
          </DialogTitle>
          <DialogDescription>
            Signalez "{targetName}" si vous pensez qu'il enfreint nos règles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Raison du signalement</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasons.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !description.trim()}
              className="flex-1"
              variant="destructive"
            >
              {loading ? "Envoi..." : "Signaler"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
