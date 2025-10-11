import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Search } from "lucide-react";
import SearchModal from "./SearchModal";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-foreground">Koino</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Découvrir
            </Link>
            <Link to="/comment-ca-marche" className="text-sm font-medium hover:text-primary transition-colors">
              Comment ça marche
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-primary/10"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Proposer un objet</span>
            </Button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Header;
