import { useEffect, useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useMessageStore } from '@/stores/messageStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';





export function MessagesPage({ onPublisherClick } = {}) {
  const { selectedConversationId, selectConversation } = useMessageStore();
  const isMobile = useIsMobile();
  const [view, setView] = useState('list');
useEffect(() => {
  if (selectedConversationId) {
    setView('chat'); // This will trigger automatically because you set it in step 1 above!
  }
}, [selectedConversationId]);
console.log("selectedConversationId",selectedConversationId)
  useEffect(() => {
    if (selectedConversationId) {
      setView('chat');
    } else {
      setView('list');
    }
  }, [selectedConversationId]);

  const handleBackToList = () => {
    selectConversation(null);
    setView('list');
  };

  return (
    <div className="h-[calc(100vh-6rem)] max-w-[1600px] mx-auto bg-card rounded-xl border border-border shadow-sm overflow-hidden flex">
      {/* List View */}
      <div className={cn(
        "w-full md:w-[350px] lg:w-[400px] flex-shrink-0 h-full transition-all duration-300",
        isMobile && view === 'chat' ? "hidden" : "block"
      )}>
        <ConversationList className="h-full" />
      </div>

      {/* Chat View */}
      <div className={cn(
        "flex-1 h-full bg-background",
        isMobile && view === 'list' ? "hidden" : "block"
      )}>
        <ChatWindow
        conversationId={selectedConversationId}
          onBack={isMobile ? handleBackToList : undefined}
          className="h-full"
          onPublisherClick={onPublisherClick} />
        
      </div>
    </div>);

}