import { useState, useEffect } from "react";
import ItemCard from "./ItemCard";
import CategoryFilter from "./CategoryFilter";
import DistanceFilter from "./DistanceFilter";
import SaveSearchButton from "./SaveSearchButton";
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
      // If distance filter is active, use optimized single-query function
      if (userCoordinates && maxDistance) {
        // Sanitize search query
        let sanitizedSearch: string | null = null;
        if (searchQuery && searchQuery.trim()) {
          sanitizedSearch = searchQuery
            .trim()
            .replace(/[^\w\s\u00C0-\u017F-]/g, '')
            .slice(0, 100)
            .toLowerCase() || null;
        }

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        const { data, error } = await supabase.rpc("get_items_within_distance", {
          user_lat: userCoordinates.latitude,
          user_lon: userCoordinates.longitude,
          max_distance_km: maxDistance,
          category_filter: selectedCategory === "all" ? null : selectedCategory,
          search_filter: sanitizedSearch,
          page_offset: offset,
          page_limit: ITEMS_PER_PAGE,
        });

        if (error) throw error;

        // Extract total count from first row (all rows have same total_count)
        const totalFromQuery = data && data.length > 0 ? Number(data[0].total_count) : 0;
        
        setItems(data || []);
        setTotalCount(totalFromQuery);
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

        // Apply search filter with sanitization
        if (searchQuery && searchQuery.trim()) {
          const sanitized = searchQuery
            .trim()
            .replace(/[^\\w\\s\\u00C0-\\u017F-]/g, '')
            .slice(0, 100)
            .toLowerCase();
          
          if (sanitized) {
            query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
          }
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
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Objets disponibles</h2>
            <p className="text-muted-foreground">
              {totalCount} {totalCount > 1 ? "objets" : "objet"} {selectedCategory !== "all" ? `dans cette catégorie` : "au total"}
              {userCoordinates && maxDistance && ` dans un rayon de ${maxDistance} km`}
            </p>
          </div>
          <SaveSearchButton
            category={selectedCategory}
            maxDistance={maxDistance}
            searchQuery={searchQuery || ""}
          />
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
