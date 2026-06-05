import { useState, useEffect, useRef, useCallback } from "react";
import {
  XIcon,
  LinkIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  EditIcon,
  SaveIcon,
  ClockIcon,
  DollarSignIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  GlobeIcon,
  RefreshCwIcon,
  UserIcon,
  ArrowRightIcon,
  MessageSquareIcon,
  DownloadIcon,
  XCircleIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  ImageIcon,
  Undo2Icon,
  Redo2Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  Link2Icon,
  MinusIcon,
  CodeIcon,
  PaletteIcon,
  ChevronDownIcon,
  TypeIcon,
  HighlighterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { gsap } from "gsap";

// ── Rich-text editor constants ──────────────────────────────────────────────
const TEXT_COLORS = [
  { label: "Default", value: "inherit" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
  { label: "Black", value: "#000000" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "transparent" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Orange", value: "#fed7aa" },
];

const HEADING_OPTIONS = [
  { label: "Paragraph", tag: "p", className: "text-sm" },
  { label: "Heading 1", tag: "h1", className: "text-2xl font-bold" },
  { label: "Heading 2", tag: "h2", className: "text-xl font-bold" },
  { label: "Heading 3", tag: "h3", className: "text-lg font-semibold" },
  { label: "Heading 4", tag: "h4", className: "text-base font-semibold" },
];

function RteToolbarButton({
  onClick,
  title,
  active = false,
  children,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={`p-1 rounded transition-colors ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"} disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function RteToolbarDivider() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  role,
  onSubmitLink,
  onCancelOrder,
  onUpdateDetails,
  onOpenSubmitLink,
  onAcceptOrder,
  onPublisherAccept,
  onRequestRevision,
  onOpenResolution,
  onSendMessage,
}) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);
  const sectionsRef = useRef([]);

  const [hoursLeft, setHoursLeft] = useState(0);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState("brief");
  const [isVisible, setIsVisible] = useState(false);
console.log(order)
  // Editable states
  const [instructions, setInstructions] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [links, setLinks] = useState([]);

  // Rich-text editor state
  const articleEditorRef = useRef(null);
  const articleImageInputRef = useRef(null);
  const rteColorPickerRef = useRef(null);
  const rteHighlightPickerRef = useRef(null);
  const rteHeadingDropdownRef = useRef(null);
  const rteSavedSelectionRef = useRef(null);
  const [rteEditorEmpty, setRteEditorEmpty] = useState(false);
  const [rteActiveFormats, setRteActiveFormats] = useState({});
  const [rteShowColorPicker, setRteShowColorPicker] = useState(false);
  const [rteShowHighlightPicker, setRteShowHighlightPicker] = useState(false);
  const [rteShowHeadingDropdown, setRteShowHeadingDropdown] = useState(false);
  const [rteShowLinkDialog, setRteShowLinkDialog] = useState(false);
  const [rteLinkUrl, setRteLinkUrl] = useState("");

  useEffect(() => {
    if (order?.submittedUrl && order.status === "in_progress") {
      // 4-day window from order creation date (or simulated submit time)
      const submitDate = order.submittedDate
        ? new Date(order.submittedDate)
        : new Date(order.createdDate || Date.now());
      const deadline = new Date(submitDate.getTime() + 4 * 24 * 60 * 60 * 1000);
      const diffMs = deadline.getTime() - Date.now();
      const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      // Clamp to a demo-friendly range if the order data has no real timestamp
      setHoursLeft(hours > 0 && hours <= 96 ? hours : 71);
    }
  }, [order]);

  useEffect(() => {
  if (order) {
    console.log("Full Order Object:", order);
    console.log("Title found:", order.submissionData?.articleTitle);
    
    setArticleTitle(order.submissionData?.articleTitle || "");
      setInstructions(
        order.submissionData?.orderInstructions ||
          order.details ||
          "No specific instructions provided.",
      );
      setArticleContent(
        order.submissionData?.articleContent ||
          (order.hasWriting
            ? ""
            : `A home warranty can help mitigate these risks by covering repairs or replacements of key systems and appliances when they break down due to normal wear and tear. Instead of paying the full bill upfront, homeowners typically pay a monthly premium and a service fee when they place a claim. The provider then coordinates services and applies coverage in accordance with the contract’s terms, limits, and exclusions.

## What Alabama Homeowners Should Look for in a Home Warranty
Alabama homes put disproportionate stress on specific systems, particularly air conditioning, electrical components, and plumbing. A good home warranty here is less about the longest coverage list and more about ensuring the highest-risk systems are clearly covered and serviced with minimal friction.

### Important evaluation factors include:
- HVAC coverage limits and clarity around common parts and service scenarios
- How service requests are handled during summer peaks
- Contractor availability across both metro and rural areas
- Definitions of covered wear versus excluded damage or maintenance-related issues
- Flexibility to adjust coverage as your systems age or your home setup changes

## The Best Home Warranty Companies in Alabama

### 1. Liberty Home Guard
Alabama homeowners rarely have perfectly uniform system conditions. HVAC components may be newer than plumbing, a water heater might be near end-of-life, and appliances can vary widely in age and reliability. Liberty Home Guard is the best home warranty company because it fits well in this environment because its coverage structure supports more intentional protection decisions rather than forcing a one-size plan onto every household.

This adaptability is especially useful in Alabama, where cooling systems represent one of the most frequent and costly repair categories. A home warranty becomes most valuable when it clearly defines what is covered, sets realistic service expectations, and reduces the homeowner’s burden in coordinating repairs. Liberty Home Guard’s approach is built around those operational realities, which can matter as much as the coverage itself when summer demand spikes.

#### Key Features
- Customizable plans with optional add-ons
- Centralized service coordination workflow
- Nationwide coverage footprint
- Coverage designed to fit varied home types and system ages

### 2. Cinch Home Services
Cinch Home Services appeals to Alabama homeowners who want a simpler plan structure with coverage centered on the essentials. Many homeowners prefer plans that are easy to understand and maintain, especially if their home has relatively standard systems and they want predictable coverage boundaries.

In Alabama, this approach can work well for newer homes or properties where major systems have been updated more recently. The main trade-off is flexibility. Homes with uneven system ages or unique features may need add-ons or plan options that are more tailored, which is not always the core strength of simplified plan designs.

#### Key Features
- Simplified plan structures
- Core system and appliance coverage
- Nationwide service availability

### 3. AFC Home Warranty
AFC Home Warranty stands out for homeowners who value service accountability. In practice, one of the most frustrating parts of home repairs is not the first appointment, it is the repeat visit when the fix does not hold. Workmanship guarantees can reduce that risk by creating a clearer framework for follow-up service when problems recur after a repair.

For Alabama homeowners, this can be particularly useful during peak HVAC season when scheduling is tight and repeat visits add cost and disruption. As with any provider, coverage details can vary by location, so reviewing Alabama-specific terms is important before committing.

### 4. Total Home Protection
Total Home Protection offers conventional home warranty plans aimed at homeowners seeking predictable coverage for major systems and appliances. For Alabama households that want baseline protection without extensive customization, traditional plan designs can be a practical fit.

The limitation is that Alabama homes often stress HVAC components, and traditional plans sometimes impose tighter limits or narrower definitions that can affect real claim outcomes. Homeowners considering Total Home Protection should pay close attention to HVAC coverage caps, service fee structure, and exclusions tied to maintenance history or system condition.

### 5. Choice Home Warranty
Choice Home Warranty is a nationally recognized provider with fixed plan structures. For Alabama homeowners who value simplicity and brand familiarity, fixed plans can feel easier to evaluate because the coverage categories are standardized and less dependent on customization decisions.

The trade-off is adaptability. Fixed plans may not align perfectly with the realities of older homes, upgraded properties, or households that rely on additional appliances. If you are considering Choice, the practical step is confirming that the plan covers the systems most likely to fail in your home and that the coverage limits align with Alabama service costs.`),
      );
      
      setLinks(
        order.links || [
          {
            anchor: order?.submissionData?.anchorText || "Default Anchor",
            url: order?.submissionData?.targetUrl || "https://example.com",
            type: order?.submissionData?.linkType || "dofollow",
          },
        ],
      );
      // Set default tab based on content
      if (!order.hasWriting && order.articleContent) {
        setActiveTab("content");
      } else {
        setActiveTab("brief");
      }
    }
  }, [order]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      // Don't hide immediately, wait for animation
      // document.body.style.overflow = 'auto'; // Done in onComplete
    }
  }, [isOpen]);
  // Use a ref to track if the component is mounted to prevent state updates on unmounted component
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let ctx;

    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";

      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!isMounted.current) return;

        ctx = gsap.context(() => {
          // Reset initial states
          gsap.set(overlayRef.current, { opacity: 0, display: "flex" });
          gsap.set(modalRef.current, { opacity: 0, scale: 0.95, y: 20 });
          if (sidebarRef.current)
            gsap.set(sidebarRef.current, { x: -20, opacity: 0 });
          if (sectionsRef.current)
            gsap.set(sectionsRef.current, { y: 20, opacity: 0 });

          // Animate in sequence
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          tl.to(overlayRef.current, { opacity: 1, duration: 0.3 }).to(
            modalRef.current,
            { opacity: 1, scale: 1, y: 0, duration: 0.4 },
            "-=0.1",
          );

          if (sidebarRef.current) {
            tl.to(
              sidebarRef.current,
              { x: 0, opacity: 1, duration: 0.4 },
              "-=0.2",
            );
          }

          if (sectionsRef.current.length > 0) {
            tl.to(
              sectionsRef.current,
              { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
              "-=0.2",
            );
          }
        });
      });
    } else if (isVisible) {
      // Animate out
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.in" },
          onComplete: () => {
            if (isMounted.current) {
              setIsVisible(false);
              document.body.style.overflow = "auto";
              setIsEditingInstructions(false);
              setIsEditingArticle(false);
              setIsEditingLinks(false);
            }
          },
        });

        tl.to(modalRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 20,
          duration: 0.3,
        }).to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
      });
    }

    return () => {
      if (ctx) ctx.revert();
    };
  }, [isOpen]);

  // ── Rich-text editor helpers ───────────────────────────────────────────────
  useEffect(() => {
    function handleOutside(e) {
      if (
        rteColorPickerRef.current &&
        !rteColorPickerRef.current.contains(e.target)
      )
        setRteShowColorPicker(false);
      if (
        rteHighlightPickerRef.current &&
        !rteHighlightPickerRef.current.contains(e.target)
      )
        setRteShowHighlightPicker(false);
      if (
        rteHeadingDropdownRef.current &&
        !rteHeadingDropdownRef.current.contains(e.target)
      )
        setRteShowHeadingDropdown(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Sync editor HTML → articleContent state on close/save
  useEffect(() => {
    if (isEditingArticle && articleEditorRef.current) {
      articleEditorRef.current.innerHTML = articleContent;
      setRteEditorEmpty(!articleContent || articleContent === "<br>");
    }
  }, [isEditingArticle]);

  const rteExec = useCallback((command, value) => {
    document.execCommand(command, false, value);
    articleEditorRef.current?.focus();
    rteUpdateActiveFormats();
  }, []);

  const rteUpdateActiveFormats = useCallback(() => {
    setRteActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
    });
  }, []);

  const rteSaveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0)
      rteSavedSelectionRef.current = sel.getRangeAt(0).cloneRange();
  };

  const rteRestoreSelection = () => {
    const sel = window.getSelection();
    if (sel && rteSavedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(rteSavedSelectionRef.current);
    }
  };

  const rteApplyHeading = (tag) => {
    articleEditorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    setRteShowHeadingDropdown(false);
    rteUpdateActiveFormats();
  };

  const rteApplyColor = (color) => {
    rteRestoreSelection();
    document.execCommand("foreColor", false, color);
    articleEditorRef.current?.focus();
    setRteShowColorPicker(false);
  };

  const rteApplyHighlight = (color) => {
    rteRestoreSelection();
    if (color === "transparent")
      document.execCommand("removeFormat", false, undefined);
    else document.execCommand("hiliteColor", false, color);
    articleEditorRef.current?.focus();
    setRteShowHighlightPicker(false);
  };

  const rteInsertLink = () => {
    if (!rteLinkUrl.trim()) return;
    rteRestoreSelection();
    const url = rteLinkUrl.startsWith("http")
      ? rteLinkUrl
      : `https://${rteLinkUrl}`;
    document.execCommand("createLink", false, url);
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      const anchor = sel.anchorNode.closest?.("a");
      if (anchor) {
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
      }
    }
    articleEditorRef.current?.focus();
    setRteShowLinkDialog(false);
    setRteLinkUrl("");
  };

  const rteInsertImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      articleEditorRef.current?.focus();
      document.execCommand("insertImage", false, ev.target?.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const rteGetCurrentHeadingLabel = () => {
    const block = document.queryCommandValue("formatBlock");
    return (
      HEADING_OPTIONS.find((h) => h.tag === block.toLowerCase())?.label ||
      "Paragraph"
    );
  };

  // ─────────────────────────────────────────────────────────────────────────

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveDetails = () => {
    // Capture rich-text editor HTML when saving article
    const capturedContent = articleEditorRef.current
      ? articleEditorRef.current.innerHTML
      : articleContent;
    if (isEditingArticle) setArticleContent(capturedContent);

    if (onUpdateDetails && order) {
      onUpdateDetails(order.id, {
        details: instructions,
        articleContent: isEditingArticle ? capturedContent : articleContent,
        articleTitle,
        links,
      });
    }
    setIsEditingInstructions(false);
    setIsEditingArticle(false);
    setIsEditingLinks(false);
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleDownload = () => {
    if (!articleTitle || !articleContent) return;

    // Convert Markdown to HTML for the Word document
    const lines = articleContent.split("\n");
    let html = `<h1>${articleTitle}</h1>`;

    let inList = false;

    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<h2>${line.replace("## ", "")}</h2>`;
      } else if (line.startsWith("### ")) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<h3>${line.replace("### ", "")}</h3>`;
      } else if (line.startsWith("#### ")) {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<h4>${line.replace("#### ", "")}</h4>`;
      } else if (line.startsWith("- ")) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${line.replace("- ", "")}</li>`;
      } else if (line.trim() === "") {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += "<br>";
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<p>${line}</p>`;
      }
    });
    if (inList) html += "</ul>";

    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${articleTitle}</title></head>
      <body>${html}</body>
      </html>
    `;

    const blob = new Blob(["\ufeff", fullHtml], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${articleTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusTheme = (status) => {
    switch (status) {
      case "new_request":
        return {
          bg: "bg-blue-50/30",
          border: "border-blue-100",
          text: "text-blue-700",
          accent: "bg-blue-500",
          light: "bg-blue-50",
        };
      case "in_progress":
        return {
          bg: "bg-amber-50/30",
          border: "border-amber-100",
          text: "text-amber-700",
          accent: "bg-amber-500",
          light: "bg-amber-50",
        };
      case "in_revision":
        return {
          bg: "bg-purple-50/30",
          border: "border-purple-100",
          text: "text-purple-700",
          accent: "bg-purple-500",
          light: "bg-purple-50",
        };
      case "in_resolution":
        return {
          bg: "bg-rose-50/30",
          border: "border-rose-100",
          text: "text-rose-700",
          accent: "bg-rose-500",
          light: "bg-rose-50",
        };
      case "completed":
        return {
          bg: "bg-emerald-50/30",
          border: "border-emerald-100",
          text: "text-emerald-700",
          accent: "bg-emerald-500",
          light: "bg-emerald-50",
        };
      case "cancelled":
        return {
          bg: "bg-slate-50/30",
          border: "border-slate-100",
          text: "text-slate-700",
          accent: "bg-slate-500",
          light: "bg-slate-50",
        };
      default:
        return {
          bg: "bg-gray-50/30",
          border: "border-gray-100",
          text: "text-gray-700",
          accent: "bg-gray-500",
          light: "bg-gray-50",
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "in_revision":
        return "In Revision";
      case "in_resolution":
        return "In Resolution";
      case "new_request":
        return "New Request";
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const theme = getStatusTheme(order?.status || "");

  // Simple Markdown Renderer
  const renderMarkdown = (text) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-xl font-bold text-foreground mt-6 mb-3"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-lg font-semibold text-foreground mt-5 mb-2"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h4
            key={index}
            className="text-base font-semibold text-foreground mt-4 mb-2"
          >
            {line.replace("#### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <div key={index} className="flex items-start gap-2 mb-1.5 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <p className="text-sm text-slate-700">{line.replace("- ", "")}</p>
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-sm text-slate-700 leading-7 mb-3">
          {line}
        </p>
      );
    });
  };

  if (!isVisible && !isOpen) return null;
  if (!order) return null;

  const isPublisher = role === "publisher";
  const isAdvertiser = role === "advertiser";
  const hasArticle = !order.hasWriting;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm hidden items-center justify-center p-4 sm:p-6"
    >
      <div
        ref={modalRef}
        className="bg-background w-full max-w-[1400px] h-[90vh] rounded-2xl shadow-2xl border border-border/50 flex overflow-hidden relative"
      >
        {/* LEFT SIDEBAR - CONTROL PANEL */}
        <div
          ref={sidebarRef}
          className="w-[320px] lg:w-[360px] border-r border-border flex flex-col shrink-0 backdrop-blur-xl bg-slate-50/50 transition-colors duration-500"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${theme.accent}`} />
                <span
                  className={`text-xs font-bold tracking-wide uppercase ${theme.text}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono opacity-70">
                {order.id}
              </span>
            </div>
            <h2
              className="text-lg font-bold text-foreground leading-tight truncate"
              title={order.website}
            >
              {order.website}
            </h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <ClockIcon className="w-3.5 h-3.5" /> Timeline
                </h3>
                <div className="relative pl-2 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {/* Step 1 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white/50" />
                    <p className="text-xs font-semibold text-foreground">
                      Order Placed
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {order.createdDate}
                    </p>
                  </div>

                  {/* Step 2 (Active) */}
                  {order.status !== "new_request" && (
                    <div className="relative pl-6">
                      <div
                        className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white/50 ${order.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}
                      />
                      <p className="text-xs font-semibold text-foreground">
                        Processing
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        In Progress
                      </p>
                    </div>
                  )}

                  {/* Step 3 (Final) */}
                  <div className="relative pl-6">
                    <div
                      className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white/50 ${order.status === "completed" ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <p
                      className={`text-xs font-semibold ${order.status === "completed" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {order.status === "cancelled"
                        ? "Cancelled"
                        : "Completion"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Link */}
              {(order.submittedUrl || order.publishedUrl) && (
                <>
                  <Separator className="bg-border/60" />
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5" /> Live Link
                    </h3>
                    <a
                      href={order.publishedUrl || order.submittedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 rounded-lg px-3 py-2.5 group hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-xs font-medium text-blue-700 truncate group-hover:underline">
                        {order.publishedUrl || order.submittedUrl}
                      </span>
                    </a>
                    {order.status === "in_progress" &&
                      order.submittedUrl &&
                      !order.publishedUrl && (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          {/* Coloured top bar */}
                          <div
                            className={`h-1 w-full ${isPublisher ? "bg-emerald-400" : "bg-blue-400"}`}
                          />
                          <div className="px-3 py-2.5 space-y-2.5">
                            {/* Header row */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPublisher ? "bg-emerald-500" : "bg-blue-500"}`}
                              />
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${isPublisher ? "text-emerald-700" : "text-blue-700"}`}
                              >
                                {isPublisher
                                  ? "Awaiting Advertiser Review"
                                  : "Action Required"}
                              </span>
                            </div>
                            {/* Body text */}
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                              {isPublisher
                                ? "Your link has been submitted and is pending advertiser approval. If no action is taken within the review window, the order will complete automatically."
                                : "The publisher has submitted the live link for your review. Please verify the placement and either accept the order, request a revision, or open a resolution."}
                            </p>
                            {/* Countdown row */}
                            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
                              <div className="flex items-center gap-1.5">
                                <ClockIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-[10px] text-slate-500">
                                  Auto-completes in
                                </span>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums border ${isPublisher ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                              >
                                <ClockIcon className="w-2.5 h-2.5" />
                                {hoursLeft}h remaining
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}

              <Separator className="bg-border/60" />

              {/* Financials */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <DollarSignIcon className="w-3.5 h-3.5" /> Financials
                </h3>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-border p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="font-medium">
                      ${order.price}
                    </span>
                  </div>
                  {order.writingPrice > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Writing</span>
                      <span className="font-medium">
                        +${order.writingPrice}
                      </span>
                    </div>
                  )}
                  {order.dedicatedPrice > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Dedicated Fee
                      </span>
                      <span className="font-medium">
                        +${order.dedicatedPrice}
                      </span>
                    </div>
                  )}
                  <Separator className="bg-border/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-sm font-bold text-primary">
                      $
                      {(
                        order.price +
                        (order.writingPrice || 0) +
                        (order.dedicatedPrice || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Counterparty */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5" />{" "}
                  {role === "publisher" ? "Advertiser" : "Publisher"}
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10   border border-border">
                    {/* Yahan sirf valid URL hona chahiye */}
                    <AvatarImage src={order.websiteId?.avatar} />

                    {/* Fallback logic yahan aayega */}
                    <AvatarFallback className="bg-red-500 text-white font-semibold">
                      {order?.publisher.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {role === "publisher"
                        ? order.advertiser?.name
                        : order.advertiser?.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs bg-white/50 hover:bg-white"
                  onClick={() => {
                    onClose();
                    onSendMessage?.();
                  }}
                >
                  <MessageSquareIcon className="w-3.5 h-3.5 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT MAIN AREA - WORKSPACE */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Workspace Header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            <h2 className="text-base font-semibold text-foreground">
              Order Details
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-slate-100"
              >
                <XIcon className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Workspace Content */}
          <div className="flex-1 overflow-hidden relative bg-slate-50/30">
            <ScrollArea className="h-full">
              <div className="py-6 pl-6 pr-10 max-w-6xl mx-auto space-y-6">
                {/* SECTION 1: INSTRUCTIONS */}
                <section
                  ref={(el) => (sectionsRef.current[0] = el)}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Order Instructions
                    </h3>
                    <div className="flex items-center gap-2">
                      {isAdvertiser && !isEditingInstructions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingInstructions(true)}
                          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary"
                        >
                          <EditIcon className="w-2.5 h-2.5 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  <Card className="border-border shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="p-4">
                      {isEditingInstructions ? (
                        <div className="space-y-3">
                          <Textarea
                            value={order.submissionData?.orderInstructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="min-h-[200px] font-mono text-xs leading-relaxed bg-slate-50 border-border focus:ring-primary/20"
                          />

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingInstructions(false)}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveDetails}
                              className="h-7 text-xs"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-slate-600 leading-6 whitespace-pre-wrap font-normal mb-2">
                            {instructions}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopy(instructions, "instructions")
                              }
                              className="h-6 px-2.5 text-[10px] bg-white border-slate-200 shadow-none hover:bg-slate-50"
                            >
                              {copiedField === "instructions" ? (
                                <CheckIcon className="w-3 h-3 mr-1.5 text-green-600" />
                              ) : (
                                <CopyIcon className="w-3 h-3 mr-1.5 text-slate-400" />
                              )}
                              Copy Brief
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </section>

                <Separator className="bg-border/60" />

                {/* SECTION 2: ARTICLE CONTENT */}
                {hasArticle && (
                  <>
                    <section
                      ref={(el) => (sectionsRef.current[1] = el)}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                          Article Preview
                        </h3>
                        <div className="flex gap-2">
                          {isAdvertiser && !isEditingArticle && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] bg-white"
                              onClick={() => setIsEditingArticle(true)}
                            >
                              <EditIcon className="w-2.5 h-2.5 mr-1" /> Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      <Card className="border-border shadow-sm bg-white overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        {isEditingArticle ? (
                          <div className="p-4 space-y-4">
                            {/* Title input */}
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Title
                              </Label>
                              <Input
                                value={hg}
                                onChange={(e) =>
                                  setArticleTitle(e.target.value)
                                }
                                className="font-serif text-lg"
                              />
                            </div>

                            {/* Rich-text editor */}
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Content
                              </Label>
                              <div className="bg-card rounded-lg border border-border shadow-sm overflow-visible">
                                {/* Toolbar */}
                                <div className="px-1.5 py-1 border-b border-border bg-muted/10 flex flex-wrap items-center gap-0.5 sticky top-0 z-10 backdrop-blur-sm">
                                  <RteToolbarButton
                                    onClick={() => rteExec("undo")}
                                    title="Undo"
                                  >
                                    <Undo2Icon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("redo")}
                                    title="Redo"
                                  >
                                    <Redo2Icon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarDivider />

                                  {/* Heading dropdown */}
                                  <div
                                    className="relative"
                                    ref={rteHeadingDropdownRef}
                                  >
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        rteSaveSelection();
                                        setRteShowHeadingDropdown((v) => !v);
                                      }}
                                      className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground rounded transition-colors min-w-[88px]"
                                    >
                                      <TypeIcon className="w-3 h-3 shrink-0" />
                                      <span className="flex-1 text-left">
                                        {rteGetCurrentHeadingLabel()}
                                      </span>
                                      <ChevronDownIcon className="w-2.5 h-2.5 shrink-0" />
                                    </button>
                                    {rteShowHeadingDropdown && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                                        {HEADING_OPTIONS.map((h) => (
                                          <button
                                            key={h.tag}
                                            type="button"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              rteApplyHeading(h.tag);
                                            }}
                                            className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${h.className}`}
                                          >
                                            {h.label}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <RteToolbarDivider />

                                  <RteToolbarButton
                                    onClick={() => rteExec("bold")}
                                    title="Bold"
                                    active={rteActiveFormats.bold}
                                  >
                                    <BoldIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("italic")}
                                    title="Italic"
                                    active={rteActiveFormats.italic}
                                  >
                                    <ItalicIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("underline")}
                                    title="Underline"
                                    active={rteActiveFormats.underline}
                                  >
                                    <UnderlineIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("strikeThrough")}
                                    title="Strikethrough"
                                    active={rteActiveFormats.strikeThrough}
                                  >
                                    <StrikethroughIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() =>
                                      rteExec("formatBlock", "pre")
                                    }
                                    title="Code Block"
                                  >
                                    <CodeIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarDivider />

                                  {/* Text color */}
                                  <div
                                    className="relative"
                                    ref={rteColorPickerRef}
                                  >
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        rteSaveSelection();
                                        setRteShowColorPicker((v) => !v);
                                        setRteShowHighlightPicker(false);
                                      }}
                                      title="Text Color"
                                      className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                    >
                                      <PaletteIcon className="w-3 h-3" />
                                    </button>
                                    {rteShowColorPicker && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl p-2 grid grid-cols-6 gap-1 w-[148px]">
                                        {TEXT_COLORS.map((c) => (
                                          <button
                                            key={c.value}
                                            type="button"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              rteApplyColor(c.value);
                                            }}
                                            title={c.label}
                                            className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
                                            style={{
                                              backgroundColor:
                                                c.value === "inherit"
                                                  ? "transparent"
                                                  : c.value,
                                              border:
                                                c.value === "inherit"
                                                  ? "1px solid var(--border)"
                                                  : undefined,
                                            }}
                                          >
                                            {c.value === "inherit" && (
                                              <span className="text-[8px] text-foreground font-bold flex items-center justify-center h-full">
                                                A
                                              </span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Highlight */}
                                  <div
                                    className="relative"
                                    ref={rteHighlightPickerRef}
                                  >
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        rteSaveSelection();
                                        setRteShowHighlightPicker((v) => !v);
                                        setRteShowColorPicker(false);
                                      }}
                                      title="Highlight"
                                      className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                    >
                                      <HighlighterIcon className="w-3 h-3" />
                                    </button>
                                    {rteShowHighlightPicker && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl p-2 flex gap-1 w-auto">
                                        {HIGHLIGHT_COLORS.map((c) => (
                                          <button
                                            key={c.value}
                                            type="button"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              rteApplyHighlight(c.value);
                                            }}
                                            title={c.label}
                                            className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c.value }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <RteToolbarDivider />

                                  <RteToolbarButton
                                    onClick={() =>
                                      rteExec("insertUnorderedList")
                                    }
                                    title="Bullet List"
                                    active={
                                      rteActiveFormats.insertUnorderedList
                                    }
                                  >
                                    <ListIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("insertOrderedList")}
                                    title="Ordered List"
                                    active={rteActiveFormats.insertOrderedList}
                                  >
                                    <ListOrderedIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() =>
                                      rteExec("formatBlock", "blockquote")
                                    }
                                    title="Blockquote"
                                  >
                                    <QuoteIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarDivider />

                                  <RteToolbarButton
                                    onClick={() => rteExec("justifyLeft")}
                                    title="Align Left"
                                    active={rteActiveFormats.justifyLeft}
                                  >
                                    <AlignLeftIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("justifyCenter")}
                                    title="Align Center"
                                    active={rteActiveFormats.justifyCenter}
                                  >
                                    <AlignCenterIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarButton
                                    onClick={() => rteExec("justifyRight")}
                                    title="Align Right"
                                    active={rteActiveFormats.justifyRight}
                                  >
                                    <AlignRightIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarDivider />

                                  {/* Insert Link */}
                                  <div className="relative">
                                    <RteToolbarButton
                                      onClick={() => {
                                        rteSaveSelection();
                                        setRteShowLinkDialog((v) => !v);
                                      }}
                                      title="Insert Link"
                                    >
                                      <Link2Icon className="w-3 h-3" />
                                    </RteToolbarButton>
                                    {rteShowLinkDialog && (
                                      <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl p-3 flex items-center gap-2 w-72">
                                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <input
                                          autoFocus
                                          type="url"
                                          value={rteLinkUrl}
                                          onChange={(e) =>
                                            setRteLinkUrl(e.target.value)
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              rteInsertLink();
                                            if (e.key === "Escape")
                                              setRteShowLinkDialog(false);
                                          }}
                                          placeholder="https://example.com"
                                          className="flex-1 text-xs bg-background border border-input rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                          type="button"
                                          onClick={rteInsertLink}
                                          className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                                        >
                                          Add
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Insert Image */}
                                  <RteToolbarButton
                                    onClick={() =>
                                      articleImageInputRef.current?.click()
                                    }
                                    title="Insert Image"
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <input
                                    ref={articleImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={rteInsertImage}
                                  />

                                  <RteToolbarButton
                                    onClick={() =>
                                      rteExec("insertHorizontalRule")
                                    }
                                    title="Horizontal Rule"
                                  >
                                    <MinusIcon className="w-3 h-3" />
                                  </RteToolbarButton>
                                  <RteToolbarDivider />

                                  <RteToolbarButton
                                    onClick={() => rteExec("removeFormat")}
                                    title="Clear Formatting"
                                  >
                                    <span className="text-[10px] font-bold px-0.5">
                                      Tx
                                    </span>
                                  </RteToolbarButton>
                                </div>

                                {/* Editable area */}
                                <div
                                  className="relative overflow-y-auto"
                                  style={{ maxHeight: "420px" }}
                                >
                                  {rteEditorEmpty && (
                                    <div className="absolute top-4 left-4 text-muted-foreground/50 text-sm pointer-events-none select-none">
                                      Start writing your article here…
                                    </div>
                                  )}
                                  <div
                                    ref={articleEditorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={(e) => {
                                      const html = e.currentTarget.innerHTML;
                                      setRteEditorEmpty(
                                        !html || html === "<br>",
                                      );
                                      rteUpdateActiveFormats();
                                    }}
                                    onKeyUp={rteUpdateActiveFormats}
                                    onMouseUp={rteUpdateActiveFormats}
                                    onFocus={rteUpdateActiveFormats}
                                    className="min-h-[360px] p-4 focus:outline-none text-sm leading-relaxed prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-1 [&_h4]:mt-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3 [&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-3 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:my-2 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:rounded-md [&_img]:my-3 [&_hr]:border-border [&_hr]:my-4 [&_p]:mb-2"
                                    style={{ wordBreak: "break-word" }}
                                  />
                                </div>

                                {/* Word count */}
                                <div className="px-4 py-2 border-t border-border bg-muted/10 flex justify-end">
                                  <span className="text-[10px] text-muted-foreground">
                                    {articleEditorRef.current?.innerText
                                      ?.trim()
                                      .split(/\s+/)
                                      .filter(Boolean).length || 0}{" "}
                                    words
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingArticle(false)}
                                className="h-8 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveDetails}
                                className="h-8 text-xs gap-1.5"
                              >
                                <SaveIcon className="w-3.5 h-3.5" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="border-b border-border px-4 py-3 bg-slate-50/50">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                                Title
                              </label>
                              <div className="flex items-start justify-between gap-4">
                                <h1 className="text-lg font-serif font-semibold text-foreground leading-tight">
                                  {articleTitle}
                                </h1>
                                <button
                                  onClick={() =>
                                    handleCopy(articleTitle, "title")
                                  }
                                  className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-slate-200/50 shrink-0"
                                  title="Copy Title"
                                >
                                  {copiedField === "title" ? (
                                    <CheckIcon className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <CopyIcon className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="p-5">
                              <div className="font-serif">
                               {renderMarkdown(order.submissionData?.articleContent || "")}
                              </div>
                            </div>
                            <div className="px-5 pb-5 pt-0 flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-[11px] bg-white"
                                onClick={() =>
                                  handleCopy(articleContent, "article")
                                }
                              >
                                {copiedField === "article" ? (
                                  <CheckIcon className="w-3 h-3 mr-1.5 text-green-600" />
                                ) : (
                                  <CopyIcon className="w-3 h-3 mr-1.5" />
                                )}
                                Copy Text
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-[11px] bg-white"
                                onClick={handleDownload}
                              >
                                <DownloadIcon className="w-3 h-3 mr-1.5" />{" "}
                                Download
                              </Button>
                            </div>
                          </>
                        )}
                      </Card>
                    </section>

                    <Separator className="bg-border/60" />
                  </>
                )}

                {/* SECTION 3: LINKS */}
                <section
                  ref={(el) => (sectionsRef.current[2] = el)}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Target Links
                    </h3>
                    <div className="flex items-center gap-2">
                      {isAdvertiser && !isEditingLinks && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingLinks(true)}
                          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary"
                        >
                          <EditIcon className="w-2.5 h-2.5 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {links.map((link, index) => (
                      <Card
                        key={index}
                        className="border-border shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 space-y-1 min-w-0 w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Anchor Text
                              </span>
                              {!isEditingLinks && (
                                <button
                                  onClick={() =>
                                    handleCopy(link.anchor, `anchor-${index}`)
                                  }
                                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                >
                                  {copiedField === `anchor-${index}` ? (
                                    <CheckIcon className="w-2.5 h-2.5" />
                                  ) : (
                                    <CopyIcon className="w-2.5 h-2.5" />
                                  )}
                                  Copy
                                </button>
                              )}
                            </div>
                            {isEditingLinks ? (
                              <Input
                                value={link.anchor}
                                onChange={(e) =>
                                  handleLinkChange(
                                    index,
                                    "anchor",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              <div className="p-2 bg-slate-50 border border-border rounded-md font-normal text-xs text-foreground break-words">
                                {link.anchor}
                              </div>
                            )}
                          </div>

                          <div className="hidden sm:flex text-slate-300">
                            <ArrowRightIcon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 space-y-1 min-w-0 w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Target URL
                              </span>
                              {!isEditingLinks && (
                                <button
                                  onClick={() =>
                                    handleCopy(link.url, `url-${index}`)
                                  }
                                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                >
                                  {copiedField === `url-${index}` ? (
                                    <CheckIcon className="w-2.5 h-2.5" />
                                  ) : (
                                    <CopyIcon className="w-2.5 h-2.5" />
                                  )}
                                  Copy
                                </button>
                              )}
                            </div>
                            {isEditingLinks ? (
                              <Input
                                value={link.url}
                                onChange={(e) =>
                                  handleLinkChange(index, "url", e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              <div className="p-2 bg-slate-50 border border-border rounded-md text-xs text-blue-600 break-all flex items-center gap-2">
                                <GlobeIcon className="w-3 h-3 shrink-0 opacity-50" />
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline truncate"
                                >
                                  {link.url}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="sm:w-20 shrink-0 pt-3 sm:pt-0 flex justify-end">
                            {isEditingLinks ? (
                              <Input
                                value={link.type || "Do-Follow"}
                                onChange={(e) =>
                                  handleLinkChange(
                                    index,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs w-24"
                              />
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-white text-[10px] font-normal h-5 px-2"
                              >
                                {link.type || "Do-Follow"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}

                    {isEditingLinks && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingLinks(false)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveDetails}
                          className="h-8 text-xs"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </div>

          {/* Workspace Footer - Actions */}
          <div className="p-4 border-t border-border bg-white flex justify-end gap-3 shrink-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {/* PUBLISHER ACTIONS */}
            {isPublisher && (
              <>
                {/* New Request */}
                {order.status === "new_request" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onCancelOrder?.(order.id)}
                      className="h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      <XCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      onClick={onPublisherAccept}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 px-3 text-xs font-medium"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                      Accept Order
                    </Button>
                  </>
                )}

                {/* In Progress (No Link) */}
                {order.status === "in_progress" && !order.submittedUrl && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onCancelOrder?.(order.id)}
                      className="h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      Cancel Order
                    </Button>
                    <Button
                      onClick={onOpenSubmitLink}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-8 px-3 text-xs font-medium"
                    >
                      <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                      Submit Link
                    </Button>
                  </>
                )}

                {/* In Revision */}
                {order.status === "in_revision" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={onOpenResolution}
                      className="h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 whitespace-nowrap gap-1.5"
                    >
                      <AlertTriangleIcon className="w-3.5 h-3.5" />
                      Open Resolution
                    </Button>
                    <Button
                      onClick={handleSaveDetails}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm h-8 px-3 text-xs font-medium"
                    >
                      <RefreshCwIcon className="w-3.5 h-3.5 mr-1.5" />
                      Submit Update
                    </Button>
                  </>
                )}
              </>
            )}

            {/* ADVERTISER ACTIONS */}
            {isAdvertiser && (
              <>
                {/* New Request & In Progress (No Link) */}
                {(order.status === "new_request" ||
                  (order.status === "in_progress" && !order.submittedUrl)) && (
                  <Button
                    variant="outline"
                    onClick={() => onCancelOrder?.(order.id)}
                    className="h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    Cancel Order
                  </Button>
                )}

                {/* In Progress (With Link) - Review Stage */}
                {order.status === "in_progress" && order.submittedUrl && (
                  <>
                    <Button
                      variant="outline"
                      onClick={onOpenResolution}
                      className="h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
                    >
                      <AlertTriangleIcon className="w-3.5 h-3.5" />
                      Resolution
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onRequestRevision}
                      className="h-8 px-3 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                    >
                      <RefreshCwIcon className="w-3.5 h-3.5 mr-1.5" />
                      Request Revision
                    </Button>
                    <Button
                      onClick={onAcceptOrder}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 px-3 text-xs font-medium"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                      Accept Order
                    </Button>
                  </>
                )}

                {/* In Revision */}
                {order.status === "in_revision" && (
                  <Button
                    variant="outline"
                    onClick={onOpenResolution}
                    className="h-8 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 whitespace-nowrap gap-1.5"
                  >
                    <AlertTriangleIcon className="w-3.5 h-3.5" />
                    Open Resolution
                  </Button>
                )}
              </>
            )}

            {/* Close Button (Always visible if no other actions or for completed/cancelled) */}
            {["completed", "cancelled", "in_resolution"].includes(
              order.status,
            ) && (
              <Button
                variant="outline"
                onClick={onClose}
                className="h-8 px-3 text-xs font-medium"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
