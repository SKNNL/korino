import { User, Heart, Package, Settings, LogOut, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/localStore";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(auth.getCurrentUser());

  useEffect(() => {
    // Poll for user changes
    const interval = setInterval(() => {
      setUser(auth.getCurrentUser());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    navigate("/");
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
  };

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
        Connexion
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <DropdownMenuLabel>{user.full_name || "Mon compte"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/dashboard/${user.id}`)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Mon tableau de bord</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/my-items")}>
          <Package className="mr-2 h-4 w-4" />
          <span>Mes objets</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/favorites")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Mes favoris</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
