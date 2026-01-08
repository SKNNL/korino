import { useState, useCallback } from "react";

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

  // In demo mode, typing indicator is not functional
  const setTyping = useCallback(
    async (_isTyping: boolean) => {
      // No-op in demo mode
    },
    [userId, userName]
  );

  return { typingUsers, setTyping };
};
