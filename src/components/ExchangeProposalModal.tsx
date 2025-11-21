import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { exchangeProposalSchema } from "@/lib/validations";

interface Item {
  id: string;
  title: string;
  image_url: string;
}

interface ExchangeProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverItemId: string;
  receiverItemTitle: string;
  receiverId: string;
}

const ExchangeProposalModal = ({
  open,
  onOpenChange,
  receiverItemId,
  receiverItemTitle,
  receiverId,
}: ExchangeProposalModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadMyItems = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("items")
        .select("id, title, image_url")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!error && data) {
        setMyItems(data);
      }
    };

    if (open) {
      loadMyItems();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un objet",
        variant: "destructive",
      });
      return;
    }

    // Validate message with schema
    const validation = exchangeProposalSchema.safeParse({
      message: message.trim() || undefined,
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

      const { error } = await supabase.from("exchange_proposals").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        sender_items: selectedItems,
        receiver_item_id: receiverItemId,
        message: validation.data.message || null,
      });

      if (error) throw error;

      toast({
        title: "Proposition envoyée",
        description: "Votre proposition d'échange a été envoyée avec succès",
      });

      onOpenChange(false);
      setSelectedItems([]);
      setMessage("");
    } catch (error: any) {
      console.error("Error sending proposal:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la proposition",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proposer un échange multiple</DialogTitle>
          <DialogDescription>
            Sélectionnez un ou plusieurs de vos objets pour échanger contre "{receiverItemTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* My Items Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Mes objets disponibles</h3>
            {myItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas d'objets disponibles pour l'échange
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div className="flex-1 min-w-0">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        )}
                        <p className="text-sm font-medium truncate">{item.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message (optionnel)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajoutez un message pour accompagner votre proposition..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>

          {/* Actions */}
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
              disabled={loading || selectedItems.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                `Proposer ${selectedItems.length} objet(s)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExchangeProposalModal;
