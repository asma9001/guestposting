import { useState } from "react";
import { EyeIcon, EyeOffIcon, GlobeIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import { authApi, setTokens } from "../../lib/api";

export function SignupPage({ onSignup, onNavigateToLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("advertiser");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const passwordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-destructive",
    "bg-warning",
    "bg-yellow-400",
    "bg-success",
  ][strength];

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!agreed) newErrors.agreed = "You must agree to the terms";
    return newErrors;
  };

  const { signup } = useUserStore();



const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    toast.error("Please fix form errors");
    return;
  }
  
  setErrors({});
  setLoading(true);

  try {
    // 1. API Call
    // Yaad rahe: confirmPassword aksar backend par nahi bheja jata, 
    // agar aapka backend use accept kar raha hai toh theek hai.
    const res = await authApi.signup({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      confirmPassword:form.confirmPassword,
      role,
    });

    // 2. Success Check
    if (res?.success) {
      toast.success("Account created successfully! 🎉");
      
      // Zustand store update (optional, agar login bhi automatic karna hai)
      useUserStore.setState({ 
        user: res.user, 
        role: res.role, 
        isAuthenticated: true 
      });

      // 3. Navigation
      setTimeout(() => {
        onSignup(res.token, res.role);
      }, 1500);
    } else {
      toast.error(res?.message || "Registration failed");
    }
  } catch (err) {
    console.error("Signup Error:", err);
    // Backend se aane wale specific error message ko dikhana (e.g., "Email already exists")
    const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
  const roleCards = [
    {
      id: "advertiser",
      emoji: "🎯",
      title: "Advertiser",
      desc: "Buy guest posts & build backlinks",
    },
    {
      id: "publisher",
      emoji: "🌐",
      title: "Publisher",
      desc: "Sell placements & earn revenue",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-24 left-12 w-56 h-56 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <GlobeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">
            ContLinks
          </span>
        </div>

        <div className="relative space-y-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Join 10,000+ publishers and advertisers
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-md">
              Start building high-quality backlinks or monetizing your traffic
              today. Free to join.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "Access to 10,000+ premium publisher sites",
              "Real-time order tracking & messaging",
              "Secure payments with instant wallet",
              "Quality assurance on every placement",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-white/90 text-sm leading-relaxed">
            "Signed up as a publisher, added my site, and got my first order
            within 48 hours. The platform is incredibly easy to use."
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-7 py-4">
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <GlobeIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground text-lg font-semibold">
              ContLinks
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Join thousands growing their SEO with ContLinks
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3">
            {roleCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setRole(card.id)}
                className={cn(
                  "relative p-4 rounded-lg border-2 text-left transition-all duration-200",
                  role === card.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80",
                )}
              >
                {role === card.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <CheckIcon className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <div className="text-xl mb-1">{card.emoji}</div>
                <div className="text-sm font-semibold text-foreground">
                  {card.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {card.desc}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Smith"
                value={form.fullName}
                onChange={update("fullName")}
                className={cn(
                  "h-10",
                  errors.fullName &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {errors.fullName && (
                <p className="text-destructive text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                className={cn(
                  "h-10",
                  errors.email &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={update("password")}
                  className={cn(
                    "h-10 pr-10",
                    errors.password &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColor : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      strength >= 3
                        ? "text-success"
                        : strength >= 2
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  >
                    {strengthLabel} password
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  className={cn(
                    "h-10 pr-10",
                    errors.confirmPassword &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    agreed
                      ? "bg-primary border-primary"
                      : "border-input bg-background",
                  )}
                >
                  {agreed && (
                    <CheckIcon className="w-2.5 h-2.5 text-primary-foreground" />
                  )}
                </button>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to ContLinks'{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </span>
              </div>
              {errors.agreed && (
                <p className="text-destructive text-xs pl-6">{errors.agreed}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onNavigateToLogin}
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
