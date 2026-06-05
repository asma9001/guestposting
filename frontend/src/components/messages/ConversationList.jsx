import { useMessageStore } from "@/stores/messageStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserStore } from "../../stores/userStore";
import { useEffect } from "react";

export function ConversationList({ className }) {
 
  const { conversations, fetchConversations, selectedConversationId, selectConversation, isLoading } = useMessageStore();
  const { user } = useUserStore();

useEffect(() => {

  fetchConversations();
}, []);
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    return diffInHours < 24
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)} unread messages
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No conversations yet.</div>
        ) : (
          conversations.map((conversation) => {
           const otherParty = conversation.participants?.find((p) => {
  const participantId = p._id || p.id; // Support for both _id and id
  const currentUserId = user?.id || user?._id;
  
  return participantId?.toString() !== currentUserId?.toString();
}) || conversation.participants?.[0];

            const isSelected = selectedConversationId === conversation.id;
console.log("otherParty",otherParty)
            return (
              <div
                key={conversation._id}
                onClick={() => selectConversation(conversation._id)}
                className={cn(
                  "p-4 border-b border-border transition-all duration-200 cursor-pointer relative group",
                  isSelected ? "bg-accent/70" : "bg-card hover:bg-accent/30"
                )}
              >
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-border shadow-sm">
                      <AvatarImage src={otherParty?.avatar} className="object-cover" />
                      <AvatarFallback className="bg-muted">
                        {otherParty?.fullName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {otherParty?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {otherParty?.fullName || "Unknown"}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {formatTime(conversation.lastMessage?.createdAt)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <p className={cn(
                        "text-xs truncate max-w-[160px]",
                        conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {conversation.lastMessage?.senderId === user?.id && "You: "}
                        {conversation.lastMessage?.text || "Started a conversation"}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full shrink-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}