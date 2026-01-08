import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, MapPin } from "lucide-react";
import MatchChat from "@/components/MatchChat";
import { auth, matches as matchesStore, items as itemsStore, users as usersStore } from "@/lib/localStore";

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [user, setUser] = useState(auth.getCurrentUser());
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setUser(currentUser);
    loadMatches(currentUser.id);
  };

  const loadMatches = (userId: string) => {
    const allMatches = matchesStore.getByUser(userId);
    
    // Enrich matches with user and item data
    const enrichedMatches = allMatches.map(match => {
      const user1 = usersStore.getById(match.user1_id);
      const user2 = usersStore.getById(match.user2_id);
      const item1 = itemsStore.getById(match.item1_id);
      const item2 = itemsStore.getById(match.item2_id);

      return {
        ...match,
        user1: user1 || { id: match.user1_id, full_name: "Utilisateur", avatar_url: "" },
        user2: user2 || { id: match.user2_id, full_name: "Utilisateur", avatar_url: "" },
        item1: item1 || { id: match.item1_id, title: "Objet", image_url: "", description: "" },
        item2: item2 || { id: match.item2_id, title: "Objet", image_url: "", description: "" },
      };
    });

    setMatches(enrichedMatches);
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
