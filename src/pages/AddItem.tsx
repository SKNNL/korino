import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { itemSchema } from "@/lib/validations";
import LocationInput from "@/components/LocationInput";
import SEO from "@/components/SEO";

const AddItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    brand: "",
    condition: "",
    price_range: "",
    latitude: 0,
    longitude: 0,
  });

  const categories = [
    "Livres",
    "Vêtements",
    "Cuisine",
    "Jouets",
    "Électronique",
    "Mobilier",
    "Sport",
    "Décoration",
    "Autre",
  ];

  const conditions = [
    { value: "neuf", label: "Neuf" },
    { value: "tres_bon_etat", label: "Très bon état" },
    { value: "bon_etat", label: "Bon état" },
    { value: "etat_correct", label: "État correct" },
    { value: "pour_pieces", label: "Pour pièces" },
  ];

  const priceRanges = [
    { value: "gratuit", label: "Gratuit" },
    { value: "1_10", label: "€ (1-10€)" },
    { value: "10_30", label: "€€ (10-30€)" },
    { value: "30_50", label: "€€€ (30-50€)" },
    { value: "50_100", label: "€€€€ (50-100€)" },
    { value: "100_200", label: "€€€€€ (100-200€)" },
    { value: "200_plus", label: "€€€€€€ (200€+)" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 5 MB.",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Format non supporté",
          description: "Seuls les formats JPEG, PNG et WebP sont acceptés.",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate form data
    const validation = itemSchema.safeParse(formData);
    if (!validation.success) {
      setLoading(false);
      toast({
        title: "Erreur de validation",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Non authentifié",
          description: "Vous devez être connecté pour publier un objet",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let imageUrl = "";

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("items")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("items").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert item
      const { error: insertError } = await supabase.from("items").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        image_url: imageUrl,
        brand: formData.brand || null,
        condition: formData.condition || null,
        price_range: formData.price_range || null,
      });

      if (insertError) throw insertError;

      toast({
        title: "Objet publié !",
        description: "Votre objet a été ajouté avec succès",
      });

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Proposer un objet à échanger"
        description="Ajoutez un objet que vous souhaitez échanger. Prenez une photo, décrivez l'objet et trouvez quelqu'un pour l'échanger."
      />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Proposer un objet</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Photo de l'objet</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Cliquez pour ajouter une photo
                  </span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Vélo en bon état"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              required
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Décrivez votre objet..."
              rows={4}
            />
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="brand">Marque (optionnel)</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              placeholder="Ex: Nike, Apple, Ikea..."
            />
          </div>

          {/* Condition */}
          <div>
            <Label htmlFor="condition">État (optionnel)</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) =>
                setFormData({ ...formData, condition: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'état" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((cond) => (
                  <SelectItem key={cond.value} value={cond.value}>
                    {cond.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Label htmlFor="price_range">Gamme de prix (optionnel)</Label>
            <Select
              value={formData.price_range}
              onValueChange={(value) =>
                setFormData({ ...formData, price_range: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le prix" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <LocationInput
            onLocationChange={(location) =>
              setFormData({
                ...formData,
                location: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
              })
            }
            initialAddress={formData.location}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publication en cours...
              </>
            ) : (
              "Publier l'objet"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AddItem;
