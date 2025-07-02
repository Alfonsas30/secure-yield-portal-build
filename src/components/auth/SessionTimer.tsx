import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SessionTimer() {
  const { timeLeft, user } = useAuth();
  
  if (!user) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  const isWarning = timeLeft <= 30000; // Less than 30 seconds
  
  return (
    <Badge 
      variant={isWarning ? "destructive" : "secondary"}
      className="flex items-center gap-2"
    >
      <Clock className="h-3 w-3" />
      <span className="text-xs">
        Sesija: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </Badge>
  );
}