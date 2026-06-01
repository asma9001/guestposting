import { create } from 'zustand';


















































export const useDashboardStore = create((set) => ({
  
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchQuery: '',
  chartPeriod: 'weekly',
  orders: [
  { id: 'GP-001', websiteName: 'TechCrunch.com', status: 'completed', dueDate: '2024-01-20', finishedDate: '2024-01-22', normalPrice: 250, writingPrice: 150 },
  { id: 'GP-002', websiteName: 'Forbes.com', status: 'processing', dueDate: '2024-01-22', normalPrice: 500, writingPrice: 200, isDedicatedTopic: true },
  { id: 'GP-003', websiteName: 'Entrepreneur.com', status: 'pending', dueDate: '2024-01-25', normalPrice: 350, writingPrice: 180 },
  { id: 'GP-004', websiteName: 'BusinessInsider.com', status: 'completed', dueDate: '2024-01-18', finishedDate: '2024-01-21', normalPrice: 400, writingPrice: 220, isDedicatedTopic: true },
  { id: 'GP-005', websiteName: 'Mashable.com', status: 'processing', dueDate: '2024-01-23', normalPrice: 300, writingPrice: 160 },
  { id: 'GP-006', websiteName: 'TheVerge.com', status: 'completed', dueDate: '2024-01-19', finishedDate: '2024-01-20', normalPrice: 450, writingPrice: 190, isDedicatedTopic: true },
  { id: 'GP-007', websiteName: 'Wired.com', status: 'cancelled', dueDate: '2024-01-21', finishedDate: '2024-01-23', normalPrice: 380, writingPrice: 170 },
  { id: 'GP-008', websiteName: 'Medium.com', status: 'completed', dueDate: '2024-01-17', finishedDate: '2024-01-19', normalPrice: 200, writingPrice: 120 }],

  incomingOrders: [
  { id: 'NEW-001', customer: 'Robert Garcia', amount: 179.99, time: '2 min ago' },
  { id: 'NEW-002', customer: 'Maria Rodriguez', amount: 299.99, time: '5 min ago' },
  { id: 'NEW-003', customer: 'William Lee', amount: 129.99, time: '8 min ago' }],

  orderStats: {
    requests: 45,
    inProgress: 23,
    completed: 187,
    cancelled: 8
  },
  faqEntries: [
  { id: 'FAQ-001', question: 'What is Countlink?', answer: 'Countlink is a content marketing platform which connects brands and agencies with publishers (editors, bloggers, influencers, journalists, and more!)', isOpen: true },
  { id: 'FAQ-002', question: "What's the purpose of Countlink?", answer: 'Countlink aims to simplify the guest posting process by connecting content creators with high-quality publishers, making it easier to build backlinks and increase online visibility.', isOpen: false },
  { id: 'FAQ-003', question: 'What are the advantages for advertisers while using Countlink?', answer: 'Advertisers benefit from access to a curated network of publishers, transparent pricing, quality assurance, and streamlined communication throughout the guest posting process.', isOpen: false },
  { id: 'FAQ-004', question: 'How do publishers earn money? (bloggers, journalists, influencers and editors)', answer: 'Publishers earn money by accepting guest posts on their platforms. They set their own rates and receive payment once the content is published and approved.', isOpen: false },
  { id: 'FAQ-005', question: 'Can I be an advertiser and a publisher at the same time?', answer: 'Yes! You can have both roles on Countlink. You can publish guest posts on your own sites while also purchasing guest post opportunities on other platforms.', isOpen: false },
  { id: 'FAQ-006', question: 'How do we pay?', answer: 'We accept various payment methods including credit cards, PayPal, and bank transfers. All transactions are secure and processed through encrypted payment gateways.', isOpen: false },
  { id: 'FAQ-007', question: 'Are the earnings that appear in my wallet net?', answer: 'The earnings shown in your wallet are gross amounts. Platform fees and any applicable taxes will be deducted during the withdrawal process.', isOpen: false },
  { id: 'FAQ-008', question: 'What is the minimum payment?', answer: 'The minimum withdrawal amount is $50. Once you reach this threshold, you can request a payout to your preferred payment method.', isOpen: false },
  { id: 'FAQ-009', question: "I'm interested! How can I start?", answer: 'Getting started is easy! Simply sign up for an account, complete your profile, and you can immediately start browsing opportunities or listing your own publishing sites.', isOpen: false }],

  toggleFAQ: (id) => set((state) => ({
    faqEntries: state.faqEntries.map((faq) =>
    faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
    )
  })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setChartPeriod: (period) => set({ chartPeriod: period }),
  addIncomingOrder: (order) => set((state) => ({
    incomingOrders: [order, ...state.incomingOrders].slice(0, 10)
  }))
}));