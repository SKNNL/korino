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
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { reviewSchema } from "@/lib/validations";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  reviewedUserId: string;
  reviewedUserName: string;
}

const ReviewModal = ({
  open,
  onOpenChange,
  matchId,
  reviewedUserId,
  reviewedUserName,
}: ReviewModalProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate with schema
    const validation = reviewSchema.safeParse({
      rating,
      comment: comment.trim() || undefined,
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

      if (!user) {
        throw new Error("Non authentifié");
      }

      const { error } = await supabase.from("reviews").insert({
        match_id: matchId,
        reviewer_id: user.id,
        reviewed_user_id: reviewedUserId,
        rating: validation.data.rating,
        comment: validation.data.comment || null,
      });

      if (error) throw error;

      toast({
        title: "Avis publié",
        description: "Merci pour votre retour !",
      });

      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier l'avis",
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
          <DialogTitle>Évaluer {reviewedUserName}</DialogTitle>
          <DialogDescription>
            Partagez votre expérience d'échange avec cet utilisateur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium">Note</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
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
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
