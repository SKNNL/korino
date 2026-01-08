import { useState, useEffect } from "react";
import ItemCard from "./ItemCard";
import CategoryFilter from "./CategoryFilter";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { items as itemsStore } from "@/lib/localStore";

const ITEMS_PER_PAGE = 12;

const ItemGrid = ({ searchQuery }: { searchQuery?: string } = {}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadItems();
  }, [selectedCategory, currentPage, searchQuery]);

  const loadItems = () => {
    setLoading(true);
    
    // Small delay to simulate loading
    setTimeout(() => {
      const allItems = itemsStore.getAll({
        category: selectedCategory,
        search: searchQuery,
      });
      
      // Paginate
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedItems = allItems.slice(start, start + ITEMS_PER_PAGE);
      
      setItems(paginatedItems);
      setLoading(false);
    }, 300);
  };

  const totalItems = itemsStore.getAll({
    category: selectedCategory,
    search: searchQuery,
  }).length;
  
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Objets disponibles</h2>
            <p className="text-muted-foreground">
              {totalItems} {totalItems > 1 ? "objets" : "objet"} {selectedCategory !== "all" ? `dans cette catégorie` : "au total"}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[400px]">
                  {items.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      {...item} 
                      itemId={item.id}
                      ownerId={item.user_id}
                    />
                  ))}
                </div>
                
                {items.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "Aucun objet ne correspond à votre recherche." 
                        : "Aucun objet dans cette catégorie pour le moment."}
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} sur {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItemGrid;
