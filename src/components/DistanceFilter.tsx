import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Loader2, X } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";

interface DistanceFilterProps {
  maxDistance: number | null;
  onDistanceChange: (distance: number | null) => void;
  userCoordinates: { latitude: number; longitude: number } | null;
  onCoordinatesChange: (coords: { latitude: number; longitude: number } | null) => void;
}

const DistanceFilter = ({
  maxDistance,
  onDistanceChange,
  userCoordinates,
  onCoordinatesChange,
}: DistanceFilterProps) => {
  const { coordinates, loading, error, requestLocation } = useGeolocation();
  const { toast } = useToast();
  const [localDistance, setLocalDistance] = useState(maxDistance || 50);

  const handleEnableLocation = () => {
    requestLocation();
  };

  const handleApplyFilter = () => {
    if (coordinates) {
      onCoordinatesChange(coordinates);
      onDistanceChange(localDistance);
      toast({
        title: "Filtre appliqué",
        description: `Affichage des objets dans un rayon de ${localDistance} km`,
      });
    }
  };

  const handleClearFilter = () => {
    onCoordinatesChange(null);
    onDistanceChange(null);
    toast({
      title: "Filtre supprimé",
      description: "Affichage de tous les objets",
    });
  };

  // Update coordinates when geolocation succeeds
  if (coordinates && !userCoordinates) {
    onCoordinatesChange(coordinates);
  }

  if (error) {
    toast({
      title: "Erreur de géolocalisation",
      description: error,
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Filtrer par distance
        </Label>
        {userCoordinates && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="h-8 gap-1"
          >
            <X className="h-3 w-3" />
            Effacer
          </Button>
        )}
      </div>

      {!userCoordinates ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Activez la géolocalisation pour voir les objets près de vous
          </p>
          <Button
            onClick={handleEnableLocation}
            disabled={loading}
            className="w-full gap-2"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activation...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Activer la géolocalisation
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Distance maximale</Label>
              <span className="text-sm font-medium text-primary">
                {localDistance} km
              </span>
            </div>
            <Slider
              value={[localDistance]}
              onValueChange={(value) => setLocalDistance(value[0])}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>200 km</span>
            </div>
          </div>

          <Button
            onClick={handleApplyFilter}
            className="w-full"
            size="sm"
          >
            Appliquer le filtre
          </Button>
        </div>
      )}
    </div>
  );
};

export default DistanceFilter;
