import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  StarIcon,
  HeartIcon,
  MailIcon,
  ShoppingCartIcon,
  CheckIcon,
  ClockIcon,
  LinkIcon,
  PinIcon,
  BanIcon,
  TrendingUpIcon,
  ActivityIcon,
  BarChart3Icon,
  UsersIcon,
  ShieldCheckIcon,
  AwardIcon,
  ZapIcon,
  ShieldIcon,
} from "lucide-react";
import { QuickChatModal } from "@/components/modals/QuickChatModal";
import { useMessageStore } from "@/stores/messageStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "../../lib/api";

export function WebsiteDetailsPage({
  websiteId,
  onBack,
  onAddToCart,
  onPublisherClick,
}) {
  const { selectConversation, conversations } = useMessageStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [getWebsiteData, setGetWebsiteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const countryFlags = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Germany: "🇩🇪",
    Spain: "🇪🇸",
    France: "🇫🇷",
    Canada: "🇨🇦",
    Australia: "🇦🇺",
    India: "🇮🇳",
    Italy: "🇮🇹",
    Netherlands: "🇳🇱",
    Brazil: "🇧🇷",
  };

  const languageFlags = {
    English: "🇺🇸",
    Spanish: "🇪🇸",
    German: "🇩🇪",
    French: "🇫🇷",
    Italian: "🇮🇹",
    Portuguese: "🇵🇹",
    Dutch: "🇳🇱",
  };
  // Jab bhi getWebsiteData change hoga, ye run hoga aur updated data dikhayega
  useEffect(() => {
    if (getWebsiteData) {
      console.log("✅ State successfully updated:", getWebsiteData);
    }
  }, [getWebsiteData]);
  useEffect(() => {
    const getWebsitesById = async () => {
      try {
        const response = await api.get(`/api/website/${websiteId}`);
        const website = response.data.website;

        // 2. Data process karein
        const country = website?.countries?.[0] || "United States";
        const language = website?.language?.[0] || "English";

        setGetWebsiteData({
          ...website,
          cleanDomain:
            website?.websiteUrl
              ?.replace(/^(https?:\/\/)?(www\.)?/, "")
              .replace(/\/$/, "") || "unknown.com",
          country: country,
          language: language,
          flag: countryFlags[country] || "🌐",
          langFlag: languageFlags[language] || "🌐",
        });
        setLoading(false);
      } catch (error) {
        console.error("Fetch failed", error);
        setLoading(false);
      }
    };
    getWebsitesById();
  }, [websiteId]);

  const handleAddToCart = () => {
    setIsInCart(true);
    if (onAddToCart) {
      onAddToCart(websiteId);
    }
  };

  const handleMessageClick = () => {
    // Find a conversation for this website or select the first available one
    const websiteConversation = conversations.find((c) =>
      c.websiteName
        ?.toLowerCase()
        .includes(getWebsiteData?.domain.toLowerCase()),
    );

    const conversationToSelect = websiteConversation || conversations[0];

    if (conversationToSelect) {
      selectConversation(conversationToSelect.id);
    }

    setChatModalOpen(true);
  };

  const handlePublisherClickFromChat = (name) => {
    setChatModalOpen(false);
    onPublisherClick?.(name);
  };
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
    <TooltipProvider>
      <QuickChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        onPublisherClick={handlePublisherClickFromChat}
      />

      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Website Header Section - Separate Card */}
            <Card className="border-border shadow-sm bg-gradient-to-br from-background via-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight break-words mb-3">
                      {getWebsiteData?.websiteUrl
                        ?.replace(/^(https?:\/\/)?(www\.)?/, "")
                        .replace(/\/$/, "") || "Loading..."}
                    </h1>

                    {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-3">
  {/* Pro Publisher */}
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-muted/80 to-muted/60 text-foreground rounded border border-border/80 cursor-help shadow-sm hover:shadow-md hover:border-border transition-all duration-200 hover:scale-105">
        <AwardIcon className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
        <span className="text-[9px] font-semibold whitespace-nowrap">Pro Publisher</span>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">Experienced and trusted publisher</p>
    </TooltipContent>
  </Tooltip>

  {/* Fast Delivery */}
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-muted/80 to-muted/60 text-foreground rounded border border-border/80 cursor-help shadow-sm hover:shadow-md hover:border-border transition-all duration-200 hover:scale-105">
        <ZapIcon className="w-2.5 h-2.5 text-yellow-500 fill-current flex-shrink-0" />
        <span className="text-[9px] font-semibold whitespace-nowrap">Fast Delivery</span>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">Faster than standard delivery</p>
    </TooltipContent>
  </Tooltip>

  {/* Lifetime Guarantee */}
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-muted/80 to-muted/60 text-foreground rounded border border-border/80 cursor-help shadow-sm hover:shadow-md hover:border-border transition-all duration-200 hover:scale-105">
        <ShieldIcon className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
        <span className="text-[9px] font-semibold whitespace-nowrap">Lifetime Guarantee</span>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">Link remains active forever</p>
    </TooltipContent>
  </Tooltip>
</div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < Math.floor(getWebsiteData?.rating ? getWebsiteData?.rating : 4.5) ? "fill-current" : ""}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {getWebsiteData?.rating
                          ? getWebsiteData?.rating.toFixed(1)
                          : "4.5"}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        (
                        {getWebsiteData?.reviews
                          ? getWebsiteData?.reviews
                          : "124"}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 h-7 sm:h-8 text-xs px-2 sm:px-3"
                      onClick={handleMessageClick}
                    >
                      <MailIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      <span className="hidden sm:inline">Message</span>
                      <span className="sm:hidden">Msg</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${isFavorite ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50"}`}
                    >
                      <HeartIcon
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isFavorite ? "fill-current" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Website Details Card */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    {/* Language & Country */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          {getWebsiteData?.langFlag}
                        </span>
                        <span>{getWebsiteData?.language}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getWebsiteData?.flag}</span>
                        <span>{getWebsiteData?.country}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {getWebsiteData?.description}
                    </p>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-3 text-[10px] font-medium text-foreground bg-muted/30 p-2 rounded-lg border border-border mb-3">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-primary" />
                        Average Speed: {getWebsiteData?.avgSpeed}
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-primary" />
                        Max {getWebsiteData?.maxLinks}{" "}
                        {getWebsiteData?.linkType} Links
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <div className="flex items-center gap-1">
                        <PinIcon className="w-3 h-3 text-primary" />
                        Permanent Post
                      </div>
                    </div>

                    {/* Content Details - Unified Section */}
                    <Card className="mb-3 border-border/50 shadow-sm overflow-hidden">
                      <CardContent className="p-2.5 space-y-3">
                        {/* Categories */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 bg-background rounded shadow-sm">
                              <svg
                                className="w-3.5 h-3.5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-xs font-semibold text-foreground">
                              Categories
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {getWebsiteData?.categories?.map(
                              (category, idx) => (
                                <div
                                  key={idx}
                                  className="px-2 py-0.5 bg-muted/50 border border-border/50 rounded text-xs font-medium text-foreground hover:bg-muted transition-colors"
                                >
                                  {category}
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Keywords */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-background rounded shadow-sm">
                              <svg
                                className="w-3.5 h-3.5 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                              </svg>
                            </div>
                            <h3 className="text-xs font-semibold text-foreground">
                              Keywords
                            </h3>
                          </div>
                        <div className="flex flex-wrap gap-1">
  {["SEO", "Marketing", "Technology", "Guest Post"].map((keyword, idx) => (
    <div
      key={idx}
      className="px-1.5 py-0.5 bg-muted/50 border border-border/50 rounded text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
    >
      {keyword}
    </div>
  ))}
</div>
                        </div>

                        {/* Sensitive Topics */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 bg-background rounded shadow-sm">
                              <BanIcon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <h3 className="text-xs font-semibold text-foreground">
                              Sensitive Topics
                            </h3>
                          </div>
                         <div className="flex flex-wrap gap-1.5">
  {getWebsiteData?.sensitiveTopics && getWebsiteData.sensitiveTopics.length > 0 ? (
    getWebsiteData.sensitiveTopics.map((item, idx) => (
      <div
        key={idx}
        className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 border border-border/50 rounded text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        <BanIcon className="w-2.5 h-2.5 text-destructive" />
        <span>{item}</span>
      </div>
    ))
  ) : (
    <p className="text-xs text-muted-foreground italic">
      No sensitive topics restricted.
    </p>
  )}
</div>
                        </div>

                        {/* Placement */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 bg-background rounded shadow-sm">
                              <PinIcon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <h3 className="text-xs font-semibold text-foreground">
                              Content Placement
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {getWebsiteData?.placement?.map((place, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium text-xs transition-all hover:shadow-sm ${
                                  place.color === "purple"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                }`}
                              >
                                {place.color === "purple" ? (
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                <span>{place.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Instructions for Buyer */}
                    <Card className="mb-3 border-border/50 shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-3 py-1.5 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-background rounded shadow-sm">
                            <svg
                              className="w-3.5 h-3.5 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xs font-semibold text-foreground">
                              Instructions for Buyer
                            </h3>
                            <p className="text-[9px] text-muted-foreground">
                              Publisher requirements & guidelines
                            </p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                          <p>
                            {getWebsiteData?.instructions || "No specific instructions provided by the publisher."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="md:col-span-2 border-border shadow-sm hover:border-primary/50 transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-primary">
                      <UsersIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block">
                        Traffic (Similarweb)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-medium text-foreground tracking-tight">
                          {getWebsiteData?.traffic}
                        </p>
                        <span className="text-[10px] text-green-600 font-medium flex items-center bg-green-50 px-1.5 py-0.5 rounded-full">
                          <TrendingUpIcon className="w-2.5 h-2.5 mr-0.5" />
                          {getWebsiteData?.trafficGrowth}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm hover:border-primary/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 bg-purple-50 rounded text-purple-600">
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      DA (Moz)
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground tracking-tight">
                    {getWebsiteData?.da}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm hover:border-primary/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 bg-orange-50 rounded text-orange-600">
                      <BarChart3Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      DR (Ahrefs)
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground tracking-tight">
                    {getWebsiteData?.dr}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card className="border-border shadow-sm">
              <CardHeader className="px-4 sm:px-6 py-2 sm:py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Detailed Metrics
                </h3>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 lg:p-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 sm:gap-y-8 md:gap-y-10 gap-x-6 sm:gap-x-8 md:gap-x-10 lg:gap-x-12">
                  {/* Ahrefs Metrics */}
                  <div className="space-y-2.5 sm:space-y-3">
                    <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 sm:pb-2">
                      Ahrefs Metrics
                    </h4>
                    <dl className="space-y-2 sm:space-y-2.5">
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Ahrefs Rank</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.rank}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">UR</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.ur}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Organic Traffic
                        </dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.organicTraffic}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Ref. Domains</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.refDomains}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Linked Domains
                        </dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.linkedDomains}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Backlinks</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.backlinks}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Keywords</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.ahrefs?.keywords}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Majestic Metrics */}
                  <div className="space-y-2.5 sm:space-y-3">
                    <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 sm:pb-2">
                      Majestic Metrics
                    </h4>
                    <dl className="space-y-2 sm:space-y-2.5">
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Trust Flow (TF)
                        </dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.majestic?.trustFlow}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Citation Flow (CF)
                        </dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.majestic?.citationFlow}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Domain Age</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.majestic?.domainAge}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Backlinks (Maj)
                        </dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.majestic?.backlinks}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Donor Domains</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.majestic?.donorDomains}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Availability & Orders */}
                  <div className="space-y-2.5 sm:space-y-3">
                    <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 sm:pb-2">
                      Availability & Orders
                    </h4>
                    <dl className="space-y-2 sm:space-y-2.5">
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Completed Orders
                        </dt>
                        <dd className="text-black font-medium">
                          {
                            getWebsiteData?.metrics?.availability
                              ?.completedOrders
                          }
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">
                          Articles Avail.
                        </dt>
                        <dd className="text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium">
                          {
                            getWebsiteData?.metrics?.availability
                              ?.articlesAvailable
                          }
                        </dd>
                      </div>
                      <div className="flex justify-between items-center text-[11px] sm:text-xs">
                        <dt className="text-muted-foreground">Added Date</dt>
                        <dd className="text-black font-medium">
                          {getWebsiteData?.metrics?.availability?.addedDate}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Chart & Top Countries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-2">
              <Card className="md:col-span-2 border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <TrendingUpIcon className="w-3.5 h-3.5 text-blue-600" />
                        Organic Traffic Growth
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Last 6 Months Performance
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-blue-600">
                        {getWebsiteData?.metrics?.traffic}
                      </div>
                      <div className="text-[9px] text-green-600 font-medium flex items-center justify-end gap-0.5 mt-0.5">
                        <TrendingUpIcon className="w-2 h-2" />
                        {getWebsiteData?.metrics?.trafficGrowth} vs last month
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 bg-white">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getWebsiteData?.trafficHistory}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="lineGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                          <filter
                            id="shadow"
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                          >
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="0" dy="2" result="offsetblur" />
                            <feComponentTransfer>
                              <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                              <feMergeNode />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                          strokeOpacity={0.5}
                        />

                        <XAxis
                          dataKey="month"
                          tick={{
                            fontSize: 11,
                            fill: "#9ca3af",
                            fontWeight: 500,
                          }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                          dy={8}
                        />

                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: "#9ca3af",
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            `${(value / 1000).toFixed(0)}K`
                          }
                          dx={-8}
                        />

                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            fontSize: "12px",
                            boxShadow:
                              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                            padding: "10px 14px",
                          }}
                          formatter={(value) => [
                            <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                              {(value / 1000).toFixed(1)}K
                            </span>,
                            "Visitors",
                          ]}
                          labelStyle={{
                            fontWeight: 600,
                            marginBottom: "4px",
                            color: "#1f2937",
                          }}
                          cursor={{
                            stroke: "#3b82f6",
                            strokeWidth: 1,
                            strokeDasharray: "5 5",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="traffic"
                          stroke="url(#lineGradient)"
                          strokeWidth={3}
                          dot={{
                            fill: "#fff",
                            strokeWidth: 3,
                            r: 5,
                            stroke: "#3b82f6",
                            filter: "url(#shadow)",
                          }}
                          activeDot={{
                            r: 7,
                            strokeWidth: 3,
                            stroke: "#3b82f6",
                            fill: "#fff",
                            filter: "url(#shadow)",
                          }}
                          strokeLinecap="round"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="pr-6 pt-6 pb-6 pl-3">
                  <h3 className="text-sm font-bold text-foreground mb-4">
                    Top Countries
                  </h3>
                  <div className="space-y-3">
                    {getWebsiteData?.topCountries?.map((country, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{country.flag}</span>
                          <span className="text-muted-foreground">
                            {country.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-1/2">
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold w-8 text-right">
                            {country.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-bold text-foreground mb-3">Traffic Sources</h3>
                    <div className="space-y-2">
                      {website.trafficSources.map((source, idx) =>
                      <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{source.type}</span>
                          <div className="flex items-center gap-2 w-1/2">
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                              className={`h-full rounded-full ${
                              source.color === 'green' ? 'bg-green-500' :
                              source.color === 'blue' ? 'bg-blue-500' :
                              'bg-gray-400'}`
                              }
                              style={{ width: `${source.percentage}%` }} />
                            
                            </div>
                            <span className="text-xs font-bold w-8 text-right">{source.percentage}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Pricing */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <Card className="border-border shadow-lg">
              <CardContent className="p-4">
                <div className="bg-muted/30 rounded-lg p-3 mb-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Regular Price
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-[9px] font-bold"
                      >
                        Standard
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-bold text-foreground tracking-tight">
                        ${getWebsiteData?.priceNormal}.00
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / post
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-[11px]">Sensitive Price</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-[10px] cursor-help">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Gambling, Betting, CBD</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        ${getWebsiteData?.priceSensitive}.00
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-[11px]">Article Writing</span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] bg-blue-50 text-blue-600 border-blue-100"
                        >
                          ADD-ON
                        </Badge>
                      </div>
                      <span className="font-bold text-primary text-sm">
                        +${getWebsiteData?.priceCopywriting}.00
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 text-sm shadow-md hover:shadow-lg transition-all"
                >
                  {isInCart ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1.5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-4 h-4 mr-1.5" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <div className="mt-4 pt-3 border-t border-border text-center">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                    <ShieldCheckIcon className="w-3 h-3" />
                    100% Money Back Guarantee if not published.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Catalogue
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
