import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Flag } from "lucide-react";
import ExchangeProposalModal from "@/components/ExchangeProposalModal";
import ReportModal from "@/components/ReportModal";

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
  
  // Use image_url from database or fallback to image prop or placeholder
  const displayImage = image_url || image || "/placeholder.svg";
  
  // Format date - use date prop or format created_at
  const displayDate = date || (created_at ? formatDate(created_at) : "Récemment");
  
  return (
    <>
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={displayImage} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
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
