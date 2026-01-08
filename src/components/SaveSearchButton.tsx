import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Loader2 } from "lucide-react";
import { auth } from "@/lib/localStore";

interface SaveSearchButtonProps {
  category: string;
  maxDistance: number | null;
  searchQuery: string;
}

const STORAGE_KEY = "tradeit_saved_searches";

const SaveSearchButton = ({
  category,
  maxDistance,
  searchQuery,
}: SaveSearchButtonProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notifyNewItems, setNotifyNewItems] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à cette recherche",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const user = auth.getCurrentUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder une recherche",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSearches = stored ? JSON.parse(stored) : [];
      
      const newSearch = {
        id: Math.random().toString(36).substring(2, 15),
        user_id: user.id,
        name: name.trim(),
        category: category !== "all" ? category : null,
        max_distance_km: maxDistance,
        search_query: searchQuery || null,
        notify_new_items: notifyNewItems,
        created_at: new Date().toISOString(),
      };
      
      allSearches.push(newSearch);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));

      toast({
        title: "Recherche sauvegardée",
        description: "Vous recevrez des notifications pour les nouveaux objets correspondants",
      });

      setOpen(false);
      setName("");
    } catch (error: any) {
      console.error("Error saving search:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la recherche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Sauvegarder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sauvegarder cette recherche</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Nom de la recherche</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Livres près de chez moi"
              maxLength={100}
            />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Critères sauvegardés :</p>
            <ul className="list-disc list-inside space-y-1">
              {category !== "all" && <li>Catégorie : {category}</li>}
              {maxDistance && <li>Distance max : {maxDistance} km</li>}
              {searchQuery && <li>Recherche : "{searchQuery}"</li>}
              {category === "all" && !maxDistance && !searchQuery && (
                <li>Tous les objets</li>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify" className="cursor-pointer">
              M'alerter des nouveaux objets
            </Label>
            <Switch
              id="notify"
              checked={notifyNewItems}
              onCheckedChange={setNotifyNewItems}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSearchButton;
