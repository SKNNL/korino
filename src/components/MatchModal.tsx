import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MatchModalProps {
  open: boolean;
  onClose: () => void;
  item: any;
}

const MatchModal = ({ open, onClose, item }: MatchModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center py-6">
          <div className="mb-6">
            <Sparkles className="h-20 w-20 mx-auto text-primary animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            C'est un Match ! 🎉
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Vous et le propriétaire de "{item?.title}" êtes intéressés par vos objets respectifs !
          </p>

          <div className="space-y-3">
            <Button onClick={() => navigate("/matches")} className="w-full">
              Voir mes matches
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Continuer à swiper
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
