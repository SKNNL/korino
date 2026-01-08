import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Leaf, TrendingUp, Package, Star, CheckCircle2, History } from "lucide-react";
import UserRating from "@/components/UserRating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { users as usersStore, items as itemsStore, matches as matchesStore } from "@/lib/localStore";

interface UserStats {
  total_items: number;
  active_items: number;
  total_matches: number;
  completed_exchanges: number;
  average_rating: number;
  total_value: number;
  co2_saved: number;
}

const PublicDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    // Load user data from local store
    const user = usersStore.getById(userId);
    if (!user) {
      setLoading(false);
      return;
    }

    setProfile({
      ...user,
      is_verified: false,
      created_at: new Date().toISOString(),
    });

    // Calculate stats
    const userItems = itemsStore.getByUser(userId);
    const userMatches = matchesStore.getByUser(userId);
    const completedMatches = userMatches.filter(m => m.status === 'completed');

    setStats({
      total_items: userItems.length,
      active_items: userItems.filter(i => i.is_active).length,
      total_matches: userMatches.length,
      completed_exchanges: completedMatches.length,
      average_rating: 0,
      total_value: userItems.reduce((sum, i) => sum + (i.estimated_value || 0), 0),
      co2_saved: completedMatches.length * 2.5,
    });

    setLoading(false);
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Profil de ${profile.full_name || "Utilisateur"}`}
        description={profile.bio || `Découvrez le profil et les statistiques d'échange de ${profile.full_name}`}
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.full_name || "Utilisateur"}</h1>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <UserRating userId={userId!} showCount size="lg" />
                  {profile.location && (
                    <span className="text-sm text-muted-foreground">{profile.location}</span>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-muted-foreground mb-3">{profile.bio}</p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Objets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_items}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_items} au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Échanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_exchanges}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_matches} matches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                CO₂ Économisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.co2_saved.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                Impact écologique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Valeur Totale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_value.toFixed(0)} €</div>
              <p className="text-xs text-muted-foreground">
                Objets proposés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historique des échanges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Échanges réussis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Aucun échange complété pour le moment (mode démo)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicDashboard;
