import { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  FilterIcon,
  MoreVerticalIcon,
  StarIcon,
  FileTextIcon,
  PenToolIcon,
  GlobeIcon,
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  EditIcon,
  AlertCircleIcon,
  ClockIcon,
  AwardIcon,
  ZapIcon,
  ShieldIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { AddWebsiteWizard } from "@/components/add-website/AddWebsiteWizard";
import { websiteApi } from "../services/websiteApi";

export function MyPortalsPage({ onViewWebsiteOrders }) {
  return (
    <TooltipProvider>
      <MyPortalsPageContent onViewWebsiteOrders={onViewWebsiteOrders} />
    </TooltipProvider>
  );
}

function MyPortalsPageContent({ onViewWebsiteOrders }) {
  const containerRef = useRef(null);
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState([]);
  const [statusSearch, setStatusSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [editingPortal, setEditingPortal] = useState(null);
  const [openRejectedId, setOpenRejectedId] = useState(null);
  const hoverTimerRef = useRef(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);

      const response = await websiteApi.getAll();

      const websites = response.websites || [];

      const formattedWebsites = websites.map((website) => ({
        id: website._id,
        domain: website.websiteUrl
          ?.replace("https://", "")
          ?.replace("http://", ""),

        status:
          website.status === "pending" ? "in_review" : website.status,

        rating: 4.5,

        categories: website.categories || [],

        blocked: website.sensitiveTopics || [],

        pricing: {
          regular: website.priceNormal || 0,
          dedicated: website.priceSensitive || 0,
          writing: website.priceCopywriting || 0,
        },

        // 🔥 ADD THESE
        description: website.description || "",
        instructions: website.instructions || "",
        countries: website.countries || [],
        language: website.language || "English",
        maxLinks: website.maxLinks || "2",
        linkType: website.linkType || "Do-Follow",

        orders: {
          inProgress: 0,
          published: 0,
          requests: 0,
        },

        insights: {
          liveNotLive: { live: 0, notLive: 0 },
          indexingRate: 0,
          avgPublishTime: "0 days",
          completionRatio: 0,
        },

        earnings: {
          total: 0,
          cleared: 0,
          pending: 0,
        },

        features: [],
      }));

      setPortals(formattedWebsites);
    } catch (error) {
      console.error("Fetch websites error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = (id) => {
    setPortals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active" } : p)),
    );
  };

  const handlePause = (id) => {
    setPortals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "paused" } : p)),
    );
  };

  const handleDelete = async (id) => {
    try {
      const portal = portals.find((p) => p.id === id);

      await websiteApi.delete(id);

      setPortals((prev) => prev.filter((p) => p.id !== id));
      toast.success("Website deleted successfully");
    } catch (error) {
      console.error("Delete website error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete website");
    }
  };
  const handleEdit = (portal) => {
    setEditingPortal(portal);
    setIsAddingWebsite(true);
  };

  const handleResubmit = (id) => {
    setPortals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "in_review" } : p)),
    );
  };

  const handleAddWebsiteClose = async () => {
    setIsAddingWebsite(false);
    setEditingPortal(null);

    await fetchWebsites();
  };

  // Filter logic
  const filteredPortals = portals.filter((portal) => {
    const matchesStatus =
      statusFilters.length === 0 || statusFilters.includes(portal.status);
    const matchesSearch = portal.domain
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPortals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPortals = filteredPortals.slice(startIndex, endIndex);

  // Status options and counts
  const statuses = [
    { id: "active", label: "Active" },
    { id: "paused", label: "On pause" },
    { id: "in_review", label: "In-review" },
    { id: "rejected", label: "Rejected" },
  ];

  const statusCounts = portals.reduce((acc, portal) => {
    acc[portal.status] = (acc[portal.status] || 0) + 1;
    return acc;
  }, {});

  const filteredStatusOptions = statuses.filter((s) =>
    s.label.toLowerCase().includes(statusSearch.toLowerCase()),
  );

  const toggleStatusFilter = (statusId) => {
    setStatusFilters((prev) =>
      prev.includes(statusId)
        ? prev.filter((id) => id !== statusId)
        : [...prev, statusId],
    );
    setCurrentPage(1);
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, statusFilters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "paused":
        return "bg-amber-400";
      case "in_review":
        return "bg-blue-500";
      case "rejected":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (isAddingWebsite) {
    const initialWizardData = editingPortal
      ? {
          id: editingPortal.id,
          url: `https://${editingPortal.domain || ""}`,

          priceNormal: editingPortal.pricing?.regular ?? 0,
          priceSensitive: editingPortal.pricing?.dedicated ?? 0,
          priceCopywriting: editingPortal.pricing?.writing ?? 0,

          categories: editingPortal.categories ?? [],
          description: editingPortal.description ?? "",
          instructions: editingPortal.instructions ?? "",
          countries: editingPortal.countries ?? [],
          language: editingPortal.language ?? "English",
          maxLinks: editingPortal.maxLinks ?? "2",
          linkType: editingPortal.linkType ?? "Do-Follow",
          discount: editingPortal.discount ?? 0,
          enableCopywriting: (editingPortal.pricing?.writing ?? 0) > 0,
        }
      : undefined;

    return (
      <AddWebsiteWizard
        onClose={handleAddWebsiteClose}
        initialData={initialWizardData}
        isEditing={!!editingPortal}
        currentStatus={editingPortal?.status}
        existingDomains={portals.map((p) => p.domain)}
      />
    );
  }
  if (loading) {
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
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 pb-4 pt-2 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Portals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor your publisher websites
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          onClick={() => setIsAddingWebsite(true)}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Website
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-xs w-full">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search portals..."
              className="pl-9 h-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
              >
                <FilterIcon className="w-3.5 h-3.5 mr-2" />
                Filter
                {statusFilters.length > 0 && (
                  <>
                    <span className="mx-2 h-4 w-[1px] bg-border" />
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 rounded-sm text-[10px] font-normal"
                    >
                      {statusFilters.length}
                    </Badge>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="start">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search status"
                    className="h-8 pl-8 text-xs border-none bg-muted/50 focus-visible:ring-0"
                    value={statusSearch}
                    onChange={(e) => setStatusSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                {filteredStatusOptions.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => toggleStatusFilter(status.id)}
                  >
                    <Checkbox
                      id={`filter-${status.id}`}
                      checked={statusFilters.includes(status.id)}
                      onCheckedChange={() => toggleStatusFilter(status.id)}
                    />

                    <Label
                      htmlFor={`filter-${status.id}`}
                      className="flex-1 text-sm font-normal cursor-pointer flex justify-between items-center"
                    >
                      <span>{status.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({statusCounts[status.id] || 0})
                      </span>
                    </Label>
                  </div>
                ))}
                {filteredStatusOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No results found
                  </p>
                )}
              </div>
              {statusFilters.length > 0 && (
                <div className="p-2 border-t border-border bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs justify-center"
                    onClick={() => {
                      setStatusFilters([]);
                      setCurrentPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {statusFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setStatusFilters([]);
                setCurrentPage(1);
              }}
            >
              Reset
              <XIcon className="ml-2 w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Table Header Row */}
        <div className="hidden lg:grid grid-cols-12 gap-6 px-6 py-2 bg-muted/30 border-b border-border">
          <div className="col-span-3">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Website & Performance
            </h4>
          </div>
          <div className="col-span-2 pl-6">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Pricing
            </h4>
          </div>
          <div className="col-span-2 pl-6">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Orders
            </h4>
          </div>
          <div className="col-span-2 pl-6">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Insights
            </h4>
          </div>
          <div className="col-span-2 pl-6">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Earnings
            </h4>
          </div>
          <div className="col-span-1 pl-6 text-center">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Action
            </h4>
          </div>
        </div>

        {/* Portals List */}

        <div ref={containerRef} className="divide-y divide-border">
          {currentPortals && currentPortals.length > 0 ? (
            currentPortals.map((portal) => (
              <div
                key={portal.id}
                className="group/row p-6 hover:bg-muted/20 transition-colors duration-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Column 1: Website Info (3 cols) */}
                  <div className="lg:col-span-3 space-y-3">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:hidden">
                      Website & Performance
                    </h4>
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getStatusColor(portal.status)}`}
                      />
                      <div>
                        <button
                          onClick={() => onViewWebsiteOrders?.(portal.domain)}
                          className="text-base font-bold text-foreground leading-tight hover:text-primary hover:underline transition-colors text-left"
                        >
                          {portal.domain}
                        </button>

                        {/* Badges */}
                        <div className="flex items-center gap-1 flex-wrap mt-1.5 mb-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-amber-200/50 hover:bg-slate-50 transition-colors cursor-help">
                                <AwardIcon className="w-3 h-3 text-amber-600 stroke-[2]" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] bg-slate-900 text-white shadow-lg">
                              <p className="text-xs font-semibold mb-1">
                                Pro Publisher
                              </p>
                              <p className="text-xs leading-relaxed">
                                Experienced and trusted publisher with strong
                                performance history.
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-yellow-200/50 hover:bg-slate-50 transition-colors cursor-help">
                                <ZapIcon className="w-3 h-3 text-yellow-600 stroke-[2] fill-yellow-600" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] bg-slate-900 text-white shadow-lg">
                              <p className="text-xs font-semibold mb-1">
                                Fast Delivery
                              </p>
                              <p className="text-xs leading-relaxed">
                                Orders are usually completed faster than the
                                standard delivery time.
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200/50 hover:bg-slate-50 transition-colors cursor-help">
                                <ShieldIcon className="w-3 h-3 text-emerald-600 stroke-[2]" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[240px] bg-slate-900 text-white shadow-lg">
                              <p className="text-xs font-semibold mb-1">
                                Lifetime Link Guarantee
                              </p>
                              <p className="text-xs leading-relaxed">
                                We ensure your live link remains active. If any
                                issue occurs, our team will resolve and restore
                                the placement.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= Math.round(Number(portal.rating)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            ({portal.rating}) Rating
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-start gap-2 text-[11px]">
                        <GlobeIcon className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />
                        <span className="text-foreground leading-snug">
                          {portal.categories.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-[11px]">
                        <BanIcon className="w-3.5 h-3.5 mt-0.5 text-rose-500 shrink-0" />
                        <span className="text-rose-600/80 leading-snug">
                          {portal.blocked.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Pricing (2 cols) */}
                  <div className="lg:col-span-2 space-y-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-3">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:hidden">
                      Pricing
                    </h4>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileTextIcon className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-foreground">Regular</span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">
                        ${portal.pricing.regular}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <StarIcon className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-foreground">
                          Dedicated
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">
                        ${portal.pricing.dedicated}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PenToolIcon className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-foreground">Writing</span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">
                        ${portal.pricing.writing}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Orders (2 cols) */}
                  <div className="lg:col-span-2 space-y-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:hidden">
                      Orders
                    </h4>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        In Progress
                      </span>
                      <button
                        onClick={() => onViewWebsiteOrders?.(portal.domain)}
                        className="text-xs font-bold text-amber-600 hover:underline"
                      >
                        {portal.orders.inProgress}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Published
                      </span>
                      <button
                        onClick={() => onViewWebsiteOrders?.(portal.domain)}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        {portal.orders.published}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Requests
                      </span>
                      <button
                        onClick={() => onViewWebsiteOrders?.(portal.domain)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        {portal.orders.requests}
                      </button>
                    </div>
                  </div>

                  {/* Column 4: Insights (2 cols) */}
                  <div className="lg:col-span-2 space-y-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-4">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:hidden">
                      Insights
                    </h4>

                    <div className="flex flex-row justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Live / Not Live
                      </span>
                      <div className="text-xs font-medium">
                        <span className="text-emerald-600">
                          {portal.insights.liveNotLive.live}
                        </span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-rose-600">
                          {portal.insights.liveNotLive.notLive}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          Indexing Rate
                        </span>
                        <span className="font-bold text-foreground">
                          {portal.insights.indexingRate}%
                        </span>
                      </div>
                      <Progress
                        value={portal.insights.indexingRate}
                        className="h-1 bg-slate-100"
                        indicatorClassName="bg-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs ">Avg Publish Time</span>
                      <span className="text-xs font-medium text-foreground">
                        {portal.insights.avgPublishTime}
                      </span>
                    </div>
                  </div>

                  {/* Column 5: Earnings (2 cols) */}
                  <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6 flex flex-col justify-center gap-4">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:hidden">
                        Earnings
                      </h4>

                      <div className="mb-2">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">
                          Total
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(portal.earnings.total)}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Cleared</span>
                          <span className="font-medium text-emerald-600">
                            {formatCurrency(portal.earnings.cleared)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Pending</span>
                          <span className="font-medium text-amber-600">
                            {formatCurrency(portal.earnings.pending)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 6: Actions (1 col) */}
                  <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6 flex flex-col items-center justify-center">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:hidden">
                      Action
                    </h4>

                    {portal.status === "in_review" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center cursor-help">
                            <ClockIcon className="w-4 h-4 text-blue-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] bg-slate-900 text-white shadow-lg p-3">
                          <p className="text-xs font-semibold mb-1">
                            Website Under Approval
                          </p>
                          <p className="text-xs leading-relaxed">
                            Your website is currently being reviewed by our
                            team. This process typically takes 2-5 business
                            days.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : portal.status === "rejected" ? (
                      <Popover
                        open={openRejectedId === portal.id}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) setOpenRejectedId(null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <div
                            className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center cursor-pointer hover:bg-rose-200"
                            onMouseEnter={() => {
                              if (hoverTimerRef.current)
                                clearTimeout(hoverTimerRef.current);
                              hoverTimerRef.current = setTimeout(
                                () => setOpenRejectedId(portal.id),
                                200,
                              );
                            }}
                            onMouseLeave={() => {
                              if (hoverTimerRef.current)
                                clearTimeout(hoverTimerRef.current);
                              hoverTimerRef.current = setTimeout(
                                () =>
                                  setOpenRejectedId((prev) =>
                                    prev === portal.id ? null : prev,
                                  ),
                                300,
                              );
                            }}
                            onClick={() =>
                              setOpenRejectedId((prev) =>
                                prev === portal.id ? null : portal.id,
                              )
                            }
                          >
                            <AlertCircleIcon className="w-4 h-4 text-rose-600" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-80 p-0"
                          onMouseEnter={() => {
                            if (hoverTimerRef.current)
                              clearTimeout(hoverTimerRef.current);
                          }}
                          onMouseLeave={() => {
                            hoverTimerRef.current = setTimeout(
                              () => setOpenRejectedId(null),
                              300,
                            );
                          }}
                        >
                          <div className="p-4 bg-rose-50/50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                <AlertCircleIcon className="w-4 h-4 text-rose-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-rose-900">
                                  Website Rejected
                                </h4>
                                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                                  Your website did not meet our quality
                                  guidelines.{" "}
                                  {portal.orders.published > 0
                                    ? "You can resubmit for approval after making necessary improvements."
                                    : "Please review our guidelines and resubmit."}
                                </p>
                                {portal.orders.published > 0 && (
                                  <div className="mt-3">
                                    <Button
                                      size="sm"
                                      className="w-full bg-rose-600 hover:bg-rose-700 text-white h-8"
                                      onClick={() => handleResubmit(portal.id)}
                                    >
                                      Resubmit for Approval
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-accent"
                          >
                            <MoreVerticalIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <>
                            {/* Active State Actions */}
                            {portal.status === "active" && (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => handleEdit(portal)}
                                >
                                  <EditIcon className="w-4 h-4 mr-2 text-blue-500" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => handlePause(portal.id)}
                                >
                                  <PauseIcon className="w-4 h-4 mr-2 text-amber-500" />
                                  Pause Website
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Paused State Actions */}
                            {portal.status === "paused" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleActivate(portal.id)}
                              >
                                <PlayIcon className="w-4 h-4 mr-2 text-emerald-500" />
                                Activate
                              </DropdownMenuItem>
                            )}

                            {/* Delete Action (Common) */}
                            {(portal.status === "active" ||
                              portal.status === "paused") && (
                              <>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  disabled={
                                    portal.orders.inProgress > 0 ||
                                    portal.orders.published > 0
                                  }
                                  onClick={() => handleDelete(portal.id)}
                                >
                                  <TrashIcon className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Yahan hum empty state dikhayenge
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <GlobeIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No websites found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                It seems you haven't added any websites yet. Click the button
                below to get started and grow your network.
              </p>
              <Button
                onClick={() => setIsAddingWebsite(true)}
                className="mt-6"
                variant="outline"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Website
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-card px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredPortals.length > 0 ? startIndex + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(endIndex, filteredPortals.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredPortals.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-white text-xs font-medium text-muted-foreground hover:bg-slate-50 disabled:opacity-50 h-8"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-3 py-2 border border-border bg-white text-xs font-medium text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "relative inline-flex items-center px-3 py-2 border text-xs font-medium h-8",
                        currentPage === page
                          ? "z-10 bg-primary/10 border-primary text-primary hover:bg-primary/20"
                          : "bg-white border-border text-muted-foreground hover:bg-slate-50",
                      )}
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-white text-xs font-medium text-muted-foreground hover:bg-slate-50 disabled:opacity-50 h-8"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
