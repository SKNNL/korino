import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InterestMessage {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  item: {
    id: string;
    title: string;
    image_url: string;
  };
}

const InterestMessages = () => {
  const [messages, setMessages] = useState<InterestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadMessages();
  }, []);

  const checkUserAndLoadMessages = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await loadMessages();
  };

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("interest_messages")
        .select(`
          id,
          message,
          created_at,
          is_read,
          sender_id,
          item_id
        `)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data
      const messagesWithDetails = await Promise.all(
        (data || []).map(async (msg) => {
          const [senderResult, itemResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", msg.sender_id)
              .single(),
            supabase
              .from("items")
              .select("id, title, image_url")
              .eq("id", msg.item_id)
              .single(),
          ]);

          return {
            ...msg,
            sender: senderResult.data || { id: msg.sender_id, full_name: "Utilisateur", avatar_url: "" },
            item: itemResult.data || { id: msg.item_id, title: "Objet", image_url: "" },
          };
        })
      );

      setMessages(messagesWithDetails);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("interest_messages")
      .update({ is_read: true })
      .eq("id", messageId);
    
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Aucun message</h2>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore reçu de messages d'intérêt
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card 
                  key={msg.id} 
                  className={`hover:shadow-lg transition-shadow ${!msg.is_read ? 'border-primary' : ''}`}
                  onClick={() => !msg.is_read && markAsRead(msg.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={msg.item.image_url || "/placeholder.svg"}
                        alt={msg.item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{msg.item.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              de {msg.sender.full_name || "Utilisateur"}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(msg.created_at)}
                            </span>
                            {!msg.is_read && (
                              <Badge variant="default" className="text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-3 mt-3">
                          <p className="text-sm italic">"{msg.message}"</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterestMessages;
