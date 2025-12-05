import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  isRead: boolean;
  isOwn: boolean;
}

const ReadReceipt = ({ isRead, isOwn }: ReadReceiptProps) => {
  if (!isOwn) return null;

  return (
    <span className="ml-1">
      {isRead ? (
        <CheckCheck className="h-3 w-3 text-primary inline" />
      ) : (
        <Check className="h-3 w-3 opacity-70 inline" />
      )}
    </span>
  );
};

export default ReadReceipt;
