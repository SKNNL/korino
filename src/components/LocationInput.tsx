import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  onLocationChange: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialAddress?: string;
}

const LocationInput = ({ onLocationChange, initialAddress = "" }: LocationInputProps) => {
  const { toast } = useToast();
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération de l'adresse");
          }
          
          const data = await response.json();
          
          // Validate response structure
          if (!data || typeof data !== 'object') {
            throw new Error("Réponse invalide de l'API de géolocalisation");
          }
          
          // Sanitize display_name
          const addr = typeof data.display_name === 'string' 
            ? data.display_name.trim().substring(0, 200) 
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setAddress(addr);
          onLocationChange({ address: addr, latitude, longitude });
          
          toast({
            title: "Position récupérée",
            description: "Votre localisation a été détectée",
          });
        } catch (error) {
          console.error("Geocoding error:", error);
          const addr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(addr);
          onLocationChange({ address: addr, latitude, longitude });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible d'obtenir votre position",
          variant: "destructive",
        });
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Localisation</Label>
      <div className="flex gap-2">
        <Input
          id="location"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onLocationChange({
              address: e.target.value,
              latitude: 0,
              longitude: 0,
            });
          }}
          placeholder="Ex: Paris 75001"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          disabled={loading}
          title="Utiliser ma position actuelle"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Cliquez sur l'icône pour utiliser votre position actuelle
      </p>
    </div>
  );
};

export default LocationInput;
