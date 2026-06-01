import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSupportStore } from '@/stores/supportStore';
import { ArrowLeftIcon, SendIcon, UserIcon, HeadphonesIcon, PaperclipIcon, SmileIcon } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';






const EMOJI_LIST = [
'😀', '😂', '😊', '😍', '🤔', '😅', '👍', '👎', '❤️', '🎉',
'🙏', '😢', '😎', '🤝', '🔥', '✅', '⚠️', '💡', '📎', '🖊️',
'📧', '📝', '💬', '🕐', '📌', '🚀', '💯', '👏', '😮', '🤗'];


export function TicketDetails({ ticket: ticketProp, onBack }) {
  const { addMessage, tickets } = useSupportStore();
const ticket =
  tickets.find((t) => t._id === ticketProp._id) ?? ticketProp;
  console.log("🚀 TicketDetails received ticket:", ticketProp);
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef(null);

 const handleSendReply = async () => {
  if (!replyMessage.trim() && attachments.length === 0) return;

  try {
    await addMessage(ticket._id, replyMessage);

    setReplyMessage("");
    setAttachments([]);
  } catch (err) {
    console.error("Message send failed:", err);
  }
};

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = useCallback((emoji) => {
    setReplyMessage((prev) => prev + emoji);
    setEmojiOpen(false);
  }, []);

  const getStatusBadge = (status) => {
    const config = {
      open: { label: 'Open', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 border-green-200' },
      closed: { label: 'Closed', className: 'bg-gray-50 text-gray-700 border-gray-200' }
    };

    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

 const getPriorityBadge = (priority) => {
  // 1. Pehle safe side check karein agar priority missing ho ya capital letters mein ho
  const normalizedPriority = priority ? priority.toLowerCase() : 'low';

  const config = {
    low: { label: 'Low', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    high: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700 border-red-200' }
  };

  // 2. Fallback: Agar exact match na mile (e.g. koi unknown string ho), to 'low' ki styling use karein crash hone ki jagah
  const badge = config[normalizedPriority] || config.low;
  
  return <Badge className={badge.className}>{badge.label}</Badge>;
};

  return (
      <div className="space-y-6 max-w-5xl mx-auto">
         {/* Header */}
         <div className="flex items-center gap-4">
           <Button
             variant="ghost"
             size="icon"
             onClick={onBack}
             className="hover:bg-accent">
             
             <ArrowLeftIcon className="w-5 h-5" />
           </Button>
           <div className="flex-1">
             <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
             <div className="flex items-center gap-3 mt-2">
               <span className="text-sm text-muted-foreground font-mono">TCK-{ticket._id.substring(ticket._id.length - 4).toUpperCase()}</span>
               {getStatusBadge(ticket.status)}
               {getPriorityBadge(ticket.priority)}
             </div>
           </div>
         </div>
   
         {/* Ticket Info */}
         <Card className="border-border">
           <CardContent className="p-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div>
                 <p className="text-sm text-muted-foreground mb-1">Category</p>
                 <p className="text-base font-medium text-foreground capitalize">
                   {ticket.category.replace('_', ' ')}
                 </p>
               </div>
               <div>
                 <p className="text-sm text-muted-foreground mb-1">Created</p>
                 <p className="text-base font-medium text-foreground">
                   {new Date(ticket.createdAt).toLocaleDateString()}
                 </p>
               </div>
               <div>
                 <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                 <p className="text-base font-medium text-foreground">
                   {new Date(ticket.updatedAt).toLocaleDateString()}
                 </p>
               </div>
               {ticket.relatedUrl &&
               <div>
                   <p className="text-sm text-muted-foreground mb-1">Related</p>
                   <p className="text-base font-medium text-primary truncate">{ticket.relatedUrl}</p>
                 </div>
               }
             </div>
           </CardContent>
         </Card>
   
         {/* Conversation */}
         <Card className="border-border">
           <CardHeader className="border-b border-border">
             <CardTitle className="text-lg">Conversation</CardTitle>
           </CardHeader>
           <CardContent className="p-6">
             <div className="space-y-6">
               {ticket.messages.map((msg) =>
               <div
                 key={msg.id}
                 className={`flex gap-3 ${msg.sender === 'publisher' ? 'flex-row' : 'flex-row-reverse'}`}>
                 
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                 msg.sender === 'publisher' ?
                 'bg-muted border border-border' :
                 'bg-muted border border-border'}`
                 }>
                     {msg.sender === 'publisher' ?
                   <UserIcon className="w-4 h-4 text-muted-foreground" /> :
   
                   <HeadphonesIcon className="w-4 h-4 text-muted-foreground" />
                   }
                   </div>
                   <div className={`max-w-[72%] ${msg.sender === 'publisher' ? 'items-start' : 'items-end'} flex flex-col`}>
                     <div className={`flex items-center gap-2 mb-1 ${msg.sender === 'publisher' ? '' : 'flex-row-reverse'}`}>
                       <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                       <span className="text-[11px] text-muted-foreground">
                         {new Date(msg.timestamp).toLocaleString('en-US', {
                         month: 'short',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                       </span>
                     </div>
                     <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                   msg.sender === 'publisher' ?
                   'bg-muted/60 border border-border text-foreground rounded-tl-sm' :
                   'bg-primary text-primary-foreground rounded-tr-sm'}`
                   }>
                       {msg.message}
                     </div>
                   </div>
                 </div>
               )}
             </div>
   
             {/* Reply Area */}
             {ticket.status !== 'closed' &&
             <>
                 <Separator className="my-6" />
                 <div className="space-y-3">
                   <Label>Reply to this ticket</Label>
   
                   {/* Hidden file input */}
                   <input
                   ref={fileInputRef}
                   type="file"
                   multiple
                   className="hidden"
                   onChange={handleFileChange} />
                 
   
                   {/* Message box */}
                   <div className="border border-input rounded-xl bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 overflow-hidden">
                     {/* Textarea */}
                     <textarea
                     placeholder="Type a message..."
                     value={replyMessage}
                     onChange={(e) => setReplyMessage(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSendReply();
                       }
                     }}
                     rows={1}
                     className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none px-4 pt-2.5 pb-0.5 leading-relaxed" />
                   
   
                     {/* Toolbar row */}
                     <div className="flex items-center justify-between px-3 pb-1.5 pt-0.5">
                       <div className="flex items-center gap-1">
                         {/* Attachment */}
                         <button
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                         title="Attach file">
                         
                           <PaperclipIcon className="w-4 h-4" />
                         </button>
   
                         {/* Emoji picker */}
                         <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                           <PopoverTrigger asChild>
                             <button
                             type="button"
                             className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                             title="Add emoji">
                             
                               <SmileIcon className="w-4 h-4" />
                             </button>
                           </PopoverTrigger>
                           <PopoverContent align="start" side="top" className="w-64 p-2">
                             <div className="grid grid-cols-10 gap-0.5">
                               {EMOJI_LIST.map((emoji) =>
                             <button
                               key={emoji}
                               type="button"
                               onClick={() => insertEmoji(emoji)}
                               className="text-lg w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors">
                               
                                   {emoji}
                                 </button>
                             )}
                             </div>
                           </PopoverContent>
                         </Popover>
   
                         {/* GIF button */}
                         <button
                         type="button"
                         className="flex items-center justify-center h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors text-xs font-semibold tracking-wide"
                         title="Insert GIF">
                         
                           GIF
                         </button>
                       </div>
   
                       {/* Send button */}
                       <button
                       type="button"
                       onClick={handleSendReply}
                       disabled={!replyMessage.trim() && attachments.length === 0}
                       className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-primary hover:bg-primary/10"
                       title="Send message">
                       
                         <SendIcon className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
   
                   {/* Attachment previews — below the input box */}
                   {attachments.length > 0 &&
                 <div className="flex flex-wrap gap-2">
                       {attachments.map((file, idx) =>
                   <div key={idx} className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-md px-2.5 py-1 text-xs text-foreground">
                           <PaperclipIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                           <span className="max-w-[140px] truncate">{file.name}</span>
                           <button
                       onClick={() => removeAttachment(idx)}
                       className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                       aria-label="Remove attachment">
                       
                             ×
                           </button>
                         </div>
                   )}
                     </div>
                 }
                 </div>
               </>
             }
           </CardContent>
         </Card>
       </div>);

}