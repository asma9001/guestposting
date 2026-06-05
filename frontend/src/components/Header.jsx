import {
  BellIcon,
  MessageSquareIcon,
  MenuIcon,
  WalletIcon,
  RepeatIcon,
  ShoppingCartIcon,
  HeartIcon,
  GlobeIcon,
  UserIcon,
  LogOutIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  CreditCardIcon,
  LockIcon,
  HourglassIcon,
} from "lucide-react";

import { useWindowSize } from "../hooks/use-mobile";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useUserStore } from "@/stores/userStore";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { useNotificationStore } from "@/stores/notificationStore";
import { useWalletStore } from "@/stores/walletStore";
import { toast } from "sonner";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useMessageStore } from "@/stores/messageStore";
export function Header({
  onProfileClick,
  onCartClick,
  onMessagesClick,
  onWalletClick,
  onPaymentAccountsClick,
  onFavoritesClick,
  onLogout,
}) {
  const { sidebarCollapsed, toggleMobileMenu } = useDashboardStore();

  const { switchRole } = useUserStore();
  const { isMobile } = useWindowSize();
  const { onHoldAmount, awaitingClearanceAmount } = useWalletStore();
  const { items } = useCartStore();
  const favorites = useFavoriteStore((state) => state.favorites);
  const favoriteCount = favorites.length;
  const isFavorite = favoriteCount > 0;

  // Zustand Store states
  const user = useUserStore((state) => state.user);
  const role = useUserStore((state) => state.role);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const totalUnread = useMessageStore((state) => state.totalUnread);
  console.log("🔍 Current User Profile in Header:", user);
  console.log("message", unreadCount);

  const handleRoleSwitch = () => {
    const newRole = role === "advertiser" ? "publisher" : "advertiser";
    localStorage.removeItem("accessToken");

    switchRole(newRole);
    toast.success(`Switched to ${newRole}. Please login again 👋`);
    setTimeout(() => {
      onLogout();
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.success("Logged out successfully 👋");
    setTimeout(() => {
      onLogout();
    }, 500);
  };

  const displayBalance = user?.walletBalance ?? 0;
  const totalCartQuantity = items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
  return (
    <header
      className="fixed top-0 right-0 h-14 sm:h-16 bg-card border-b border-border z-30 transition-all duration-300"
      style={{ left: isMobile ? "0px" : sidebarCollapsed ? "80px" : "240px" }}
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="lg:hidden flex-shrink-0 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground w-8 h-8"
            aria-label="Toggle mobile menu"
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
          <span className="lg:hidden text-base font-semibold text-foreground truncate">
            Dashboard
          </span>
          <div className="hidden lg:flex flex-1" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground w-8 h-8 sm:w-9 sm:h-9"
                aria-label="Notifications"
              >
                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 bg-warning text-warning-foreground text-[10px] sm:text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] sm:w-[320px] p-0" align="end">
              <NotificationsList />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="relative bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground w-8 h-8 sm:w-9 sm:h-9"
            aria-label="Messages"
            onClick={onMessagesClick}
          >
            <MessageSquareIcon
              className="w-4 h-4 sm:w-5 sm:h-5"
              strokeWidth={1.5}
            />

            {totalUnread > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 bg-blue-500 text-white text-[10px] sm:text-xs">
                {totalUnread}
              </Badge>
            )}
          </Button>

          {role === "advertiser" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground w-8 h-8 sm:w-9 sm:h-9"
                aria-label="Shopping Cart"
                onClick={onCartClick}
              >
                <ShoppingCartIcon
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  strokeWidth={1.5}
                />
                {totalCartQuantity > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[10px] sm:text-xs">
                    {totalCartQuantity}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:inline-flex bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground w-8 h-8 sm:w-9 sm:h-9"
                aria-label="Favorites"
                onClick={onFavoritesClick}
              >
                <HeartIcon
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  strokeWidth={1.5}
                />
                {favoriteCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] sm:text-xs">
                    {favoriteCount}
                  </Badge>
                )}
              </Button>
            </>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1.5"
                aria-label="Wallet"
              >
                <WalletIcon
                  className="w-4 h-4 flex-shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span
                  className="hidden sm:inline text-[13px] font-semibold text-foreground tracking-tight"
                  style={{
                    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.02em",
                  }}
                >
                  $
                  {displayBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 p-1 bg-popover border border-border shadow-md rounded-lg"
            >
              {user?.role === "advertiser" ? (
                <div className="flex items-center justify-between px-2 py-1.5 mx-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <LockIcon className="w-3 h-3 text-foreground/60 flex-shrink-0" />
                    <span className="text-[11px] text-foreground/75 font-medium">
                      On Hold:
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground tabular-nums tracking-tight">
                    $
                    {onHoldAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between px-2 py-1.5 mx-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <HourglassIcon className="w-3 h-3 text-foreground/60 flex-shrink-0" />
                    <span className="text-[11px] text-foreground/75 font-medium whitespace-nowrap">
                      Awaiting Clearance:
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground tabular-nums tracking-tight ml-2">
                    $
                    {awaitingClearanceAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <DropdownMenuSeparator />
              {user?.role === "advertiser" ? (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sm"
                    onClick={onWalletClick}
                  >
                    <ArrowDownCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Deposit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sm"
                    onClick={onWalletClick}
                  >
                    <ArrowUpCircleIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    Withdrawal
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sm"
                    onClick={onWalletClick}
                  >
                    <ArrowUpCircleIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    Withdrawal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-sm"
                    onClick={onPaymentAccountsClick}
                  >
                    <CreditCardIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    Payment Accounts
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-sm text-muted-foreground"
                onClick={onWalletClick}
              >
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                Transaction History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown Menu (Avatar Component Location) */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 sm:gap-2 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground px-1 sm:px-2"
              >
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border border-border">
                  <AvatarImage
                    src={user?.avatar}
                    alt="User avatar profile"
                    className="object-cover" // Ensure image fills properly without compression distorting
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user?.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-normal text-foreground">
                  {user?.fullName || "John Doe"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover text-popover-foreground"
            >
              <DropdownMenuItem
                className="cursor-pointer py-2.5"
                onClick={onProfileClick}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Personal profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5">
                <GlobeIcon className="w-4 h-4 mr-2" />
                Language
                <span className="ml-auto text-xs text-muted-foreground">
                  English
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer py-2.5"
                onClick={handleRoleSwitch}
              >
                <RepeatIcon className="w-4 h-4 mr-2" />
                Switch to{" "}
                {user?.role === "advertiser" ? "publisher" : "advertiser"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-muted-foreground cursor-pointer py-2.5"
                onClick={handleLogout}
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
