import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-exchange.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Échangez vos objets,
              <span className="text-primary block">partagez l'essentiel</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Donnez une seconde vie à vos objets inutilisés. Trouvez ce dont vous avez besoin grâce au troc solidaire.
            </p>
            
            <div className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un objet..." 
                  className="pl-10 h-12 border-border bg-card"
                />
              </div>
              <Button size="lg" className="h-12">
                Rechercher
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Échange d'objets entre personnes" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
