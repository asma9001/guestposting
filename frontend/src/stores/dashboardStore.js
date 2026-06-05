import { create } from "zustand";
import api from "../lib/api";

export const useDashboardStore = create((set) => ({
  orderStats: { requests: 0, inProgress: 0, completed: 0, cancelled: 0 },
  isLoading: false,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchQuery: "",
  
  orders: [],
  chartPeriod: 'weekly',
  setChartPeriod: (period) => set({ chartPeriod: period }),
  weeklyChartData: [],
  monthlyChartData: [],

  faqEntries: [
    {
      id: "FAQ-001",
      question: "What is Countlink?",
      answer:
        "Countlink is a content marketing platform which connects brands and agencies with publishers (editors, bloggers, influencers, journalists, and more!)",
      isOpen: true,
    },
    {
      id: "FAQ-002",
      question: "What's the purpose of Countlink?",
      answer:
        "Countlink aims to simplify the guest posting process by connecting content creators with high-quality publishers, making it easier to build backlinks and increase online visibility.",
      isOpen: false,
    },
    {
      id: "FAQ-003",
      question:
        "What are the advantages for advertisers while using Countlink?",
      answer:
        "Advertisers benefit from access to a curated network of publishers, transparent pricing, quality assurance, and streamlined communication throughout the guest posting process.",
      isOpen: false,
    },
    {
      id: "FAQ-004",
      question:
        "How do publishers earn money? (bloggers, journalists, influencers and editors)",
      answer:
        "Publishers earn money by accepting guest posts on their platforms. They set their own rates and receive payment once the content is published and approved.",
      isOpen: false,
    },
    {
      id: "FAQ-005",
      question: "Can I be an advertiser and a publisher at the same time?",
      answer:
        "Yes! You can have both roles on Countlink. You can publish guest posts on your own sites while also purchasing guest post opportunities on other platforms.",
      isOpen: false,
    },
    {
      id: "FAQ-006",
      question: "How do we pay?",
      answer:
        "We accept various payment methods including credit cards, PayPal, and bank transfers. All transactions are secure and processed through encrypted payment gateways.",
      isOpen: false,
    },
    {
      id: "FAQ-007",
      question: "Are the earnings that appear in my wallet net?",
      answer:
        "The earnings shown in your wallet are gross amounts. Platform fees and any applicable taxes will be deducted during the withdrawal process.",
      isOpen: false,
    },
    {
      id: "FAQ-008",
      question: "What is the minimum payment?",
      answer:
        "The minimum withdrawal amount is $50. Once you reach this threshold, you can request a payout to your preferred payment method.",
      isOpen: false,
    },
    {
      id: "FAQ-009",
      question: "I'm interested! How can I start?",
      answer:
        "Getting started is easy! Simply sign up for an account, complete your profile, and you can immediately start browsing opportunities or listing your own publishing sites.",
      isOpen: false,
    },
  ],
  // API Call function
 fetchOrderStats: async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      // Backend se jo data aa raha hai use store mein set karein
      set({ 
        weeklyChartData: res.data.weekly,
        monthlyChartData: res.data.monthly || [] 
      });
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  },
  // Add this inside your useDashboardStore
fetchRecentOrders: async () => {
    try {
      const res = await api.get("/api/orders/my-orders");
      // Agar API response mein data array ke andar hai (e.g. res.data.orders) 
      // toh wahi set karein. Agar seedha array hai, toh res.data.
      const ordersData = Array.isArray(res.data) ? res.data : (res.data.orders || []);
      set({ orders: ordersData });
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      set({ orders: [] }); // Error hone par bhi array return karein
    }
  },
  toggleFAQ: (id) =>
    set((state) => ({
      faqEntries: state.faqEntries.map((faq) =>
        faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq,
      ),
    })),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setChartPeriod: (period) => set({ chartPeriod: period }),
  addIncomingOrder: (order) =>
    set((state) => ({
      incomingOrders: [order, ...state.incomingOrders].slice(0, 10),
    })),
}));
