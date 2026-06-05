import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, {
  authApi,
  setTokens,
  clearTokens,
  getAccessToken,
} from "@/lib/api";
import { useSupportStore } from "@/stores/supportStore";
import io from "socket.io-client";

export const useUserStore = create()(
  persist(
    (set, get) => ({
      role: null,
      user: null,
      isLoading: false,
      error: null,

      switchRole: (role) => set({ role }),

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login({ email, password });
          setTokens(res.token);
          api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

          await get().fetchProfile();
          await useSupportStore.getState().getTickets();

          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false, error: "Login failed" });
          return { success: false };
        }
      },

      logout: () => {
        clearTokens();
        delete api.defaults.headers.common["Authorization"];
        set({ user: null, role: null });
        localStorage.removeItem("user-storage");
        // Socket disconnect hum App.jsx mein handle karenge
      },
      restoreSession: async () => {
        const token = getAccessToken();
        if (!token) {
          set({ user: null, role: "advertiser", isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          await get().fetchProfile();
          get().connectSocket(); // Re-establish socket on session restore
        } catch (err) {
          set({ user: null, role: "advertiser", isLoading: false });
        }
      },
      fetchProfile: async () => {
        try {
          const res = await api.get("/api/auth/me");
          const u = res.data?.data?.user || res.data;
          const updatedRole = u.role || "advertiser";
          set({
            user: { id: u._id || u.id, fullName: u.fullName, email: u.email },
            role: updatedRole,
          });
        } catch (err) {
          set({ user: null });
        }
      },
    }),
    {
      name: "user-storage",
     migrate: (persistedState, version) => {
        if (version === 0) {
          // Agar purana version hai toh role ko null reset kar do
          return { ...persistedState, role: null };
        }
        return persistedState;
      },
    },
  ),
);
