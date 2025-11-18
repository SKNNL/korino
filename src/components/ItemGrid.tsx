import { useState, useEffect } from "react";
import ItemCard from "./ItemCard";
import CategoryFilter from "./CategoryFilter";
import DistanceFilter from "./DistanceFilter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 12;

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  image_url: string;
  created_at: string;
  user_id: string;
}

const ItemGrid = ({ searchQuery }: { searchQuery?: string } = {}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadItems();
  }, [selectedCategory, currentPage, maxDistance, userCoordinates]);

  useEffect(() => {
    // Reset to page 1 when search changes
    setCurrentPage(1);
    loadItems();
  }, [searchQuery]);

  const loadItems = async () => {
    setLoading(true);
    try {
      // If distance filter is active, we need to fetch all items and filter client-side
      // or use a more complex query with the distance function
      if (userCoordinates && maxDistance) {
        let query = supabase
          .from("items")
          .select("*", { count: "exact" })
          .eq("is_active", true)
          .not("latitude", "is", null)
          .not("longitude", "is", null);

        // Apply category filter
        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
          const search = searchQuery.toLowerCase();
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: allItems, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;

        // Filter by distance using the SQL function
        const itemsWithDistance = await Promise.all(
          (allItems || []).map(async (item) => {
            const { data: distanceData } = await supabase.rpc("calculate_distance", {
              lat1: userCoordinates.latitude,
              lon1: userCoordinates.longitude,
              lat2: item.latitude,
              lon2: item.longitude,
            });
            return { ...item, distance: distanceData };
          })
        );

        const filteredItems = itemsWithDistance
          .filter((item) => item.distance !== null && item.distance <= maxDistance)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE;
        const paginatedItems = filteredItems.slice(from, to);

        setItems(paginatedItems);
        setTotalCount(filteredItems.length);
      } else {
        // Normal query without distance filter
        let query = supabase
          .from("items")
          .select("*", { count: "exact" })
          .eq("is_active", true);

        // Apply category filter
        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
          const search = searchQuery.toLowerCase();
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, error, count } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        setItems(data || []);
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Objets disponibles</h2>
          <p className="text-muted-foreground">
            {totalCount} {totalCount > 1 ? "objets" : "objet"} {selectedCategory !== "all" ? `dans cette catégorie` : "au total"}
            {userCoordinates && maxDistance && ` dans un rayon de ${maxDistance} km`}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            <DistanceFilter
              maxDistance={maxDistance}
              onDistanceChange={setMaxDistance}
              userCoordinates={userCoordinates}
              onCoordinatesChange={setUserCoordinates}
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
                    : userCoordinates && maxDistance
                    ? "Aucun objet trouvé dans cette zone. Essayez d'augmenter la distance."
                    : "Aucun objet dans cette catégorie pour le moment."}
                </p>
              </div>
            )}

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
