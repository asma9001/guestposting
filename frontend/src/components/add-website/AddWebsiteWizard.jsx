import { useState } from "react";
import { Step1Url } from "./Step1Url";
import { Step2Verification } from "./Step2Verification";
import { Step3Details } from "./Step3Details";
import { Step4Success } from "./Step4Success";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { websiteApi } from "../../services/websiteApi";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Website URL", description: "Enter domain" },
  { id: 2, label: "Verification", description: "Verify ownership" },
  { id: 3, label: "Details", description: "Pricing & rules" },
  { id: 4, label: "Complete", description: "Review & finish" },
];

export function AddWebsiteWizard({
  onClose,
  initialData,
  isEditing = false,
  onComplete,
  currentStatus,
  existingDomains = [],
}) {
  const [step, setStep] = useState(isEditing ? 3 : 1);
  const [formData, setFormData] = useState(initialData || {});
  const [resultStatus, setResultStatus] = useState("active");

  const updateData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async (data) => {
    const newData = data ? { ...formData, ...data } : formData;
    setFormData(newData);

    try {
      if (step === 3 && !isEditing) {
        const payload = {
          websiteUrl: newData.url,
          verificationStatus: "pending",
          verificationMethod: "manual",
          description: newData.description,
          instructions: newData.instructions,
          countries: newData.countries,
          language: newData.language,
          categories: newData.categories,
          sensitiveTopics: newData.sensitiveTopics || [],
          maxLinks: newData.maxLinks,
          linkType: newData.linkType,
          priceNormal: newData.priceNormal,
          priceSensitive: newData.priceSensitive,
          priceCopywriting: newData.priceCopywriting,
          enableCopywriting: newData.enableCopywriting,
          discount: newData.discount,
        };

        await websiteApi.create(payload);
        toast.success("Website created successfully 🚀");
      }

      if (step === 3 && isEditing) {
        const payload = {
          websiteUrl: newData.url,
          description: newData.description,
          instructions: newData.instructions,
          countries: newData.countries,
          language: newData.language,
          categories: newData.categories,
          sensitiveTopics: newData.sensitiveTopics || [], 
          maxLinks: newData.maxLinks,
          linkType: newData.linkType,
          priceNormal: newData.priceNormal,
          priceSensitive: newData.priceSensitive,
          priceCopywriting: newData.priceCopywriting,
          enableCopywriting: newData.enableCopywriting,
        };

        await websiteApi.update(newData.id, payload);
        toast.success("Website updated successfully ✏️");
      }

      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddAnother = () => {
    setStep(1);
    setFormData({});
    setResultStatus("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pt-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Portals
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {isEditing
                ? "Edit Website Details"
                : step === 1
                  ? "Add New Website"
                  : step === 2
                    ? "Verify Your Website"
                    : step === 3
                      ? "Website Details & Pricing"
                      : "Submission Complete"}
            </h1>
            {isEditing && currentStatus && (
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  currentStatus === "active" &&
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
                  currentStatus === "paused" &&
                    "bg-slate-100 text-slate-700 border-slate-200",
                  currentStatus === "in_review" &&
                    "bg-amber-50 text-amber-700 border-amber-200",
                  currentStatus === "rejected" &&
                    "bg-rose-50 text-rose-700 border-rose-200",
                )}
              >
                {currentStatus.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div
          className={cn(
            "order-2 lg:order-1",
            isEditing ? "lg:col-span-12" : "lg:col-span-9",
          )}
        >
          <div className="bg-card border border-border rounded-xl shadow-sm min-h-[500px]">
            {step === 1 && (
              <Step1Url
                onNext={handleNext}
                initialData={formData}
                existingDomains={existingDomains}
              />
            )}
            {step === 2 && (
              <Step2Verification
                onNext={handleNext}
                onBack={handleBack}
                initialData={formData}
              />
            )}
            {step === 3 && (
              <Step3Details
                onNext={handleNext}
                onBack={isEditing ? onClose : handleBack}
                initialData={formData}
                isEditing={isEditing}
              />
            )}
            {step === 4 && (
              <Step4Success
                onFinish={onClose}
                onAddAnother={handleAddAnother}
                isEditing={isEditing}
                status={resultStatus}
              />
            )}
          </div>
        </div>

        {/* Right Side Vertical Stepper - Hidden in Edit Mode */}
        {!isEditing && (
          <div className="lg:col-span-3 order-1 lg:order-2 sticky top-6">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">
                  Progress
                </h3>
                <div className="relative">
                  {/* Vertical Line Background */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-muted" />

                  <div className="space-y-8 relative">
                    {STEPS.map((s, index) => {
                      const isActive = step === s.id;
                      const isCompleted = step > s.id;

                      return (
                        <div
                          key={s.id}
                          className="relative flex items-start gap-4"
                        >
                          {/* Step Circle */}
                          <div
                            className={cn(
                              "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 shrink-0",
                              isActive
                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                                : isCompleted
                                  ? "bg-green-600 text-white border-green-600"
                                  : "bg-card text-muted-foreground border-border",
                            )}
                          >
                            {isCompleted ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              s.id
                            )}
                          </div>

                          {/* Step Content */}
                          <div
                            className={cn(
                              "flex-1 pt-1 transition-opacity duration-300",
                              isActive ? "opacity-100" : "opacity-70",
                            )}
                          >
                            <p
                              className={cn(
                                "text-sm font-medium leading-none mb-1",
                                isActive
                                  ? "text-primary"
                                  : isCompleted
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                              )}
                            >
                              {s.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.description}
                            </p>
                          </div>

                          {/* Active Indicator Arrow */}
                          {isActive && (
                            <div className="absolute -left-3 top-2 text-primary lg:hidden">
                              <ChevronRightIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
