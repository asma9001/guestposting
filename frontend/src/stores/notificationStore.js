import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
 addNotification: (notif) => set((state) => {
    console.log("Adding notification to store:", notif); // 🔥 YE CHECK KAREIN
    return {
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  setNotifications: (data) =>
    set({
      notifications: data,
      unreadCount: data.filter((n) => !n.isRead).length,
    }),

 

  markAsRead: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.filter((n) => n.id !== id && !n.isRead)
        .length,
    })),
}));
