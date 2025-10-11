import { Button } from "@/components/ui/button";
import { Package, BookOpen, Utensils, Shirt, Gamepad2, Home } from "lucide-react";

const categories = [
  { id: "all", label: "Tous", icon: Package },
  { id: "books", label: "Livres", icon: BookOpen },
  { id: "kitchen", label: "Cuisine", icon: Utensils },
  { id: "clothes", label: "Vêtements", icon: Shirt },
  { id: "toys", label: "Jouets", icon: Gamepad2 },
  { id: "home", label: "Maison", icon: Home },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
