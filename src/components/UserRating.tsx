import { Star } from "lucide-react";

interface UserRatingProps {
  userId: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

const UserRating = ({ showCount = false, size = "md" }: UserRatingProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // In demo mode, show a placeholder rating
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Star className={sizeClasses[size]} />
      <span className="text-sm">Nouveau</span>
    </div>
  );
};

export default UserRating;
