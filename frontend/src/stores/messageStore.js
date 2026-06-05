import { create } from "zustand";
import api from "@/lib/api";

export const useMessageStore = create((set, get) => ({
  conversations: [],
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  messages: {},
  activeOrderContext: null,
  setActiveOrderContext: (order) => set({ activeOrderContext: order }),
  selectedConversationId: null,
  totalUnread: 0,
  // ...
  incrementUnreadCount: () =>
    set((state) => ({ totalUnread: state.totalUnread + 1 })),
  setUnreadCount: (count) => set({ totalUnread: count }),
  selectConversation: (id) => set({ selectedConversationId: id }),

  fetchConversations: async () => {
    try {
      const { data } = await api.get("/api/messages/conversations");
      set({ conversations: data });

      // Agar koi conversation nahi hai, to kuch na karein
      // Agar conversations hain, to pehli wali select karein
      if (data.length > 0) {
        set({ selectedConversationId: data[0]._id });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  },

  // 2. Specific chat ke messages fetch karein
  fetchMessages: async (conversationId) => {
    try {
      const { data } = await api.get(`/api/messages/${conversationId}`);
      set((state) => ({
        messages: { ...state.messages, [conversationId]: data },
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  },
  sendMessage: async (conversationId, text, senderId) => {
    // 1. Get the current conversation to find the receiver
    const { conversations } = get();
    const conversation = conversations.find((c) => c._id === conversationId);

    // 2. Derive receiverId from participants
    const receiverId = conversation?.participants?.find(
      (p) => p._id !== senderId,
    )?._id;

    const tempId = Date.now().toString();
    const tempMessage = { id: tempId, senderId, text, temp: true };

    // Optimistic UI update
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          tempMessage,
        ],
      },
    }));

    try {
      const { data } = await api.post("/api/messages/send", {
        conversationId,
        receiverId, // Now correctly defined
        text,
        senderId,
      });

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg.id === tempId ? data : msg,
          ),
        },
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      // Optional: Remove temp message on failure
    }
  },
  addMessage: (newMessage) => {
    set((state) => {
      const conversationId = newMessage.conversationId;

      // Agar wo conversation exist karti hai, toh messages update karo
      // Agar nahi karti, toh naya array create karo
      const existingMessages = state.messages[conversationId] || [];

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, newMessage],
        },
      };
    });
  },
}));
