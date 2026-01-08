import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Edit2, Bell, BellOff, MapPin, Tag, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { auth } from "@/lib/localStore";

interface SavedSearch {
  id: string;
  name: string;
  search_query: string | null;
  category: string | null;
  max_distance_km: number | null;
  notify_new_items: boolean;
  created_at: string;
}

const STORAGE_KEY = "tradeit_saved_searches";

const categories = [
  { value: "all", label: "Toutes catégories" },
  { value: "electronics", label: "Électronique" },
  { value: "clothing", label: "Vêtements" },
  { value: "books", label: "Livres" },
  { value: "sports", label: "Sports" },
  { value: "home", label: "Maison" },
  { value: "toys", label: "Jouets" },
  { value: "other", label: "Autre" },
];

const SavedSearches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [deleteSearch, setDeleteSearch] = useState<SavedSearch | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    search_query: "",
    category: "all",
    max_distance_km: 50,
    notify_new_items: true,
  });

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = () => {
    const user = auth.getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSearches: SavedSearch[] = stored ? JSON.parse(stored) : [];
      const userSearches = allSearches.filter((s: any) => s.user_id === user.id);
      setSavedSearches(userSearches);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (search: SavedSearch) => {
    setEditingSearch(search);
    setEditForm({
      name: search.name,
      search_query: search.search_query || "",
      category: search.category || "all",
      max_distance_km: search.max_distance_km || 50,
      notify_new_items: search.notify_new_items ?? true,
    });
  };

  const handleSaveEdit = () => {
    if (!editingSearch) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSearches: any[] = stored ? JSON.parse(stored) : [];
      const index = allSearches.findIndex(s => s.id === editingSearch.id);
      
      if (index !== -1) {
        allSearches[index] = {
          ...allSearches[index],
          name: editForm.name,
          search_query: editForm.search_query || null,
          category: editForm.category === "all" ? null : editForm.category,
          max_distance_km: editForm.max_distance_km,
          notify_new_items: editForm.notify_new_items,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
      }

      toast({
        title: "Recherche modifiée",
        description: "Votre recherche a été mise à jour.",
      });

      setEditingSearch(null);
      fetchSavedSearches();
    } catch (error) {
      console.error("Error updating search:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la recherche.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (!deleteSearch) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSearches: any[] = stored ? JSON.parse(stored) : [];
      const filtered = allSearches.filter(s => s.id !== deleteSearch.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      toast({
        title: "Recherche supprimée",
        description: "Votre recherche a été supprimée.",
      });

      setDeleteSearch(null);
      fetchSavedSearches();
    } catch (error) {
      console.error("Error deleting search:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recherche.",
        variant: "destructive",
      });
    }
  };

  const toggleNotifications = (search: SavedSearch) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSearches: any[] = stored ? JSON.parse(stored) : [];
      const index = allSearches.findIndex(s => s.id === search.id);
      
      if (index !== -1) {
        allSearches[index].notify_new_items = !search.notify_new_items;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
      }

      setSavedSearches(searches =>
        searches.map(s =>
          s.id === search.id ? { ...s, notify_new_items: !s.notify_new_items } : s
        )
      );

      toast({
        title: search.notify_new_items ? "Notifications désactivées" : "Notifications activées",
        description: search.notify_new_items
          ? "Vous ne recevrez plus d'alertes pour cette recherche."
          : "Vous serez alerté des nouveaux objets correspondants.",
      });
    } catch (error) {
      console.error("Error toggling notifications:", error);
    }
  };

  const executeSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.search_query) params.set("q", search.search_query);
    if (search.category && search.category !== "all") params.set("category", search.category);
    if (search.max_distance_km) params.set("distance", search.max_distance_km.toString());
    
    navigate(`/?${params.toString()}`);
  };

  const getCategoryLabel = (value: string | null) => {
    if (!value) return "Toutes";
    const category = categories.find(c => c.value === value);
    return category?.label || value;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Mes recherches sauvegardées | TradeIt"
        description="Gérez vos recherches sauvegardées et recevez des alertes pour les nouveaux objets."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recherches sauvegardées</h1>
            <p className="text-muted-foreground">Gérez vos recherches et alertes</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : savedSearches.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune recherche sauvegardée</h3>
              <p className="text-muted-foreground mb-4">
                Sauvegardez vos recherches depuis la page d'accueil pour les retrouver ici.
              </p>
              <Button onClick={() => navigate("/")}>
                Explorer les objets
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedSearches.map((search) => (
              <Card key={search.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{search.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleNotifications(search)}
                      className="h-8 w-8"
                    >
                      {search.notify_new_items ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {search.search_query && (
                    <div className="flex items-center gap-2 text-sm">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{search.search_query}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{getCategoryLabel(search.category)}</span>
                  </div>
                  {search.max_distance_km && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{search.max_distance_km} km</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Créée le {formatDate(search.created_at)}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => executeSearch(search)}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Rechercher
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(search)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteSearch(search)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingSearch} onOpenChange={() => setEditingSearch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la recherche</DialogTitle>
            <DialogDescription>
              Modifiez les critères de votre recherche sauvegardée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la recherche</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Ma recherche"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="query">Mots-clés</Label>
              <Input
                id="query"
                value={editForm.search_query}
                onChange={(e) => setEditForm({ ...editForm, search_query: e.target.value })}
                placeholder="Ex: iPhone, vélo, livre..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance maximale (km)</Label>
              <Input
                id="distance"
                type="number"
                min={1}
                max={200}
                value={editForm.max_distance_km}
                onChange={(e) => setEditForm({ ...editForm, max_distance_km: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Recevoir des alertes</Label>
              <Switch
                id="notifications"
                checked={editForm.notify_new_items}
                onCheckedChange={(checked) => setEditForm({ ...editForm, notify_new_items: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSearch(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.name.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSearch} onOpenChange={() => setDeleteSearch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette recherche ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La recherche "{deleteSearch?.name}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedSearches;
