import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseTypingIndicatorProps {
  channelName: string;
  userId: string | null;
  userName?: string;
}

interface TypingUser {
  id: string;
  name: string;
}

export const useTypingIndicator = ({
  channelName,
  userId,
  userName = "Utilisateur",
}: UseTypingIndicatorProps) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId || !channelName) return;

    const channel = supabase.channel(`typing-${channelName}`);
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typing: TypingUser[] = [];

        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.isTyping && presence.userId !== userId) {
              typing.push({
                id: presence.userId,
                name: presence.userName,
              });
            }
          });
        });

        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            userName,
            isTyping: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channel.unsubscribe();
    };
  }, [channelName, userId, userName]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !userId) return;

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      await channelRef.current.track({
        userId,
        userName,
        isTyping,
        online_at: new Date().toISOString(),
      });

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              userId,
              userName,
              isTyping: false,
              online_at: new Date().toISOString(),
            });
          }
        }, 3000);
      }
    },
    [userId, userName]
  );

  return { typingUsers, setTyping };
};
