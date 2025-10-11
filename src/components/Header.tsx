import { Button } from "@/components/ui/button";
import { Package, PlusCircle, User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-foreground">Koino</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Découvrir
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Comment ça marche
          </a>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Proposer un objet</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
