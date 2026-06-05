import {
  CheckCircleIcon,
  MailIcon,
  RefreshCwIcon,
  WalletIcon,
  DownloadIcon,
  FileSearchIcon,
  CheckCircle2Icon,
  LayoutDashboardIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function OrderConfirmationPage({ onNavigate, orderDetails }) {
  console.log("order details:", orderDetails); // Debugging line to check what order details we receive
  const containerRef = useRef(null);
  const cleanDomain = orderDetails.orders.websiteId?.websiteUrl
            ? orderDetails.orders.websiteId.websiteUrl
                .replace(/^(https?:\/\/)?(www\.)?/, "")
                .replace(/\/$/, "")
            : "unknown.com";
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      );
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-4" ref={containerRef}>
      {/* Success Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-6">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 shadow-sm ring-1 ring-green-500/10">
          <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex flex-col gap-1 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
            Order Confirmed!
          </h1>
          <p className="text-base text-muted-foreground">
            You have placed your order containing {orderDetails.orders.length}{" "}
            items. Your dashboard has been updated.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border shadow-sm rounded-full py-1.5 px-4 mt-1">
          <MailIcon className="w-4 h-4 text-primary" />
          <p className="text-xs font-medium text-foreground">
            A summary receipt has been sent to your email address.
          </p>
        </div>
      </div>

      {/* Order Details */}
<div className="w-full mb-6">
  <div className="flex items-end justify-between mb-3 px-1">
    <div>
      <h3 className="text-lg font-bold text-foreground">Your Order Details</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Review the status of your requested placements.
      </p>
    </div>
  </div>

  <div className="flex flex-col gap-3">
    {orderDetails.orders.map((order) => {
      // Helper to clean domain name
      const domain = order.websiteId?.websiteUrl || "Unknown Website";
      const cleanDomain = domain
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .replace(/\/$/, "");

      return (
        <div 
          key={order._id} 
          className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-all group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-start gap-3">
              <img
                src="https://flagcdn.com/w40/us.png"
                alt="Country Flag"
                className="w-6 h-auto shadow-sm rounded-sm mt-1"
              />
              <div>
                <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors text-foreground">
                  {cleanDomain}
                </h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Order ID: #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-muted-foreground text-[10px]">•</span>
                  <span className="text-[11px] text-muted-foreground">
                    {order.submissionData?.articleTitle || "Unnamed Article"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status and Price */}
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border mt-1 md:mt-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                <RefreshCwIcon className="w-3 h-3 animate-spin-slow" />
            Submitted
              </span>
              <div className="text-right min-w-[70px]">
                <p className="font-bold text-sm text-foreground">${order.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-border">
        <Button
          onClick={() => onNavigate("purchases")}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 px-6 rounded-md shadow-sm transition-all w-full sm:w-auto min-w-[160px] text-sm"
        >
          <LayoutDashboardIcon className="w-4 h-4" />
          Go to My Orders
        </Button>
        <Button
          variant="outline"
          onClick={() => onNavigate("catalogue")}
          className="flex items-center justify-center gap-2 bg-card border border-border text-foreground hover:bg-accent font-medium h-10 px-6 rounded-md transition-all w-full sm:w-auto min-w-[160px] text-sm"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          Continue Browsing
        </Button>
      </div>
    </div>
  );
}
