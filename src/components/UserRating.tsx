import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserRatingProps {
  userId: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

const UserRating = ({ userId, showCount = false, size = "md" }: UserRatingProps) => {
  const [rating, setRating] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data, error } = await supabase.rpc("get_user_average_rating", {
          user_id: userId,
        });

        if (error) throw error;

        setRating(Number(data) || 0);

        // Get review count
        const { count: reviewCount } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("reviewed_user_id", userId);

        setCount(reviewCount || 0);
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    fetchRating();
  }, [userId]);

  if (count === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Star className={sizeClasses[size]} />
        <span className="text-sm">Nouveau</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      <span className="font-medium">{rating.toFixed(1)}</span>
      {showCount && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
};

export default UserRating;
