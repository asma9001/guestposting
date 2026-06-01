import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { authApi, setTokens, clearTokens, getAccessToken } from "@/lib/api";
import { useSupportStore } from "@/stores/supportStore"; // 🔥 Safe connection for tickets data

export const useUserStore = create()(
  persist(
    (set, get) => ({
      // ── STATE ──
      role: "advertiser", // Default fallback role
      user: null,
      fullName: "",
      isLoading: false,
      error: null,
      errorMessage: null,

      switchRole: (role) => set({ role }),

      // ── LOGIN (Optimized & Fixed Role Sync) ──
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          const res = await authApi.login({ email, password });

          // 1. LocalStorage mein token save karein
          setTokens(res.token);
          console.log("✅ TOKEN SET IN LOCALSTORAGE:", res.token);

          // 2. Interceptor ke data fetch karne se pehle defaults update karein
          api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

          console.log("🔄 Fetching user profile details...");
          
          // 3. Profile data fetch karein (Iske andar set() laga hua hai jo role update karega)
          const profile = await get().fetchProfile();
          
          // 4. Background mein bina delay ke tickets fetch karwadein naye token ke sath
          try {
            await useSupportStore.getState().getTickets();
          } catch (ticketErr) {
            console.error("⚠️ Background ticket fetch failed but login proceeding:", ticketErr);
          }

          set({ isLoading: false });
          
          // Profile update hone ke baad response return karein taaki layout change ho sake
          return { 
            success: true, 
            token: res.token, 
            role: profile?.role || "advertiser" 
          };

        } catch (err) {
          console.error("❌ Login action sequence failed:", err);
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || err?.message || "Login failed" 
          });
          return { success: false, error: err };
        }
      },

      // ── SIGNUP ──
    signup: async (credentials) => {
  set({ isLoading: true, error: null });
  try {
    const res = await authApi.signup(credentials);
    
    // Sirf token set karein
    setTokens(res.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
    
    set({ isLoading: false });
    // Sirf success return karein, profile fetch yahan na karein
    return { success: true, token: res.token, role: credentials.role };
  } catch (err) {
    set({ isLoading: false, error: err.response?.data?.message });
    return { success: false, error: err };
  }
},

      // ── LOGOUT (Clean and Reset Everything) ──
      logout: () => {
        clearTokens();
        // Authorization header ko hamesha ke liye delete karein
        delete api.defaults.headers.common["Authorization"];
        set({ user: null, role: "advertiser", error: null, errorMessage: null });
        localStorage.removeItem("user-storage");
      },

      // ── SMART RESTORE SESSION ──
     // ── SMART RESTORE SESSION (FIXED) ──
restoreSession: async () => {
  const token = getAccessToken();
  if (!token) {
    // Agar token hi nahi hai, to state ko clear karein taaki purana cache clean ho jaye
    set({ user: null, role: "advertiser", isLoading: false });
    return;
  }

  try {
    set({ isLoading: true });
    // Hamesha fresh profile fetch karein taaki active logged-in account ka data hi load ho
    await get().fetchProfile();
  } catch (err) {
    console.error("❌ Session restoration failed:", err);
    set({ user: null, role: "advertiser", isLoading: false });
  }
},

      // ── FETCH FULL PROFILE (Atomic Updates) ──
      fetchProfile: async () => {
        console.log("🚀 fetchProfile CALLED");
        try {
          const res = await api.get("/api/auth/me");
          console.log("✅ Profile data fetched from server:", res.data);

          const u = res.data?.data?.user || res.data?.user || res.data;

          if (!u || typeof u !== "object") {
            throw new Error("Could not find user object structure in payload.");
          }

          const updatedRole = u.role || "advertiser";

          // 🚨 CRITICAL FIX: Pure object ko ek sath set karein taaki persist middleware 
          // direct changes ko detect karke local storage mein likh de.
          set({
            user: {
              id: u._id || u.id, 
              fullName: u.fullName || "",
              email: u.email || "",
              role: updatedRole,
              avatar: u.avatar || "",
              phone: u.phone || "",
              phoneCode: u.phoneCode || "",
              timezone: u.timezone || "",
              walletBalance: u.walletBalance ?? 0,
              onHoldAmount: u.onHoldAmount ?? 0,
              awaitingClearanceAmount: u.awaitingClearanceAmount ?? 0,
              membershipTier: u.membershipTier || "",
              business: u.business || null,
              paymentMethods: u.paymentMethods || [],
              averageRating: u.averageRating ?? 0,
              totalReviews: u.totalReviews ?? 0,
            },
            role: updatedRole, // 👈 Dashboard layout toggle isi key par base karta hai
            isLoading: false,
            error: null,
          });

          // Return extracted values in case layout functions need them on-the-fly
          return { user: u, role: updatedRole };

        } catch (err) {
          console.error("❌ fetchProfile CRASHED inside catch block:", err.response?.data || err.message);
          set({ 
            isLoading: false, 
            error: err.response?.data?.message || err.message || "Failed to fetch profile"
          });
          return null;
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ role: state.role, user: state.user }),
    },
  ),
);