import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Flag, Heart } from "lucide-react";
import ExchangeProposalModal from "@/components/ExchangeProposalModal";
import ReportModal from "@/components/ReportModal";
import ImageCarousel from "@/components/ImageCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Il y a quelques minutes";
  if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  return `Il y a ${Math.floor(diffInDays / 30)} mois`;
};

interface ItemCardProps {
  title: string;
  description: string;
  category: string;
  location: string;
  date?: string;
  image?: string;
  image_url?: string;
  created_at?: string;
  itemId?: string;
  ownerId?: string;
}

const ItemCard = ({ title, description, category, location, date, image, image_url, created_at, itemId, ownerId }: ItemCardProps) => {
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [allImages, setAllImages] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Format date - use date prop or format created_at
  const displayDate = date || (created_at ? formatDate(created_at) : "Récemment");

  useEffect(() => {
    if (itemId) {
      checkFavoriteStatus();
      loadItemImages();
    }
  }, [itemId]);

  const loadItemImages = async () => {
    if (!itemId) return;
    
    try {
      // Fetch additional images from item_images table
      const { data, error } = await supabase
        .from("item_images")
        .select("image_url, display_order")
        .eq("item_id", itemId)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setAllImages(data.map((img: any) => img.image_url));
      } else {
        // Fallback to single image
        const displayImage = image_url || image || "/placeholder.svg";
        setAllImages([displayImage]);
      }
    } catch (error) {
      console.error("Error loading item images:", error);
      const displayImage = image_url || image || "/placeholder.svg";
      setAllImages([displayImage]);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !itemId) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .maybeSingle();

      if (!error && data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!itemId) return;
    
    setIsLoadingFavorite(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour ajouter des favoris",
          variant: "destructive",
        });
        return;
      }

      if (isFavorite && favoriteId) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", favoriteId);

        if (error) throw error;

        setIsFavorite(false);
        setFavoriteId(null);
        toast({
          title: "Retiré des favoris",
          description: "L'objet a été retiré de vos favoris",
        });
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            item_id: itemId,
          })
          .select()
          .single();

        if (error) throw error;

        setIsFavorite(true);
        setFavoriteId(data.id);
        toast({
          title: "Ajouté aux favoris",
          description: "L'objet a été ajouté à vos favoris",
        });
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier les favoris",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFavorite(false);
    }
  };
  
  return (
    <>
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <ImageCarousel images={allImages} alt={title} />
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-2 right-2 h-10 w-10 bg-background/80 hover:bg-background/90 backdrop-blur-sm ${
            isFavorite ? "text-destructive" : ""
          }`}
          onClick={toggleFavorite}
          disabled={isLoadingFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>
      
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <Badge variant="secondary" className="shrink-0">
            {category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{displayDate}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          className="flex-1 hover-scale" 
          variant="outline"
          onClick={() => itemId && ownerId && setShowExchangeModal(true)}
          disabled={!itemId || !ownerId}
        >
          Proposer un échange
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowReportModal(true)}
          className="shrink-0"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    
    {itemId && ownerId && (
      <>
        <ExchangeProposalModal
          open={showExchangeModal}
          onOpenChange={setShowExchangeModal}
          receiverItemId={itemId}
          receiverItemTitle={title}
          receiverId={ownerId}
        />
        <ReportModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          targetType="item"
          targetId={itemId}
          targetName={title}
        />
      </>
    )}
    </>
  );
};

export default ItemCard;
