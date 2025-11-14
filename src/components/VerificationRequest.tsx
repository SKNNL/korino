import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VerificationRequest = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idDocument || !selfie) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir tous les documents requis",
        variant: "destructive",
      });
      return;
    }

    // Simulation de l'envoi
    toast({
      title: "Demande envoyée",
      description: "Votre demande de vérification a été envoyée. Vous recevrez une réponse sous 48h.",
    });

    setOpen(false);
    setIdDocument(null);
    setSelfie(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Vérification d'identité
            </CardTitle>
            <CardDescription>
              Devenez un membre vérifié pour inspirer confiance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Demander la vérification
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demande de vérification</DialogTitle>
          <DialogDescription>
            Pour vérifier votre identité, nous avons besoin de deux documents
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="id-document">
              Pièce d'identité (carte d'identité, passeport)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="id-document"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {idDocument && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selfie">
              Selfie avec votre pièce d'identité
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="selfie"
                type="file"
                accept="image/*"
                onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {selfie && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">🔒 Vos données sont sécurisées</p>
            <p>
              Vos documents sont cryptés et supprimés après vérification.
              Délai de traitement : 24-48h.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!idDocument || !selfie}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationRequest;
