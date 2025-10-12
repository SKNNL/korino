import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, MapPin } from "lucide-react";
import MatchChat from "@/components/MatchChat";

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  item1_id: string;
  item2_id: string;
  created_at: string;
  status: string;
  meeting_date?: string;
  meeting_location?: string;
}

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    loadMatches(session.user.id);
  };

  const loadMatches = async (userId: string) => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(id, full_name, avatar_url),
        user2:profiles!matches_user2_id_fkey(id, full_name, avatar_url),
        item1:items!matches_item1_id_fkey(id, title, image_url, description),
        item2:items!matches_item2_id_fkey(id, title, image_url, description)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos matches",
        variant: "destructive",
      });
      return;
    }

    setMatches(data || []);
  };

  if (selectedMatch) {
    return <MatchChat matchId={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes Matches</h1>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore de matches. Commencez à swiper !
            </p>
            <Button onClick={() => navigate("/swipe")}>
              Découvrir des objets
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => {
              const otherUser = match.user1_id === user?.id ? match.user2 : match.user1;
              const myItem = match.user1_id === user?.id ? match.item1 : match.item2;
              const theirItem = match.user1_id === user?.id ? match.item2 : match.item1;

              return (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted/50">
                    <div className="text-center">
                      <img
                        src={myItem.image_url || "/placeholder.svg"}
                        alt={myItem.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <p className="text-sm font-medium">Votre objet</p>
                      <p className="text-xs text-muted-foreground">{myItem.title}</p>
                    </div>
                    <div className="text-center">
                      <img
                        src={theirItem.image_url || "/placeholder.svg"}
                        alt={theirItem.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <p className="text-sm font-medium">Leur objet</p>
                      <p className="text-xs text-muted-foreground">{theirItem.title}</p>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {otherUser.full_name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{otherUser.full_name || "Utilisateur"}</p>
                        <p className="text-xs text-muted-foreground">
                          Match le {new Date(match.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {match.meeting_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(match.meeting_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {match.meeting_location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{match.meeting_location}</span>
                      </div>
                    )}

                    <Button
                      className="w-full gap-2"
                      onClick={() => setSelectedMatch(match.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Discuter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
