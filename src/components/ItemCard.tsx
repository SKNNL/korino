import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";

interface ItemCardProps {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image: string;
}

const ItemCard = ({ title, description, category, location, date, image }: ItemCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <span>{date}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">
          Proposer un échange
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
