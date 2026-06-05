import { useDashboardStore } from "@/stores/dashboardStore";
import { useUserStore } from "@/stores/userStore";
import { useMessageStore } from "@/stores/messageStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

import { OrderDetailsModal } from "@/components/modals/OrderDetailsModal";

const statusColors = {
  new_request: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  processing: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
};

const LiveTimer = ({ dueDate }) => {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const target = new Date(dueDate);
      const now = new Date();
      const diffMs = target - now;

      if (isNaN(target.getTime()) || diffMs <= 0) {
        setTimeString("0d 0h 0m");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeString(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  return <span className="text-xs font-medium text-black tabular-nums">{timeString}</span>;
};

export function OrdersTable({ onOpenChat } = {}) {
  const { orders, fetchOrderStats, fetchRecentOrders } = useDashboardStore();

  const { role } = useUserStore();
  const { openConversationForOrder } = useMessageStore();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  useEffect(() => {
    fetchOrderStats();
    fetchRecentOrders();
  }, [fetchOrderStats, fetchRecentOrders]);
  console.log(orders);
  const handleSendMessage = (order) => {
    const otherPartyRole = role === "publisher" ? "Advertiser" : "Publisher";
    const conversationId = openConversationForOrder(
      order.id,
      order.websiteName,
      otherPartyRole,
    );
    onOpenChat?.(conversationId, order.id);
  };

  const handleViewMore = (order) => {
    const domain = order.websiteId?.websiteUrl || "";
    const cleanDomain = domain
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/$/, "");
    const modalOrder = {
      id: order._id,
      website: cleanDomain,
      status:
        order.status === "pending"
          ? "new_request"
          : order.status === "processing"
            ? "in_progress"
            : order.status,
      price: order.price || 0,
      writingPrice: order.priceCopywriting || 0,
      dedicatedPrice: 0,
      createdDate: order.createdAt,
      hasWriting: order.priceCopywriting > 0,

      // Yahan submissionData ko safely map karein
      submissionData: {
        articleTitle: order.submissionData?.articleTitle || "",
        articleContent: order.submissionData?.articleContent || "",
        orderInstructions:
          order.submissionData?.orderInstructions || order.details || "",
        anchorText: order.submissionData?.anchorText || "Default Anchor",
        targetUrl: order.submissionData?.targetUrl || "https://example.com",
        linkType: order.submissionData?.linkType || "dofollow",
      },

      // Links ko agar order.links exist karta hai toh use karein, nahi toh default array
      links:
        order.links && order.links.length > 0
          ? order.links
          : [
              {
                anchor:
                  order.submissionData?.anchorText || "example anchor text",
                url: order.submissionData?.targetUrl || "https://example.com",
                type: order.submissionData?.linkType || "Do-Follow",
              },
            ],

      publishedUrl:
        order.status === "completed"
          ? `${cleanDomain.toLowerCase()}/article`
          : null,
      publisher: { name: order.websiteId.userId.fullName, reviews: 120 },
      advertiser: { name: order.buyerId.fullName, reviews: 85 },
    };

    setSelectedOrderForDetails(modalOrder);
    setDetailsModalOpen(true);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-medium text-foreground">
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  Order ID / Website
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  Created / Timer
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  Earnings
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) && orders.length > 0 ? (
                orders.map((order, index) => {
                  const orderDate = new Date(order.createdAt);
                  const dueDate = order.dueDate
                    ? new Date(order.dueDate)
                    : new Date(orderDate.setDate(orderDate.getDate() + 7));

                  const now = new Date();
                  const diffTime = dueDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const cleanDomain = order.websiteId?.websiteUrl
                    ? order.websiteId.websiteUrl
                        .replace(/^(https?:\/\/)?(www\.)?/, "")
                        .replace(/\/$/, "")
                    : "unknown.com";
                  const sequence = String(index + 1).padStart(3, "0");

                  // 2. Combine it with the current year
                  const displayId = `ORD-${new Date().getFullYear()}-${sequence}`;
                  const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  };
                  // Curly braces ke baad 'return' likhna zaroori hai
                  return (
                    <tr
                      key={order._id || order.id}
                      className="border-b border-border hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <button className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
                            {cleanDomain}
                            <ExternalLinkIcon className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-slate-500 text-xs font-medium font-mono">
                          GP{displayId}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="text-slate-500 text-xs flex items-center gap-1.5">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              {/* Date valid hai toh show karein, warna 'N/A' */}
                              {order.createdAt
                                ? formatDate(order.createdAt)
                                : "N/A"}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-medium text-black">
                              <ClockIcon
                                className="w-3.5 h-3.5 text-slate-400"
                                strokeWidth={2}
                              />
                             <LiveTimer dueDate={dueDate.toISOString()} />
                            </div>
                          </div>
                        </td>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            ${order.price}
                          </span>
                          {order.isDedicatedTopic && (
                            <SparklesIcon className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +${order.websiteId.priceCopywriting} Writing
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          className={`${statusColors[order.status] || "bg-gray-100"} font-normal text-xs`}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMore(order)}
                        >
                          View <ExternalLinkIcon className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2.5">
          {orders.map((order) => {
            const dueDate = new Date(order.dueDate);
            const now = new Date();
            const diffTime = dueDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div
                key={order.id}
                className="border border-border rounded-lg p-3 bg-background hover:bg-accent/30 transition-colors"
              >
                {/* Row 1: Website + Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {order.websiteName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {order.id}
                    </p>
                  </div>
                  <Badge
                    className={`${statusColors[order.status]} font-normal text-[10px] flex-shrink-0`}
                  >
                    {order.status}
                  </Badge>
                </div>
                {/* Row 2: Date + Earnings */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{order.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      ${order.price}
                    </span>
                    {order.isDedicatedTopic && (
                      <SparklesIcon className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </div>
                {/* Row 3: Timer + Action */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-[11px]">
                    <ClockIcon className="w-3 h-3 text-slate-400" />
                    {diffDays > 0 ? (
                      <span className="font-semibold text-foreground">
                        {diffDays}d remaining
                      </span>
                    ) : diffDays === 0 ? (
                      <span className="text-amber-600 font-semibold">
                        Due today
                      </span>
                    ) : (
                      <LiveTimer dueDate={order.dueDate} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 h-6 text-[11px] px-2 py-0"
                      onClick={() => handleViewMore(order)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <OrderDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          order={selectedOrderForDetails}
          role={role}
          onSendMessage={() =>
            selectedOrderForDetails &&
            handleSendMessage({
              id: selectedOrderForDetails.id,
              websiteName: selectedOrderForDetails.website,
            })
          }
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Showing 1-8 of 234 orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7 sm:w-8 sm:h-8 bg-background text-foreground border-border hover:bg-accent"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7 sm:w-8 sm:h-8 bg-background text-foreground border-border hover:bg-accent"
              aria-label="Next page"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
