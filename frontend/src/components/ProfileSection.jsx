import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserIcon,
  LockIcon,
  BriefcaseIcon,
  WalletIcon,
  CameraIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  StarIcon ,
  ThumbsUpIcon ,
  ThumbsDownIcon,

  MessageSquareIcon,
  BuildingIcon,
  ShoppingBagIcon,
  AlertCircle,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { cn } from "@/lib/utils";
import {
  updateProfile,
  updatePassword,
  updateBusiness,
} from "../services/profileApi";

export function ProfileSection({ onBack }) {
  const { user, role, isLoading, fetchProfile } = useUserStore();

  const token = localStorage.getItem("accessToken");
  console.log("user", user);

  // ✅ STATE DEFINITIONS
  const [isBusinessVerified, setIsBusinessVerified] = useState(
    user?.business?.isVerified || false,
  );
  // ProfileSection ke upar baaki states ke sath ise add karein:
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialNameParts = user?.fullName
    ? user.fullName.trim().split(" ")
    : [];
  const initialFirstName = initialNameParts[0] || "";
  const initialLastName = initialNameParts.slice(1).join(" ") || "";
  // ✅ PERSONAL FORM STATE
  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    phone: user?.phone || "",
    phoneCode: user?.phoneCode || "+1",
    timezone: user?.timezone || "utc-5",
  });

  // ✅ PASSWORD FORM STATE (THIS WAS MISSING!)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ BUSINESS FORM STATE (THIS WAS MISSING!)
  const [businessForm, setBusinessForm] = useState({
    companyName: user?.business?.companyName || "",
    regNumber: user?.business?.regNumber || "",
    vatNumber: user?.business?.vatNumber || "",
    address: user?.business?.address || "",
    country: user?.business?.country || "",
    city: user?.business?.city || "",
    postalCode: user?.business?.postalCode || "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const fileInputRef = useRef(null);

  console.log("user in profile section:", user);
  const isPublisher = role === "publisher";

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      );
    }
    if (tabsRef.current) {
      gsap.fromTo(
        tabsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" },
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      // 💡 FullName ko split karein space ke zariye
      // Agar name "John Doe" hai to parts = ["John", "Doe"]
      const nameParts = user.fullName ? user.fullName.trim().split(" ") : [];
      const firstName = nameParts[0] || "";
      // Agar middle name bhi ho to baaki saara hissa lastName ban jaye
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        phone: user.phone || "",
        phoneCode: user.phoneCode || "+1",
        timezone: user.timezone || "utc-5",
      });

      setBusinessForm({
        companyName: user?.business?.companyName || "",
        regNumber: user?.business?.regNumber || "",
        vatNumber: user?.business?.vatNumber || "",
        address: user?.business?.address || "",
        country: user?.business?.country || "",
        city: user?.business?.city || "",
        postalCode: user?.business?.postalCode || "",
      });

      setAvatarPreview(user.avatar || "");
      setIsBusinessVerified(user?.business?.isVerified || false);
    }
  }, [user]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setAvatarPreview(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ UPLOAD AVATAR
  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append("avatar", avatarFile);

      const result = await updateProfile(user.id, formDataObj);
      if (result.success) {
        setSuccessMessage("Avatar updated successfully!");
        setAvatarFile(null);
        await fetchProfile();
      } else {
        setErrorMessage(result.error || "Failed to update avatar");
      }
    } catch (err) {
      setErrorMessage("Error uploading avatar");
    } finally {
      setLoading(false);
    }
  };
  const handleSavePersonal = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      const form = new FormData();
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      form.append("fullName", fullName);
      form.append("phone", formData.phone);
      form.append("phoneCode", formData.phoneCode);
      form.append("timezone", formData.timezone);
      if (avatarFile) {
        form.append("avatar", avatarFile);
      }

      const res = await updateProfile(user.id, form);

      if (res.success) {
        setSuccessMessage("Profile updated successfully!");
        setAvatarFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        await fetchProfile();

        // 🎯 Jese hi save successfully ho, Next tab par bhej dein
        setActiveTab("security");
      } else {
        setErrorMessage(res.error || "Failed to update profile");
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAVE PASSWORD
  const handleSavePassword = async () => {
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New passwords do not match");
      setLoading(false);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    console.log("Attempting to update password for user ID:", user.id);
    try {
      const result = await updatePassword(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      if (result.success) {
        setSuccessMessage("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
              setActiveTab("business");
      } else {
        setErrorMessage(result.error || "Failed to update password");
      }
    } catch (err) {
      console.error("Error:", err);
      setErrorMessage(err.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAVE BUSINESS INFO
// ✅ SAVE BUSINESS INFO (UPDATED VALIDATION & ERROR HANDLING)
  const handleSaveBusiness = async () => {
    // 1. Agar user publisher hai aur details khali hain
    if (isPublisher) {
      if (
        !businessForm.companyName?.trim() ||
        !businessForm.regNumber?.trim() ||
        !businessForm.vatNumber?.trim() ||
        !businessForm.address?.trim() ||
        !businessForm.country?.trim() ||
        !businessForm.city?.trim() ||
        !businessForm.postalCode?.trim()
      ) {
        setErrorMessage("All business fields are required for publishers.");
        return;
      }
    } else {
      // 2. Agar user advertiser hai aur saari fields khali hain (Kuch bhi nahi likha)
      const allFieldsEmpty = Object.values(businessForm).every(
        (value) => !value || value.trim() === ""
      );
      if (allFieldsEmpty) {
        setErrorMessage("Please fill in at least some details before updating.");
        return;
      }
    }

    try {
      setLoading(true);
      setErrorMessage(""); // Purani errors clear karein
      setSuccessMessage("");

      const result = await updateBusiness(user.id, businessForm);
      
      if (result.success || result.data) {
        setSuccessMessage("Business information updated successfully!");
        await fetchProfile();
         setActiveTab("payment");
      } else {
        setErrorMessage(result.error || "Failed to update business info");
      }
    } catch (err) {
      console.error("❌ Catch Block Triggered - Error:", err);
      
      // Axios response error ko check karne ka sahi tarika:
      const serverErrorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Error updating business info";
        
      setErrorMessage(serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div ref={headerRef} className="mb-2">
        <h1 className="text-xl font-semibold text-foreground mb-0.5">
          Profile Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}
      {/* 🛑 defaultValue="personal" ko hata kar niche wali lines likhein */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        ref={tabsRef}
      >
        {" "}
        <TabsList className="grid w-full grid-cols-5 mb-4 bg-muted/50 p-1 rounded-xl h-auto border border-border/50 shadow-sm">
          <TabsTrigger
            value="personal"
            className="flex items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-tertiary/10 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 py-1.5 rounded-lg transition-all duration-300 hover:bg-accent/50"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">
              Personal
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-tertiary/10 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 py-1.5 rounded-lg transition-all duration-300 hover:bg-accent/50"
          >
            <LockIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">
              Security
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="business"
            className="flex items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-tertiary/10 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 py-1.5 rounded-lg transition-all duration-300 hover:bg-accent/50"
          >
            <BriefcaseIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">
              Business
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="flex items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-tertiary/10 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 py-1.5 rounded-lg transition-all duration-300 hover:bg-accent/50"
          >
            <WalletIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">
              Payment
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex items-center justify-center gap-1.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-tertiary/10 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 py-1.5 rounded-lg transition-all duration-300 hover:bg-accent/50"
          >
            <MessageSquareIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">
              Reviews
            </span>
          </TabsTrigger>
        </TabsList>
        {/* TAB 1: Personal */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-tertiary/5 to-primary/5 py-2.5 space-y-0.5">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Profile Information</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-border shadow-lg">
                      <AvatarImage src={avatarPreview} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-tertiary text-primary-foreground text-3xl">
                        {getInitials(user?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <CameraIcon className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  {avatarFile && (
                    <Button
                      size="sm"
                      onClick={handleUploadAvatar}
                      disabled={loading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {loading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {user?.fullName}
                    </h3>
                    <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200 capitalize">
                      {user?.membershipTier || "free"} Member
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted/40 border-border cursor-not-allowed"
                    />
                    <p className="text-xs text-primary font-medium">
                      Contact support to update email
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.phoneCode}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, phoneCode: value }))
                        }
                      >
                        <SelectTrigger className="w-24 bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+91">+91</SelectItem>
                          <SelectItem value="+92">+92</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value,
                          })
                        }
                        className="flex-1 bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, timezone: value }))
                        }
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc-5">UTC-5 (EST)</SelectItem>
                          <SelectItem value="utc-8">UTC-8 (PST)</SelectItem>
                          <SelectItem value="utc+0">UTC+0 (GMT)</SelectItem>
                          <SelectItem value="utc+5:30">
                            UTC+5:30 (IST)
                          </SelectItem>
                          <SelectItem value="utc+5">UTC+5 (PKT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input
                        value={formData.currency || "USD"}
                        disabled
                        className="bg-muted/40 border-border cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Button variant="outline" onClick={onBack} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSavePersonal} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* TAB 2: Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-tertiary/5 to-primary/5 py-2.5 space-y-0.5">
              <div className="flex items-center gap-2">
                <LockIcon className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Password & Security</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-2xl space-y-6">
                {[
                  {
                    label: "Current Password",
                    key: "currentPassword",
                    show: showCurrentPassword,
                    toggle: () => setShowCurrentPassword(!showCurrentPassword),
                    placeholder: "Enter current password",
                  },
                  {
                    label: "New Password",
                    key: "newPassword",
                    show: showNewPassword,
                    toggle: () => setShowNewPassword(!showNewPassword),
                    placeholder: "Enter new password",
                  },
                  {
                    label: "Confirm New Password",
                    key: "confirmPassword",
                    show: showConfirmPassword,
                    toggle: () => setShowConfirmPassword(!showConfirmPassword),
                    placeholder: "Confirm new password",
                  },
                ].map(({ label, key, show, toggle, placeholder }) => (
                  <div className="space-y-2" key={key}>
                    <Label>{label}</Label>
                    <div className="relative">
                      <Input
                        type={show ? "text" : "password"}
                        placeholder={placeholder}
                        value={passwordForm[key]}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            [key]: e.target.value,
                          })
                        }
                        className="bg-background border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {show ? (
                          <EyeOffIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• At least 8 characters</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Includes at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Button variant="outline" onClick={onBack} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSavePassword} disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* TAB 3: Business */}
        <TabsContent value="business" className="space-y-6">
          <Card className="border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-tertiary/5 to-primary/5 py-2.5 space-y-0.5">
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">
                  Business Information
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Manage your company details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {isPublisher && isBusinessVerified && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-900 mb-1">
                        Company Verified
                      </h4>
                      <p className="text-xs text-green-700">
                        Your business has been verified and approved.
                      </p>
                    </div>
                    <Badge className="bg-green-600 text-white border-0">
                      Verified
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Name {isPublisher && "*"}</Label>
                    <Input
                      placeholder="Acme Corporation"
                      value={businessForm.companyName}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          companyName: e.target.value,
                        })
                      }
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Number {isPublisher && "*"}</Label>
                    <Input
                      placeholder="REG-123456"
                      value={businessForm.regNumber}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          regNumber: e.target.value,
                        })
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>VAT Number {isPublisher && "*"}</Label>
                  <Input
                    placeholder="VAT-789012"
                    value={businessForm.vatNumber}
                    onChange={(e) =>
                      setBusinessForm({
                        ...businessForm,
                        vatNumber: e.target.value,
                      })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Business Address {isPublisher && "*"}</Label>
                  <Textarea
                    placeholder="Enter your business address"
                    value={businessForm.address}
                    onChange={(e) =>
                      setBusinessForm({
                        ...businessForm,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Country {isPublisher && "*"}</Label>
                    <Select
                      value={businessForm.country}
                      onValueChange={(value) =>
                        setBusinessForm({ ...businessForm, country: value })
                      }
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="pk">Pakistan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City {isPublisher && "*"}</Label>
                    <Input
                      placeholder="New York"
                      value={businessForm.city}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          city: e.target.value,
                        })
                      }
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code {isPublisher && "*"}</Label>
                    <Input
                      placeholder="10001"
                      value={businessForm.postalCode}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          postalCode: e.target.value,
                        })
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Button variant="outline" onClick={onBack} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSaveBusiness} disabled={loading}>
                  {loading ? "Saving..." : "Save Business Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* TAB 4: Payment */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-tertiary/5 to-primary/5 py-2.5 space-y-0.5">
              <div className="flex items-center gap-2">
                <WalletIcon className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Payment Methods</CardTitle>
              </div>
              <CardDescription className="text-xs">Manage your withdrawal and payment preferences</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* Added Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Active Payment Methods</h3>
                  <div className="space-y-3">
                    {/* PayPal */}
                    <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <WalletIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">PayPal</p>
                          <p className="text-xs text-muted-foreground">john.doe@paypal.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">Default</Badge>
                        <Button variant="ghost" size="sm">
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Crypto */}
                    <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                          <WalletIcon className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Crypto Wallet (USDT)</p>
                          <p className="text-xs text-muted-foreground font-mono">0x742d...3f4a</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Add Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add PayPal */}
                    <button className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <PlusIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Add PayPal</p>
                          <p className="text-xs text-muted-foreground">Connect your PayPal account</p>
                        </div>
                      </div>
                    </button>

                    {/* Add Crypto */}
                    <button className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                          <PlusIcon className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Add Crypto Wallet</p>
                          <p className="text-xs text-muted-foreground">Add cryptocurrency address</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Withdrawal Settings */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Withdrawal Settings</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultMethod">Default Payment Method</Label>
                      <Select defaultValue="paypal">
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paypal">PayPal - john.doe@paypal.com</SelectItem>
                          <SelectItem value="crypto">Crypto Wallet (USDT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-amber-900 mb-2">Withdrawal Information:</h4>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• Minimum withdrawal amount: $50</li>
                        <li>• Processing time: 2-5 business days</li>
                        <li>• Withdrawal fee: 2% (minimum $2)</li>
                        <li>• Maximum daily withdrawal: $10,000</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  className="border-border hover:bg-accent hover:border-primary/30 transition-all duration-300"
                  onClick={onBack}>
                  
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Button>
                <Button className="bg-gradient-1 text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Save Withdrawal Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* TAB 5: Reviews */}
       <TabsContent value="reviews" className="space-y-6">
          {/* Publisher Reviews — only shown to publishers */}
          {isPublisher && <Card className="border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-tertiary/5 to-primary/5 py-2.5 space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Publisher Reviews</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) =>
                    <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">4.2</span>
                  <span className="text-xs text-muted-foreground">(18 reviews)</span>
                </div>
              </div>
              <CardDescription className="text-xs">Reviews left by advertisers on your publisher work</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
              { name: 'Alex Turner', website: 'techcrunch.com', rating: 5, date: 'Mar 10, 2026', comment: 'Outstanding publisher! Article was delivered well ahead of schedule with excellent content quality. The link placement was exactly as requested. Highly recommend!', positive: true },
              { name: 'Maria Lopez', website: 'forbes.com', rating: 4, date: 'Feb 28, 2026', comment: 'Great communication throughout the process. Minor revisions were needed but handled promptly. Overall a very smooth experience and the DA of the site is impressive.', positive: true },
              { name: 'James Whitfield', website: 'entrepreneur.com', rating: 3, date: 'Feb 14, 2026', comment: 'Decent publisher, but turnaround was slightly longer than expected. Content quality was acceptable. Would use again for less time-sensitive campaigns.', positive: false },
              { name: 'Sophie Chen', website: 'inc.com', rating: 5, date: 'Jan 30, 2026', comment: 'Absolutely fantastic! The article went live within 24 hours and the organic traffic boost was noticeable. This publisher truly understands SEO best practices.', positive: true }].
              map((review, i) =>
              <div key={i} className="border border-border/60 rounded-lg p-4 hover:border-primary/30 hover:bg-accent/20 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {review.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.website}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) =>
                      <StarIcon key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
                      )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {review.positive ?
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0"><ThumbsUpIcon className="w-2.5 h-2.5 mr-1 inline" />Recommended</Badge> :
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0"><ThumbsDownIcon className="w-2.5 h-2.5 mr-1 inline" />Not Recommended</Badge>
                  }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>}

          {/* Advertiser Reviews — only shown to advertisers */}
          {!isPublisher && <Card className="border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 via-tertiary/5 to-primary/5 py-2.5 space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Advertiser Reviews</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) =>
                    <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= 5 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">4.8</span>
                  <span className="text-xs text-muted-foreground">(11 reviews)</span>
                </div>
              </div>
              <CardDescription className="text-xs">Reviews left by publishers on your advertiser campaigns</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
              { name: 'David Kim', campaign: 'SEO Boost Campaign', rating: 5, date: 'Mar 12, 2026', comment: 'Excellent advertiser! Clear instructions, fast payment, and very responsive communication. The brief was detailed and made the work much easier. Would gladly work with again.', positive: true },
              { name: 'Rachel Moore', campaign: 'Brand Awareness Q1', rating: 5, date: 'Feb 20, 2026', comment: 'One of the best advertisers I have worked with on this platform. Payment was instant upon delivery and the feedback was constructive and professional throughout.', positive: true },
              { name: 'Tom Hargreaves', campaign: 'Link Building Spring', rating: 4, date: 'Jan 18, 2026', comment: 'Good working relationship overall. Instructions were a bit vague initially but were clarified quickly when asked. Payment process was smooth and timely.', positive: true }].
              map((review, i) =>
              <div key={i} className="border border-border/60 rounded-lg p-4 hover:border-primary/30 hover:bg-accent/20 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {review.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.campaign}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) =>
                      <StarIcon key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
                      )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0"><ThumbsUpIcon className="w-2.5 h-2.5 mr-1 inline" />Recommended</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
