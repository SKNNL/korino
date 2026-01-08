import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, favorites as favoritesStore } from "@/lib/localStore";

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

const ItemCard = ({ title, description, category, location, date, image, image_url, created_at, itemId }: ItemCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const { toast } = useToast();
  
  // Format date - use date prop or format created_at
  const displayDate = date || (created_at ? formatDate(created_at) : "Récemment");
  const displayImage = image_url || image || "/placeholder.svg";

  useEffect(() => {
    if (itemId) {
      checkFavoriteStatus();
    }
  }, [itemId]);

  const checkFavoriteStatus = () => {
    const user = auth.getCurrentUser();
    if (!user || !itemId) return;

    const isFav = favoritesStore.isFavorite(user.id, itemId);
    setIsFavorite(isFav);
  };

  const toggleFavorite = () => {
    if (!itemId) return;
    
    setIsLoadingFavorite(true);
    
    const user = auth.getCurrentUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des favoris",
        variant: "destructive",
      });
      setIsLoadingFavorite(false);
      return;
    }

    if (isFavorite) {
      favoritesStore.remove(user.id, itemId);
      setIsFavorite(false);
      toast({
        title: "Retiré des favoris",
        description: "L'objet a été retiré de vos favoris",
      });
    } else {
      favoritesStore.add(user.id, itemId);
      setIsFavorite(true);
      toast({
        title: "Ajouté aux favoris",
        description: "L'objet a été ajouté à vos favoris",
      });
    }
    
    setIsLoadingFavorite(false);
  };
  
  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full hover-scale" 
          variant="outline"
          onClick={() => toast({ title: "Échange", description: "Fonctionnalité de démonstration" })}
        >
          Proposer un échange
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
