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


  getAuthConfig: () => {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  },

  getTickets: async () => {
    try {
      const config = get().getAuthConfig();
      const res = await ticketAPI.getAll(config);
      set({ tickets: res.data.tickets || [] });
    } catch (err) {
      console.error("Get tickets error:", err);
    }
  },


createTicket: async (formDataOrJson) => {
    try {
     
      const isFormData = formDataOrJson instanceof FormData;
      const config = get().getAuthConfig(isFormData);
      const res = await ticketAPI.create(formDataOrJson, config);
      const newTicket = res.data.ticket;
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
      }));
      return newTicket;
    } catch (err) {
      console.error("Create ticket error:", err);
      throw err;
    }
  },

 
  addMessage: async (ticketId, message) => {
    try {
      const config = get().getAuthConfig();
      const res = await ticketAPI.addMessage(ticketId, { message }, config);
      const updatedTicket = res.data.ticket;
      set((state) => ({
        tickets: state.tickets.map((t) =>
          t._id === ticketId ? updatedTicket : t
        ),
       
        selectedTicket: state.selectedTicket?._id === ticketId ? updatedTicket : state.selectedTicket
      }));
      return updatedTicket;
    } catch (err) {
      console.error("Add message error:", err);
      throw err;
    }
  }
}));