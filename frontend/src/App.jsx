import { LoginPage } from "@/components/auth/LoginPage";
import { SignupPage } from "@/components/auth/SignupPage";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileMenu } from "@/components/MobileMenu";
import { useWindowSize } from "@/hooks/use-mobile";
import { OrderStatusCards } from "@/components/OrderStatusCards";
import { OrdersByDateChart } from "@/components/OrdersByDateChart";
import { QAStatisticsChart } from "@/components/QAStatisticsChart";
import { OrdersTable } from "@/components/OrdersTable";
import { VideoSection } from "@/components/VideoSection";
import { Footer } from "@/components/Footer";
import { ProfileSection } from "@/components/ProfileSection";
import { WalletContainer } from "@/components/wallet/WalletContainer";
import { toast, Toaster } from "sonner";

import { SupportCenter } from "@/components/support/SupportCenter";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { CataloguePage } from "@/components/catalogue/CataloguePage";
import { MyPortalsPage } from "@/components/MyPortalsPage";
import { SalesPurchasesPage } from "@/components/SalesPurchasesPage";
import { CartPage } from "@/components/cart/CartPage";
import { MessagesPage } from "@/components/messages/MessagesPage";
import { useMessageStore } from "@/stores/messageStore";
import { OrderConfirmationPage } from "@/components/cart/OrderConfirmationPage";
import { PublicProfilePage } from "@/components/profile/PublicProfilePage";
import { PublisherProfilePage } from "@/components/profile/PublisherProfilePage";
import { RatingsPage } from "@/components/profile/RatingsPage";
import { ProjectsPage } from "@/components/projects/ProjectsPage";
import { LeaveFeedbackPage } from "@/components/sales/LeaveFeedbackPage";
import { CreateProjectPage } from "@/components/projects/CreateProjectPage";
import { ProjectDetailsPage } from "@/components/projects/ProjectDetailsPage";
import { WebsiteDetailsPage } from "@/components/catalogue/WebsiteDetailsPage";
import { WebsiteOrdersPage } from "@/components/portals/WebsiteOrdersPage";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LiveChatWidget } from "@/components/livechat/LiveChatWidget";
import { socket } from "@/lib/socket";
import { io } from "socket.io-client";
import { useNotificationStore } from "./stores/notificationStore";

function App() {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [isSignup, setIsSignup] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const { sidebarCollapsed } = useDashboardStore();
  const { isMobile } = useWindowSize();
  const {
    role,
    switchRole,
    restoreSession,
    isLoading: authLoading,
  } = useUserStore();

  const handleLogin = (accessToken, role) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", role);
    setToken(accessToken); // 🔥 IMPORTANT
    switchRole(role);
    setAuthView("app");
  };
  // ----------------------------
  // SIGNUP
  // ----------------------------
  const handleSignup = (accessToken, selectedRole) => {
    // 1. Storage update
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", selectedRole);

    // 2. States update
    setToken(accessToken);
    switchRole(selectedRole);

    setCurrentView("dashboard");
    setAuthView("app");
    // ✅ Ye line zaroori hai
  };
  const handleAuthSuccess = (accessToken, role) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", role);
    switchRole(role);
    setToken(accessToken); // 🔥 Ye change hote hi app re-render hogi aur Dashboard dikh jayega
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    setToken(null);
    switchRole(null);
  };

  const { selectConversation, openConversationForOrder } = useMessageStore();

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
  const [selectedWebsiteDomain, setSelectedWebsiteDomain] = useState(null);
  const [showEmptyPurchases, setShowEmptyPurchases] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [walletInitialPage, setWalletInitialPage] = useState(undefined);
  const [catalogueShowFavorites, setCatalogueShowFavorites] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const user = useUserStore((state) => state.user);
  console.log("role", role);

console.log("User Data:", user);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;

    if (socket.connected) return;

    console.log("🛠 Connecting socket for user:", user.id);

    socket.auth = {
      token: localStorage.getItem("accessToken"),
      userId: user.id,
    };
    socket.connect();

    const handleNewNotification = (notif) => {
      useNotificationStore.getState().addNotification(notif);

      toast(`New Message`, {
        description: notif.message,
        action: {
          label: "View Chat",
          onClick: () => {
            handleMessagesClick(notif.conversationId);
          },
        },
      });
    };
const handleNewMessage = (msg) => {
  const { 
    selectedConversationId, 
    addMessage, 
    incrementUnreadCount // 1. Ensure this is pulled from your store
  } = useMessageStore.getState();

  // 2. Add message to the store list
  addMessage(msg);

  // 3. Only increment count if the user is NOT looking at this specific chat
  if (selectedConversationId !== msg.conversationId) {
    incrementUnreadCount(); // 🔥 This is the call you were missing
    
    // Optional: Only show toast if not in chat
    toast(`New Message`, {
      description: "You have a new message.",
      action: {
        label: "Reply",
        onClick: () => handleMessagesClick(msg.conversationId),
      },
    });
  }
};
    const handleGetOnlineUsers = (users) => {
      console.log("👥 Online Users Received:", users);
      useMessageStore.getState().setOnlineUsers(users);
    };

    socket.on("connect", () => console.log("✅ Socket connected"));
    socket.on("new_notification", handleNewNotification);
    socket.on("new_message", handleNewMessage);
    socket.on("getOnlineUsers", handleGetOnlineUsers);
    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("new_message", handleNewMessage);
      socket.off("getOnlineUsers", handleGetOnlineUsers);
    };
  }, [user?.id]);

useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAuthReady(true);
      return;
    }

    try {
      // 1. Fetch the user profile
      const userProfile = await useUserStore.getState().fetchProfile();
      
      // 2. IMPORTANT: Sync the role from the fetched profile, not just localStorage
      if (userProfile && userProfile.role) {
        useUserStore.getState().switchRole(userProfile.role);
        localStorage.setItem("role", userProfile.role);
      }
    } catch (err) {
      console.error("Auth session restore failed");
    } finally {
      setAuthReady(true);
    }
  };

  initAuth();
}, []);

  const handleMyProfileClick = () => {
    setCurrentView("profile");
  };

  // Function to handle wallet navigation
  const handleWalletClick = () => {
    setWalletInitialPage(undefined);
    setCurrentView("wallet");
  };

  // Function to navigate directly to payment accounts (payout methods)
  const handlePaymentAccountsClick = () => {
    setWalletInitialPage("payout-methods");
    setCurrentView("wallet");
  };

  // Function to handle support navigation
  const handleSupportClick = () => {
    setCurrentView("support");
  };

  // Function to handle notifications navigation
  const handleNotificationsClick = () => {
    setCurrentView("notifications");
  };

  // Function to handle catalogue navigation (Advertiser only)
  const handleCatalogueClick = () => {
    setCatalogueShowFavorites(false);
    setCurrentView("catalogue");
  };

  // Function to navigate to catalogue with Favorites filter pre-enabled
  const handleFavoritesClick = () => {
    if (role === "advertiser") {
      setCatalogueShowFavorites(true);
      setCurrentView("catalogue");
    }
  };

  // Function to handle projects navigation (Advertiser only)
  // Is function ko dhoond kar aise badlein:
  const handleProjectsClick = () => {
    // Agar check lagana hai toh check karein console.log(role) karke ki role kya aa raha hai
    setCurrentView("projects");
  };

  // Function to handle create project navigation
  const handleCreateProjectClick = () => {
    setCurrentView("create-project");
  };

  // Function to handle view project navigation
  const handleViewProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView("project-details");
  };

  // Function to handle website details navigation
  const handleWebsiteClick = (websiteId) => {
    setSelectedWebsiteId(websiteId);
    setCurrentView("website-details");
  };

  // Function to handle my portals navigation (Publisher only)
  const handleMyPortalsClick = () => {
    setCurrentView("my-portals");
  };

  // Function to handle website orders navigation
  const handleViewWebsiteOrders = (domain) => {
    setSelectedWebsiteDomain(domain);
    setCurrentView("website-orders");
  };

  // Function to handle sales navigation (Publisher only)
  const handleSalesClick = () => {
    setCurrentView("sales");
  };

  // Function to handle purchases navigation (Advertiser only)
  const handlePurchasesClick = () => {
    setCurrentView("purchases");
    setShowEmptyPurchases(false);
  };

  // Function to show empty purchases state
  const handleShowEmptyPurchases = () => {
    setShowEmptyPurchases(true);
  };

  // Function to handle cart navigation
  const handleCartClick = () => {
    setCurrentView("cart");
  };

  // Function to handle messages navigation
  // Update this in your App.jsx methods
  const handleMessagesClick = (conversationId) => {
    if (conversationId) {
      selectConversation(conversationId);
    }
    setCurrentView("messages");
  };
  // Function to handle navigation from order confirmation
  const handleOrderConfirmationNavigate = (page) => {
    if (page === "purchases") {
      setCurrentView("purchases");
    } else if (page === "catalogue") {
      setCurrentView("catalogue");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handlePublicProfileClick = (name) => {
    setSelectedProfile(name);
    setCurrentView("public-profile");
  };

  const handlePublisherProfileClick = (name) => {
    setSelectedPublisher(name);
    setCurrentView("publisher-profile");
  };

  const handleRatingsClick = (name) => {
    setSelectedPublisher(name);
    setCurrentView("ratings");
  };

  if (!authReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          className="animate-spin w-8 h-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }
  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
            <div className="pt-1 md:pt-2">
              <h1 className="text-xl sm:text-2xl font-medium text-foreground mb-0.5">
                Guest Posting Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your guest post orders, track performance, and monitor
                Q&amp;A activity
              </p>
            </div>
            <OrderStatusCards />
            <OrdersTable
              onOpenChat={(id) => {
                selectConversation(id);
                setCurrentView("messages");
              }}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OrdersByDateChart />
              <VideoSection />
            </div>
            <QAStatisticsChart />
          </div>
        );
      case "order-confirmation":
        return (
          <OrderConfirmationPage
            orderDetails={lastOrder}
            onNavigate={handleOrderConfirmationNavigate}
          />
        );
      case "profile":
        return <ProfileSection onBack={() => setCurrentView("dashboard")} />;
      case "wallet":
        return <WalletContainer initialPage={walletInitialPage} />;
      case "notifications":
        return <NotificationsPage />;
      case "projects":
        return (
          <ProjectsPage
            onCreateProject={handleCreateProjectClick}
            onViewProject={handleViewProjectClick}
          />
        );
      case "create-project":
        return (
          <CreateProjectPage
            onCancel={() => setCurrentView("projects")}
            onComplete={() => setCurrentView("projects")}
          />
        );
      case "project-details":
        return (
          <ProjectDetailsPage
            projectId={selectedProjectId}
            onBack={() => setCurrentView("projects")}
          />
        );
      case "catalogue":
        return (
          <CataloguePage
            key={catalogueShowFavorites ? "fav" : "all"}
            onWebsiteClick={handleWebsiteClick}
            onPublisherClick={handlePublisherProfileClick}
            initialShowFavorites={catalogueShowFavorites}
          />
        );

      case "website-details":
        return (
          <WebsiteDetailsPage
            websiteId={selectedWebsiteId}
            onBack={() => setCurrentView("catalogue")}
            onPublisherClick={handlePublisherProfileClick}
          />
        );
      case "my-portals":
        return (
          <MyPortalsPage
            onViewWebsiteOrders={(domain) => {
              setSelectedWebsiteDomain(domain);
              setCurrentView("website-orders");
            }}
          />
        );
      case "website-orders":
        return (
          <WebsiteOrdersPage
            websiteDomain={selectedWebsiteDomain}
            onBack={() => setCurrentView("my-portals")}
          />
        );
      case "sales":
        return (
          <SalesPurchasesPage
            onProfileClick={handlePublicProfileClick}
            onLeaveFeedback={(order) => {
              setFeedbackOrder(order);
              setCurrentView("leave-feedback");
            }}
            // Pass the unified handler
            onMessagesClick={(orderId) => {
              const conversation = useMessageStore
                .getState()
                .conversations.find((c) => c.orderId === orderId);

              // This will now select the conversation (if found) and switch view
              handleMessagesClick(conversation?.id);
            }}
            onNavigateToMessages={(convId) => handleMessagesClick(convId)}
          />
        );
      case "cart":
        return (
          <CartPage
            setLastOrder={setLastOrder}
            onNavigate={(page) => setCurrentView(page)}
          />
        );
      case "purchases":
        return (
          <SalesPurchasesPage
            onLeaveFeedback={(order) => {
              setFeedbackOrder(order);
              setCurrentView("leave-feedback");
            }}
            onNavigateToMessages={async (convId) => {
              // 1. Force the store to set the ID
              useMessageStore.getState().selectConversation(convId);

              // 2. IMPORTANT: If you have a fetch function, call it here
              // to ensure the data exists before the chat window loads
              await useMessageStore.getState().fetchMessages(convId);

              // 3. Switch the view - the useEffect in MessagesPage will
              // automatically trigger the 'chat' view for you!
              setCurrentView("messages");
            }}
          />
        );
      case "leave-feedback":
        return (
          <LeaveFeedbackPage
            order={feedbackOrder}
            role={role}
            onBack={() =>
              setCurrentView(role === "advertiser" ? "purchases" : "sales")
            }
            onSubmit={() =>
              setCurrentView(role === "advertiser" ? "purchases" : "sales")
            }
          />
        );
      case "messages":
        return <MessagesPage />;
      default:
        return <SupportCenter />;
    }
  };

  // 2. Auth state (Agar token nahi hai)
  if (!token) {
    return (
      <>
        <Toaster position="top-right" richColors />
        {isSignup ? (
          <SignupPage
            onSignup={handleAuthSuccess}
            onNavigateToLogin={() => setIsSignup(false)}
          />
        ) : (
          <LoginPage
            onLogin={handleAuthSuccess}
            onNavigateToSignup={() => setIsSignup(true)}
          />
        )}
      </>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" richColors />

        <Sidebar
          onHomeClick={() => setCurrentView("dashboard")}
          onWalletClick={handleWalletClick}
          onSupportClick={handleSupportClick}
          onCatalogueClick={handleCatalogueClick}
          onMyPortalsClick={handleMyPortalsClick}
          onSalesClick={handleSalesClick}
          onPurchasesClick={handlePurchasesClick}
          onProjectsClick={handleProjectsClick}
        />

        <MobileMenu
          onHomeClick={() => setCurrentView("dashboard")}
          onWalletClick={handleWalletClick}
          onSupportClick={handleSupportClick}
          onCatalogueClick={handleCatalogueClick}
          onMyPortalsClick={handleMyPortalsClick}
          onSalesClick={handleSalesClick}
          onPurchasesClick={handlePurchasesClick}
          onProjectsClick={handleProjectsClick}
        />

        <Header
          onProfileClick={handleMyProfileClick}
          onNotificationsClick={handleNotificationsClick}
          onCartClick={handleCartClick}
          onMessagesClick={handleMessagesClick}
          onWalletClick={handleWalletClick}
          onPaymentAccountsClick={handlePaymentAccountsClick}
          onFavoritesClick={handleFavoritesClick}
          onLogout={handleLogout}
        />

        <main
          className="pt-20 sm:pt-22 pb-8 px-3 sm:px-4 md:px-6 transition-all duration-300 min-w-0"
          style={{
            marginLeft: isMobile ? "0px" : sidebarCollapsed ? "80px" : "240px",
            width: isMobile
              ? "100%"
              : sidebarCollapsed
                ? "calc(100% - 80px)"
                : "calc(100% - 240px)",
          }}
        >
          {renderContent()}
        </main>

        <Footer />
        <LiveChatWidget />
      </div>
    </TooltipProvider>
  );
}

export default App;
