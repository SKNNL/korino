import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import Header from "@/components/Header";
import { messageSchema } from "@/lib/validations";
import TypingIndicator from "@/components/TypingIndicator";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface MatchChatProps {
  matchId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

const MatchChat = ({ matchId, onBack }: MatchChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { sendNotification, requestPermission, permission } = usePushNotifications();

  const otherUserName = matchInfo
    ? matchInfo.user1_id === user?.id
      ? matchInfo.user2?.full_name
      : matchInfo.user1?.full_name
    : "Utilisateur";

  const { typingUsers, setTyping } = useTypingIndicator({
    channelName: matchId,
    userId: user?.id || null,
    userName: matchInfo
      ? matchInfo.user1_id === user?.id
        ? matchInfo.user1?.full_name
        : matchInfo.user2?.full_name
      : "Utilisateur",
  });

  useEffect(() => {
    loadUser();
    loadMatchInfo();
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          
          // Show notification if message is from other user
          if (newMsg.sender_id !== user?.id) {
            sendNotification("Nouveau message", {
              body: newMsg.content.slice(0, 100),
              tag: `message-${matchId}`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe();

    // Request notification permission
    if (permission === "default") {
      requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user);
  };

  const loadMatchInfo = async () => {
    const { data } = await supabase
      .from("matches")
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(full_name),
        user2:profiles!matches_user2_id_fkey(full_name)
      `)
      .eq("id", matchId)
      .single();

    setMatchInfo(data);
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
      return;
    }

    setMessages((data || []) as unknown as Message[]);
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    // Find unread messages from other user
    const unreadMessages = messages.filter(
      (m) => m.sender_id !== user.id && !m.read_at
    );

    if (unreadMessages.length === 0) return;

    // Mark them as read
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in(
        "id",
        unreadMessages.map((m) => m.id)
      );

    if (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Stop typing indicator
    setTyping(false);

    // Validate message
    const validation = messageSchema.safeParse({ content: newMessage });
    if (!validation.success) {
      toast({
        title: "Erreur de validation",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col max-w-4xl">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{otherUserName}</h2>
            <p className="text-sm text-muted-foreground">Conversation</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col p-4 mb-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isOwn && (
                        <span className="ml-1">
                          {message.read_at ? (
                            <CheckCheck className="h-3 w-3 inline opacity-90" />
                          ) : (
                            <Check className="h-3 w-3 inline opacity-70" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <TypingIndicator userName={typingUsers[0].name} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Tapez votre message..."
              className="flex-1"
              maxLength={1000}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default MatchChat;
