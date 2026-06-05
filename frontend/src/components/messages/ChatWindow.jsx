import { useState, useEffect, useRef } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SendIcon,
  PaperclipIcon,
  SmileIcon,
  MoreVerticalIcon,
  ArrowLeftIcon,
  FileTextIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  XIcon,
  FileIcon,
  ImageIcon,
  MicIcon,
  LinkIcon,
  BellOffIcon,
  BellIcon,
  ShieldBanIcon,
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { useUserStore } from "../../stores/userStore";

const EMOJI_LIST = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "😅",
  "🙏",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "✅",
  "⚡",
  "🎉",
  "💡",
  "📎",
  "🖇️",
  "📝",
  "📌",
  "🚀",
  "💬",
  "📧",
  "🔔",
  "⭐",
  "💯",
  "🤝",
  "👋",
  "😊",
  "🙌",
];

export function ChatWindow({ className, onBack, onPublisherClick }) {
  const {
    conversations,
    selectedConversationId,
    messages,
    fetchMessages,
    sendMessage,
    activeOrderContext,
    onlineUsers,
  } = useMessageStore();
console.log("onlineUsers",onlineUsers)
  useEffect(() => {
    if (selectedConversationId && typeof selectedConversationId === "string") {
      fetchMessages(selectedConversationId);
    } else {
      console.error("Invalid Conversation ID:", selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showBlockedToast, setShowBlockedToast] = useState(false);
  const [showMutedToast, setShowMutedToast] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Access the specific messages for this chat
  const currentMessages = messages[selectedConversationId] || [];
  const { user } = useUserStore();

  const cleanDomain = activeOrderContext?.websiteId?.websiteUrl
    ? activeOrderContext.websiteId.websiteUrl
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .replace(/\/$/, "")
    : "unknown.com";

  const displayId = activeOrderContext
    ? `ORD-${new Date(activeOrderContext.createdAt).getFullYear()}-${String(activeOrderContext.orderNumber || "001").padStart(3, "0")}`
    : "ORD-000";
  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmoji]);

  // Close more menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
        setShowBlockConfirm(false);
      }
    }
    if (showMoreMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMoreMenu]);

  const handleMuteToggle = () => {
    setIsMuted((v) => !v);
    setShowMoreMenu(false);
    setShowMutedToast(true);
    setTimeout(() => setShowMutedToast(false), 2500);
  };

  const handleBlockClick = () => {
    if (isBlocked) {
      setIsBlocked(false);
      setShowMoreMenu(false);
      setShowBlockedToast(true);
      setTimeout(() => setShowBlockedToast(false), 2500);
    } else {
      setShowBlockConfirm(true);
    }
  };

  const handleBlockConfirm = () => {
    setIsBlocked(true);
    setShowMoreMenu(false);
    setShowBlockConfirm(false);
    setShowBlockedToast(true);
    setTimeout(() => setShowBlockedToast(false), 2500);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  // Mock current user data (in a real app, this would come from userStore)
  const currentUserAvatar =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=random`;
  const currentUserName = user?.fullName || "John Doe";

  const conversation = conversations.find(
    (c) => c._id === selectedConversationId,
  );
  const otherParty =
    conversation?.participants?.find((p) => p._id !== user?.id) ||
    conversation?.participants?.[0]; // Fallback if only one person exists
  console.log("selectedConversationId", selectedConversationId);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  // Animation for new messages
  useEffect(() => {
    // 'conversation?.messages?.length' check karein
    if (conversation?.messages?.length > 0) {
      const lastMessage = document.getElementById(
        `msg-${conversation.messages[conversation.messages.length - 1].id}`,
      );
      if (lastMessage) {
        gsap.fromTo(
          lastMessage,
          { opacity: 0, y: 10, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.5)" },
        );
      }
    }
  }, [conversation?.messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const hasContent = inputText.trim() || attachments.length > 0;
    if (hasContent && selectedConversationId) {
      let text = inputText.trim();
      if (attachments.length > 0 && !text) {
        text = attachments.map((f) => `📎 ${f.name}`).join("\n");
      } else if (attachments.length > 0) {
        text = text + "\n" + attachments.map((f) => `📎 ${f.name}`).join("\n");
      }
      sendMessage(selectedConversationId, text, user.id);
      setInputText("");
      setAttachments([]);
    }
  };

  if (!selectedConversationId || !conversation) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full bg-muted/10 text-center p-8",
          className,
        )}
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <SendIcon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Select a conversation
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mt-2">
          Choose a conversation from the list to view details and send messages.
        </p>
      </div>
    );
  }
  const otherPartyId = otherParty?._id;
  console.log("otherPartyId", otherPartyId);
  const isOnline = onlineUsers.includes(otherPartyId);
  console.log("isOnline",isOnline)
  return (
    <div
      className={cn("flex flex-col h-full bg-background relative", className)}
    >
      {/* Muted toast */}
      {showMutedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {isMuted ? (
            <BellOffIcon className="w-3.5 h-3.5" />
          ) : (
            <BellIcon className="w-3.5 h-3.5" />
          )}
          {isMuted ? "Notifications muted" : "Notifications unmuted"}
        </div>
      )}
      {/* Blocked toast */}
      {showBlockedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <ShieldBanIcon className="w-3.5 h-3.5" />
          {isBlocked
            ? `${conversation?.otherParty?.name} blocked`
            : `${conversation?.otherParty?.name} unblocked`}
        </div>
      )}
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        {/* Main row */}
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="md:hidden -ml-1 shrink-0 h-8 w-8"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
            )}

            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                <AvatarImage src={otherParty?.avatar} />
                <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                  {otherParty?.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>

            {/* Name + status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onPublisherClick?.(otherParty?.fullName)}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight"
                  disabled={!onPublisherClick}
                >
                  {otherParty?.fullName}
                </button>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 font-medium shrink-0 bg-primary/8 text-primary border-0"
                >
                  {otherParty?.role
                    ? otherParty.role.charAt(0).toUpperCase() +
                      otherParty.role.slice(1).toLowerCase()
                    : ""}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                {isOnline
                  ? "Active now"
                  : conversation.otherParty?.lastSeen
                    ? `Last seen ${conversation.otherParty?.lastSeen}`
                    : "Offline"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="relative" ref={moreMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowMoreMenu((v) => !v);
                  setShowBlockConfirm(false);
                }}
              >
                <MoreVerticalIcon className="w-4 h-4" />
              </Button>

              {/* Dropdown menu */}
              {showMoreMenu && (
                <div className="absolute right-0 top-10 z-50 min-w-[200px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                  {!showBlockConfirm ? (
                    <>
                      {/* Mute option */}
                      <button
                        type="button"
                        onClick={handleMuteToggle}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left"
                      >
                        {isMuted ? (
                          <>
                            <BellIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">
                                Unmute notifications
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Resume notifications for this chat
                              </p>
                            </div>
                            <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          </>
                        ) : (
                          <>
                            <BellOffIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">Mute notifications</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Stop alerts for this conversation
                              </p>
                            </div>
                          </>
                        )}
                      </button>

                      <div className="h-px bg-border mx-3" />

                      {/* Block option */}
                      <button
                        type="button"
                        onClick={handleBlockClick}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left",
                          isBlocked
                            ? "text-foreground hover:bg-muted"
                            : "text-destructive hover:bg-destructive/8",
                        )}
                      >
                        <ShieldBanIcon className="w-4 h-4 shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {isBlocked ? "Unblock user" : "Block user"}
                          </p>
                          <p
                            className={cn(
                              "text-xs mt-0.5",
                              isBlocked
                                ? "text-muted-foreground"
                                : "text-destructive/70",
                            )}
                          >
                            {isBlocked
                              ? "Allow messages from this user"
                              : "Prevent this user from messaging you"}
                          </p>
                        </div>
                        {isBlocked && (
                          <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    </>
                  ) : (
                    /* Block confirmation */
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <ShieldBanIcon className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Block {conversation.otherParty?.name}?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            They won&#39;t be able to message you
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBlockConfirm(false)}
                          className="flex-1 h-8 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleBlockConfirm}
                          className="flex-1 h-8 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order context strip */}
        {activeOrderContext && (
          <div className="flex items-center gap-0 border-t border-border/60 bg-muted/30 px-4 py-1.5 overflow-x-auto scrollbar-none">
            {/* Website */}
            <div className="flex items-center gap-1.5 shrink-0">
              <LinkIcon className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              <span className="text-[11px] font-medium text-foreground/80">
                {cleanDomain}
              </span>
            </div>
            <span className="mx-2.5 text-border select-none">|</span>
            {/* Order ID */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Order
              </span>
              <span className="text-[11px] font-mono font-semibold text-foreground/80">
                {displayId}
              </span>
            </div>
            <span className="mx-2.5 text-border select-none">|</span>
            {/* Article title */}
            <div className="flex items-center gap-1.5 min-w-0">
              <FileTextIcon className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                {activeOrderContext.submissionData?.articleTitle}
              </span>
            </div>
            <div className="ml-auto pl-3 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[10px] font-medium text-primary hover:text-primary hover:bg-primary/8 px-2 py-0"
              >
                View Order
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-muted/5">
        <div className="space-y-6 max-w-3xl mx-auto">
          {currentMessages.map((msg, index) => {
            const isMe =
              msg.senderId === user?.id || msg.senderId === user?._id;

            return (
              <div
                id={`msg-${msg.id}`}
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  // This is where the alignment happens
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto",
                )}
              >
                <div className="w-8 h-8 flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={isMe ? currentUserAvatar : otherParty?.avatar}
                    />
                    <AvatarFallback>
                      {isMe ? "ME" : otherParty?.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border",
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Professional Composer */}
      <div className="px-3 py-2 bg-card border-t border-border">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        />

        <form onSubmit={handleSend} className="w-full">
          <div className="rounded-xl border border-border bg-background focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm overflow-hidden">
            {/* ── Attachment previews ── */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-2">
                {attachments.map((file, i) => {
                  const isImage = file.type.startsWith("image/");
                  const previewUrl = isImage ? URL.createObjectURL(file) : null;
                  return (
                    <div
                      key={i}
                      className="relative group flex items-center gap-1.5 bg-muted/60 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground max-w-[160px]"
                    >
                      {isImage ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Textarea ── */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 px-3 py-2 outline-none leading-relaxed"
            />

            {/* ── Bottom action bar ── */}
            <div className="flex items-center justify-between px-2 py-1 border-t border-border/60 bg-muted/10">
              {/* Left: media / emoji / attachment */}
              <div className="flex items-center gap-0.5">
                {/* Emoji */}
                <div className="relative" ref={emojiRef}>
                  <button
                    type="button"
                    title="Emoji"
                    onClick={() => setShowEmoji((v) => !v)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
                      showEmoji && "bg-muted text-primary",
                    )}
                  >
                    <SmileIcon className="w-4 h-4" />
                  </button>
                  {showEmoji && (
                    <div className="absolute bottom-10 left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-3 w-[228px]">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Emoji
                      </p>
                      <div className="grid grid-cols-6 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="text-xl leading-none p-1 rounded hover:bg-muted transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attach file */}
                <button
                  type="button"
                  title="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <PaperclipIcon className="w-4 h-4" />
                </button>

                {/* Image */}
                <button
                  type="button"
                  title="Attach image"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Voice note */}
                <button
                  type="button"
                  title="Record voice note"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MicIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Right: hint + send */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-[10px] text-muted-foreground/60 select-none">
                  Shift+Enter for new line
                </span>
                <button
                  type="submit"
                  disabled={!inputText.trim() && attachments.length === 0}
                  className={cn(
                    "flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-semibold transition-all",
                    inputText.trim() || attachments.length > 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <SendIcon className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
