import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2Icon,
  MessageSquareIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  PenToolIcon,
  EyeOffIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ArticleSubmissionModal } from "./ArticleSubmissionModal";
import { OutsourceWritingModal } from "./OutsourceWritingModal";
import api from "../../lib/api";

// Validation Functions
const isSubmitFilled = (item) => {
  if (!item.submissionData) return false;
  const content = item.submissionData.content;
  return content && content.trim().length > 0 && content !== "<br>";
};

const isOutsourceFilled = (item) => {
  if (!item.submissionData) return false;
  const links = item.submissionData.links;
  if (!Array.isArray(links) || links.length === 0) return false;
  return links.some((l) => l.anchor?.trim() && l.url?.trim());
};

const getItemStatus = (item) => {
  if (!item.writingOption) return "missing_details";
  if (item.writingOption === "submit" && !isSubmitFilled(item))
    return "missing_details";
  if (item.writingOption === "outsource" && !isOutsourceFilled(item))
    return "missing_details";
  return "details_added";
};

const validateItem = (item) => {
  if (!item.project || item.project.trim() === "") {
    return "Please select a project.";
  }
  if (!item.writingOption) {
    return "Please select a writing option.";
  }
  if (item.writingOption === "submit" && !isSubmitFilled(item)) {
    return "Article content is empty.";
  }
  if (item.writingOption === "outsource" && !isOutsourceFilled(item)) {
    return "Please fill in Outsource Writing details.";
  }
  return null;
};

export function CartPage({ onNavigate, setLastOrder } = {}) {
  const { items, removeItem, updateItem, calculateItemTotal } = useCartStore();

  const containerRef = useRef(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [outsourceModalOpen, setOutsourceModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemErrors, setItemErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/projects/");
        if (response.data?.data) {
          const formatted = response.data.data.map((proj) => ({
            id: proj._id,
            name: proj.name,
          }));
          setProjects(formatted);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Animate items on mount
  useEffect(() => {
    if (containerRef.current?.children.length) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      );
    }
  }, [items.length]);

  const includedItems = items.filter((i) => i.writingOption !== undefined);
  const total = includedItems.reduce(
    (sum, i) => sum + calculateItemTotal(i),
    0,
  );

  // Handle checkbox change - toggle item inclusion
  const handleCheckboxChange = useCallback(
    (item, checked) => {
      if (checked) {
        // Include item by setting default writing option to "submit"
        updateItem(item.cartEntryId, { writingOption: "submit" });
        setItemErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[item.cartEntryId];
          return newErrors;
        });
      } else {
        // Remove item from cart
        removeItem(item.cartEntryId);
        setItemErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[item.cartEntryId];
          return newErrors;
        });
      }
    },
    [updateItem, removeItem],
  );

  // Handle submit article option
  const handleSubmitArticleClick = useCallback(
    (item) => {
      if (item.writingOption === "submit") {
        // Unselect - set to undefined
        updateItem(item.cartEntryId, { writingOption: undefined });
        setItemErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[item.cartEntryId];
          return newErrors;
        });
      } else {
        // Select - open modal
        setSelectedItemId(item.cartEntryId);
        setSubmissionModalOpen(true);
      }
    },
    [updateItem],
  );

  // Handle outsource writing option
  const handleOutsourceWritingClick = useCallback(
    (item) => {
      if (item.writingOption === "outsource") {
        // Unselect - set to undefined
        updateItem(item.cartEntryId, { writingOption: undefined });
        setItemErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[item.cartEntryId];
          return newErrors;
        });
      } else {
        // Select - open modal
        setSelectedItemId(item.cartEntryId);
        setOutsourceModalOpen(true);
      }
    },
    [updateItem],
  );

  // Handle submission modal save
  const handleSubmissionSave = useCallback(
    (data) => {
      if (!selectedItemId) {
        console.error("No item selected");
        return;
      }
      updateItem(selectedItemId, {
        writingOption: "submit",
        submissionData: data,
        status: "details_added",
      });
      setSubmissionModalOpen(false);
      setSelectedItemId(null);
    },
    [selectedItemId, updateItem],
  );

  // Handle outsource modal save
  const handleOutsourceSave = useCallback(
    (data) => {
      if (!selectedItemId) {
        console.error("No item selected");
        return;
      }
      updateItem(selectedItemId, {
        writingOption: "outsource",
        submissionData: data,
        status: "details_added",
      });
      setItemErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[selectedItemId];
        return newErrors;
      });
      setOutsourceModalOpen(false);
      setSelectedItemId(null);
    },
    [selectedItemId, updateItem],
  );

  // Get submission data for modal
  const getSubmissionData = useCallback(() => {
    if (!selectedItemId) return undefined;
    const item = items.find((i) => i.cartEntryId === selectedItemId);
    return item?.submissionData;
  }, [selectedItemId, items]);

  // Handle place order with validation
  const handlePlaceOrder = useCallback(async () => {
    console.log("Current Cart Items in Store:", includedItems); // Debugging line to check what items we are trying to order
    if (includedItems.length === 0) return;

    // Validate all items
    const newErrors = {};
    let firstErrorId = null;

    for (const item of includedItems) {
      const error = validateItem(item);
      if (error) {
        newErrors[item.cartEntryId] = error;
        if (!firstErrorId) firstErrorId = item.cartEntryId;
      }
    }

    setItemErrors(newErrors);

    // If validation fails, scroll to first error
    if (Object.keys(newErrors).length > 0 && firstErrorId) {
      setTimeout(() => {
        const element = document.getElementById(firstErrorId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    // Place order
    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        items: includedItems,
        totalAmount: total,
      };

      const response = await api.post("/api/orders/", orderPayload);

      if (response.status === 201 || response.data?.success) {
        if (typeof onNavigate === "function") {
          includedItems.forEach((item) => {
            removeItem(item.cartEntryId);
          });
          if (typeof setLastOrder === "function") {
            setLastOrder(response.data);
          }
          onNavigate("order-confirmation");
        }
      }
    } catch (error) {
      console.error("Order placement failed:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  }, [includedItems, total, removeItem, onNavigate, setLastOrder]);

  return (
    <div className="w-full px-3 py-2 -mt-6">
      <ArticleSubmissionModal
        isOpen={submissionModalOpen}
        onClose={() => {
          setSubmissionModalOpen(false);
          setSelectedItemId(null);
        }}
        onSave={handleSubmissionSave}
        initialData={getSubmissionData()}
      />

      <OutsourceWritingModal
        isOpen={outsourceModalOpen}
        onClose={() => {
          setOutsourceModalOpen(false);
          setSelectedItemId(null);
        }}
        onSave={handleOutsourceSave}
        initialData={getSubmissionData()}
      />

      <div className="mb-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Your Cart
        </h1>
        <p className="text-xs text-muted-foreground">
          Review your selected websites and confirm your order details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Cart Items List */}
        <div ref={containerRef} className="lg:col-span-8 flex flex-col gap-3">
          {items.map((item) => {
            const status = getItemStatus(item);
            const isIncluded = item.writingOption !== undefined;
            const borderClass = isIncluded
              ? "border-primary/60 ring-1 ring-primary/20"
              : "border-border opacity-60";

            return (
              <div
                key={item.cartEntryId}
                id={item.cartEntryId}
                className={`group relative flex flex-col bg-card rounded-lg shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${borderClass}`}
              >
                <div className="p-4 flex gap-3">
                  <div className="shrink-0 pt-1">
                    <Checkbox
                      checked={isIncluded}
                      onCheckedChange={(val) => handleCheckboxChange(item, val)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <div
                              className={`size-7 rounded-md ${item.initialColor} flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5`}
                            >
                              {item.initial}
                            </div>
                            {item.domain}
                          </h3>

                          {status === "missing_details" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50">
                              <AlertCircleIcon className="w-3 h-3" />
                              <span>Missing Details</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/50">
                              <CheckCircleIcon className="w-3 h-3" />
                              <span>Details Added</span>
                            </span>
                          )}

                          <button
                            className="flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Message Publisher"
                          >
                            <MessageSquareIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-foreground">
                          ${item.priceNormal}
                        </p>
                        <button
                          onClick={() => removeItem(item.cartEntryId)}
                          className="group/remove flex items-center justify-end gap-1 text-[10px] font-medium text-muted-foreground hover:text-destructive mt-0.5 ml-auto transition-colors"
                        >
                          <Trash2Icon className="w-3 h-3" />
                          <span className="group-hover/remove:underline">
                            Remove
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Configuration Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-border">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Project <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={item.project || ""}
                          onValueChange={(val) => {
                            updateItem(item.cartEntryId, { project: val });
                            setItemErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors[item.cartEntryId];
                              return newErrors;
                            });
                          }}
                        >
                          <SelectTrigger
                            className={`w-full bg-background ${
                              itemErrors[item.cartEntryId]?.includes("project")
                                ? "border-destructive ring-1 ring-destructive"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.name}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Order Type <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={item.orderType || ""}
                          onValueChange={(val) =>
                            updateItem(item.cartEntryId, { orderType: val })
                          }
                        >
                          <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="Select order type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="sensitive">
                              Sensitive Topic (+${item.priceSensitive})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Writing Options */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Writing Options
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Submit Article */}
                        <div
                          className="relative flex-1 cursor-pointer group/option"
                          onClick={() => handleSubmitArticleClick(item)}
                        >
                          <div
                            className={`h-full px-3 py-2 rounded-lg border transition-all hover:bg-accent ${
                              item.writingOption === "submit"
                                ? isSubmitFilled(item)
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-amber-400 bg-amber-50/50 ring-1 ring-amber-400 dark:bg-amber-900/20"
                                : "border-border bg-card"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-semibold text-foreground">
                                Submit Article
                              </span>
                              {item.writingOption === "submit" &&
                                (isSubmitFilled(item) ? (
                                  <CheckCircleIcon className="w-4 h-4 text-primary" />
                                ) : (
                                  <AlertCircleIcon className="w-4 h-4 text-amber-500" />
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {item.writingOption === "submit" &&
                              !isSubmitFilled(item)
                                ? "Click to fill article content"
                                : "Provide your own content"}
                            </p>
                          </div>
                        </div>

                        {/* Outsource Writing */}
                        <div
                          className="relative flex-1 cursor-pointer group/option"
                          onClick={() => handleOutsourceWritingClick(item)}
                        >
                          <div
                            className={`h-full px-3 py-2 rounded-lg border transition-all hover:bg-accent ${
                              item.writingOption === "outsource"
                                ? isOutsourceFilled(item)
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-amber-400 bg-amber-50/50 ring-1 ring-amber-400 dark:bg-amber-900/20"
                                : "border-border bg-card"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground">
                                  Outsource Writing
                                </span>
                                <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  +${item.priceCopywriting}
                                </span>
                              </div>
                              {item.writingOption === "outsource" &&
                                (isOutsourceFilled(item) ? (
                                  <CheckCircleIcon className="w-4 h-4 text-primary" />
                                ) : (
                                  <AlertCircleIcon className="w-4 h-4 text-amber-500" />
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {item.writingOption === "outsource" &&
                              !isOutsourceFilled(item)
                                ? "Click to fill writing details"
                                : "We write it for you"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Per-item error */}
                      {itemErrors[item.cartEntryId] && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-destructive">
                          <XCircleIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{itemErrors[item.cartEntryId]}</span>
                        </div>
                      )}
                    </div>

                    {/* Item Footer */}
                    <div className="mt-2 pt-3 border-t border-dashed border-border flex justify-between items-center bg-muted/30 -mx-4 -mb-4 px-4 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Total for this item:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.writingOption === "outsource" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50">
                              <PenToolIcon className="w-3 h-3" />
                              Writing
                            </span>
                          )}
                          {item.orderType === "sensitive" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50">
                              <EyeOffIcon className="w-3 h-3" />
                              Sensitive
                            </span>
                          )}
                          {item.orderType === "casino" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50">
                              <span className="text-[10px]">🎲</span>
                              Casino
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-base font-bold text-foreground">
                        ${calculateItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add More Section */}
          <div className="flex items-center justify-center py-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
            <div className="text-center">
              <PlusCircleIcon
                className="w-8 h-8 text-muted-foreground mx-auto mb-1.5"
                strokeWidth={1.5}
              />
              <p className="text-xs font-medium text-muted-foreground">
                Want more exposure?
              </p>
              <span className="text-sm font-semibold text-primary hover:underline">
                Browse Catalogue
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="p-4">
              <h2 className="text-sm font-bold text-foreground mb-3">
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    Total Order Value ({includedItems.length} of {items.length}{" "}
                    item{items.length !== 1 ? "s" : ""})
                  </span>
                  <span className="font-medium text-foreground">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border my-2 pt-2">
                  <div className="flex justify-between items-end mb-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    USD
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={includedItems.length === 0 || isPlacingOrder}
                className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 text-sm rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>
                  {isPlacingOrder
                    ? "Placing Order..."
                    : `Place Order ($${total.toFixed(2)})`}
                </span>
              </Button>
              <div className="mt-3 flex items-center justify-center text-center px-2">
                <p className="text-xs text-muted-foreground">
                  Total amount will be deducted from your account balance.
                </p>
              </div>
            </div>
            <div className="bg-muted/50 p-2.5 border-t border-border">
              <div className="flex items-start gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">
                    Secure Transaction.
                  </span>
                  Funds are deducted immediately from your balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
