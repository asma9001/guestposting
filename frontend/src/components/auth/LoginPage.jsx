import { useState } from "react";
import { EyeIcon, EyeOffIcon, GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/userStore";
import { authApi, setTokens } from "../../lib/api";
import { toast } from "sonner";

export function LoginPage({ onLogin, onNavigateToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("advertiser");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const { login } = useUserStore();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await authApi.login({ email, password, role });

      if (res?.success) {
        const { token, user } = res;

        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);
      
        useUserStore.setState({ user, role: user.role, isAuthenticated: true });

        toast.success("Login Successful");
        
        setTimeout(() => {
          onLogin(token, user.role);
        }, 500);
      }
    } catch (err) {
      console.error("Login Error:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <GlobeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">
            ContLinks
          </span>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              The smarter way to build backlinks
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-md">
              Connect with premium publishers, manage guest post campaigns, and
              track your SEO growth — all in one place.
            </p>
          </div>
          <div className="flex gap-8">
            {[
              { value: "10,000+", label: "Publishers" },
              { value: "50K+", label: "Orders Placed" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white text-2xl font-bold">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <p className="text-white/90 text-sm leading-relaxed">
            "ContLinks cut our link building time in half. The publisher quality
            is unmatched and the dashboard makes tracking a breeze."
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <GlobeIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground text-lg font-semibold">
              ContLinks
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your account to continue
            </p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {["advertiser", "publisher"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200",
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r === "advertiser" ? "🎯 Advertiser" : "🌐 Publisher"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password}</p>
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={onNavigateToSignup}
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
