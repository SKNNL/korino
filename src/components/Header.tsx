import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Search, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SearchModal from "./SearchModal";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";

const Header = ({ searchQuery, onSearchChange }: { searchQuery?: string; onSearchChange?: (query: string) => void } = {}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Subscribe to changes in interest_messages
    const channel = supabase
      .channel('interest_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interest_messages'
        },
        () => loadUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("interest_messages")
      .select("id", { count: "exact" })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (!error && data) {
      setUnreadCount(data.length);
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
      setSearchOpen(false);
      // Scroll to items section
      const itemsSection = document.querySelector('section.container');
      itemsSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-foreground">Nexus</span>
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
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <NotificationBell />
            <Link to="/interest-messages">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/swipe">
              <Button variant="default" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Swiper</span>
              </Button>
            </Link>
            <Link to="/add-item">
              <Button variant="outline" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Proposer un objet</span>
              </Button>
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} onSearch={handleSearchSubmit} />
    </>
  );
};

export default Header;
