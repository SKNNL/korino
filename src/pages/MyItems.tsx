import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ItemCard from "@/components/ItemCard";
import { auth, items as itemsStore, Item } from "@/lib/localStore";

const ITEMS_PER_PAGE = 9;

const MyItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadMyItems();
  }, [currentPage]);

  const loadMyItems = () => {
    setLoading(true);
    
    const user = auth.getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const userItems = itemsStore.getByUser(user.id);
    setItems(userItems);
    setLoading(false);
  };

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Mes Objets</h1>
          </div>
          <Button onClick={() => navigate("/add-item")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un objet
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore d'objets
            </p>
            <Button onClick={() => navigate("/add-item")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Proposer votre premier objet
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              {paginatedItems.map((item) => (
                <ItemCard 
                  key={item.id} 
                  title={item.title}
                  description={item.description}
                  category={item.category}
                  location={item.location}
                  image_url={item.image_url}
                  created_at={item.created_at}
                  itemId={item.id}
                  ownerId={item.user_id}
                />
              ))}
            </div>

            {/* Pagination */}
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
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </span>

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
  );
};

export default MyItems;
