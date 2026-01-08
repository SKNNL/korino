import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import Header from "@/components/Header";
import { auth, messages as messagesStore, matches as matchesStore, users as usersStore, type Message } from "@/lib/localStore";

interface MatchChatProps {
  matchId: string;
  onBack: () => void;
}

const MatchChat = ({ matchId, onBack }: MatchChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(auth.getCurrentUser());
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const otherUserName = matchInfo
    ? matchInfo.user1_id === user?.id
      ? matchInfo.user2?.full_name
      : matchInfo.user1?.full_name
    : "Utilisateur";

  useEffect(() => {
    loadMatchInfo();
    loadMessages();

    // Poll for new messages
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMatchInfo = () => {
    const match = matchesStore.getById(matchId);
    if (match) {
      const user1 = usersStore.getById(match.user1_id);
      const user2 = usersStore.getById(match.user2_id);
      setMatchInfo({
        ...match,
        user1: user1 || { full_name: "Utilisateur" },
        user2: user2 || { full_name: "Utilisateur" },
      });
    }
  };

  const loadMessages = () => {
    const allMessages = messagesStore.getByMatch(matchId);
    setMessages(allMessages);
  };

  const markMessagesAsRead = () => {
    if (!user) return;

    const unreadMessages = messages.filter(
      (m) => m.sender_id !== user.id && !m.read_at
    );

    if (unreadMessages.length > 0) {
      messagesStore.markAsRead(unreadMessages.map(m => m.id));
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    messagesStore.create(matchId, user.id, newMessage.trim());
    setNewMessage("");
    loadMessages();
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
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Commencez la conversation !</p>
              </div>
            )}
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
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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
