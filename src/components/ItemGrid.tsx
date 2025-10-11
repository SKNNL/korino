import { useState } from "react";
import ItemCard from "./ItemCard";
import CategoryFilter from "./CategoryFilter";
import itemToysImage from "@/assets/item-toys.jpg";
import itemBooksImage from "@/assets/item-books.jpg";
import itemKitchenImage from "@/assets/item-kitchen.jpg";
import itemClothesImage from "@/assets/item-clothes.jpg";

const mockItems = [
  {
    id: 1,
    title: "Lot de jouets pour enfants",
    description: "Jouets en très bon état, mes enfants ne les utilisent plus. Parfait pour 3-6 ans.",
    category: "Jouets",
    categoryId: "toys",
    location: "Paris 11ème",
    date: "Il y a 2 jours",
    image: itemToysImage,
  },
  {
    id: 2,
    title: "Collection de livres fantasy",
    description: "Une vingtaine de livres de fantasy en excellent état. À échanger contre des romans policiers.",
    category: "Livres",
    categoryId: "books",
    location: "Lyon 3ème",
    date: "Il y a 1 jour",
    image: itemBooksImage,
  },
  {
    id: 3,
    title: "Ustensiles de cuisine",
    description: "Set complet d'ustensiles de cuisine, peu utilisés. Idéal pour équiper une première cuisine.",
    category: "Cuisine",
    categoryId: "kitchen",
    location: "Marseille",
    date: "Il y a 3 jours",
    image: itemKitchenImage,
  },
  {
    id: 4,
    title: "Vêtements d'été",
    description: "Vêtements femme taille M, collection été, très bon état.",
    category: "Vêtements",
    categoryId: "clothes",
    location: "Toulouse",
    date: "Il y a 5 heures",
    image: itemClothesImage,
  },
  {
    id: 5,
    title: "Livres de cuisine",
    description: "10 livres de recettes variées, cuisine française et internationale.",
    category: "Livres",
    categoryId: "books",
    location: "Nantes",
    date: "Il y a 1 jour",
    image: itemBooksImage,
  },
  {
    id: 6,
    title: "Jeux de société",
    description: "Plusieurs jeux de société en parfait état pour soirées en famille.",
    category: "Jouets",
    categoryId: "toys",
    location: "Bordeaux",
    date: "Il y a 4 jours",
    image: itemToysImage,
  },
];

const ItemGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = selectedCategory === "all" 
    ? mockItems 
    : mockItems.filter(item => item.categoryId === selectedCategory);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Objets disponibles</h2>
          <p className="text-muted-foreground">
            Parcourez les objets proposés par notre communauté
          </p>
        </div>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun objet dans cette catégorie pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ItemGrid;
