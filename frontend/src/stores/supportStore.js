import { create } from "zustand";
import { ticketAPI } from "../services/ticketApi";

export const useSupportStore = create((set, get) => ({
  tickets: [],
  selectedTicket: null,
  searchQuery: "",
  statusFilter: "all",

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  setSearchQuery: (val) => set({ searchQuery: val }),
  setStatusFilter: (val) => set({ statusFilter: val }),

  // Helper to generate the auth header config dynamically
  getAuthConfig: () => {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  },

  // GET TICKETS
  getTickets: async () => {
    try {
      const config = get().getAuthConfig();
      const res = await ticketAPI.getAll(config);
      set({ tickets: res.data.tickets || [] });
    } catch (err) {
      console.error("Get tickets error:", err);
    }
  },

  // CREATE TICKET
createTicket: async (formDataOrJson) => {
    try {
      // Check karte hain agar data FormData hai to us hisab se header banyein
      const isFormData = formDataOrJson instanceof FormData;
      const config = get().getAuthConfig(isFormData);
      
      const res = await ticketAPI.create(formDataOrJson, config);
      const newTicket = res.data.ticket;

      // Update UI instantly
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
      }));

      return newTicket;
    } catch (err) {
      console.error("Create ticket error:", err);
      throw err;
    }
  },

  // ADD MESSAGE
  addMessage: async (ticketId, message) => {
    try {
      const config = get().getAuthConfig();
      // Passing message body and config headers
      const res = await ticketAPI.addMessage(ticketId, { message }, config);
      const updatedTicket = res.data.ticket;

      set((state) => ({
        tickets: state.tickets.map((t) =>
          t._id === ticketId ? updatedTicket : t
        ),
        // Keep the selected ticket view in sync if it's the one currently open
        selectedTicket: state.selectedTicket?._id === ticketId ? updatedTicket : state.selectedTicket
      }));

      return updatedTicket;
    } catch (err) {
      console.error("Add message error:", err);
      throw err;
    }
  }
}));