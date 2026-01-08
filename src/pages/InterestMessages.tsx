import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/localStore";

const InterestMessages = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Messages d'intérêt</h1>
          </div>

          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Aucun message</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore reçu de messages d'intérêt (mode démo)
            </p>
            <Button onClick={() => navigate("/")}>
              Découvrir des objets
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterestMessages;
