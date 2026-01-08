import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, Heart, ArrowLeft, Sparkles, Flag, Repeat } from "lucide-react";
import Header from "@/components/Header";
import MatchModal from "@/components/MatchModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/lib/validations";
import { auth, items as itemsStore, swipes as swipesStore, Item } from "@/lib/localStore";

const Swipe = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedItem, setMatchedItem] = useState<Item | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [pendingSwipeItem, setPendingSwipeItem] = useState<Item | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setUser(currentUser);
    loadItems(currentUser.id);
  }, [navigate]);

  const loadItems = (userId: string) => {
    // Get all items except user's own
    const allItems = itemsStore.getAll();
    const userSwipes = swipesStore.getByUser(userId);
    const swipedIds = userSwipes.map(s => s.item_id);
    
    // Filter out user's items and already swiped items
    const availableItems = allItems.filter(item => 
      item.user_id !== userId && !swipedIds.includes(item.id)
    );
    
    setItems(availableItems);
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (!user || currentIndex >= items.length) return;

    const currentItem = items[currentIndex];

    // Si c'est un like à droite, proposer d'envoyer un message
    if (direction === "right") {
      setPendingSwipeItem(currentItem);
      setShowMessageDialog(true);
      return;
    }

    // Pour les swipes à gauche, enregistrer directement
    recordSwipe(currentItem, direction);
  };

  const recordSwipe = (item: Item, direction: "left" | "right", _message?: string) => {
    // Enregistrer le swipe et vérifier s'il y a un match
    const result = swipesStore.create(user.id, item.id, direction);

    if (result.match) {
      setMatchedItem(item);
      setShowMatch(true);
      toast({
        title: "🎉 Match !",
        description: "Vous pouvez maintenant discuter avec le propriétaire",
      });
    }

    // Passer à l'item suivant
    setCurrentIndex(prev => prev + 1);
  };

  const handleSendMessage = () => {
    if (!pendingSwipeItem) return;
    
    // Validate message if provided
    if (messageText.trim()) {
      const validation = messageSchema.safeParse({ content: messageText });
      if (!validation.success) {
        toast({
          title: "Erreur de validation",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }
    
    recordSwipe(pendingSwipeItem, "right", messageText.trim() || undefined);
    
    setShowMessageDialog(false);
    setMessageText("");
    setPendingSwipeItem(null);
    
    if (messageText.trim()) {
      toast({
        title: "Like envoyé !",
        description: "Votre intérêt a été enregistré",
      });
    }
  };

  const handleSkipMessage = () => {
    if (!pendingSwipeItem) return;
    
    recordSwipe(pendingSwipeItem, "right");
    
    setShowMessageDialog(false);
    setMessageText("");
    setPendingSwipeItem(null);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe("right");
    } else if (info.offset.x < -100) {
      handleSwipe("left");
    }
  };

  if (!user) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Découvrir</h1>
            <div className="w-20" />
          </div>

          {!currentItem ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Plus d'objets disponibles</h2>
              <p className="text-muted-foreground mb-6">
                Revenez plus tard pour découvrir de nouveaux objets
              </p>
              <Button onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </motion.div>
          ) : (
            <div className="relative h-[600px]">
              <motion.div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={currentIndex}
              >
                <div className="h-full rounded-2xl overflow-hidden shadow-2xl bg-card">
                  <div className="h-2/3 bg-muted relative">
                    <img
                      src={currentItem.image_url || "/placeholder.svg"}
                      alt={currentItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {currentItem.category}
                    </div>
                  </div>
                  
                  <div className="h-1/3 p-6">
                    <h2 className="text-2xl font-bold mb-2">{currentItem.title}</h2>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {currentItem.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📍 {currentItem.location}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Boutons de swipe */}
              <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12"
                  onClick={() => toast({ title: "Signalement", description: "Fonctionnalité de démonstration" })}
                  title="Signaler"
                >
                  <Flag className="h-5 w-5" />
                </Button>
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full shadow-lg transition-all duration-200"
                    onClick={() => handleSwipe("left")}
                  >
                    <X className="h-8 w-8 text-destructive" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                    onClick={() => handleSwipe("right")}
                  >
                    <Heart className="h-8 w-8" />
                  </Button>
                </motion.div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12"
                  onClick={() => toast({ title: "Échange", description: "Fonctionnalité de démonstration" })}
                  title="Proposer un échange"
                >
                  <Repeat className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <MatchModal
        open={showMatch}
        onClose={() => setShowMatch(false)}
        item={matchedItem}
      />

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un message ?</DialogTitle>
            <DialogDescription>
              Vous pouvez envoyer un message avec votre like pour montrer votre intérêt
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Écrivez un message (optionnel)..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-[100px]"
            maxLength={1000}
          />
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleSkipMessage}>
              Liker sans message
            </Button>
            <Button onClick={handleSendMessage}>
              {messageText.trim() ? "Envoyer le message" : "Continuer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Swipe;
