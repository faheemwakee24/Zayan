"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Store,
  ShoppingBag,
  Home,
} from "lucide-react";
import { useLoginMutation } from "@/services/redux/api/authApi";
import type { LoginPayload } from "@/services/redux/api/authApi";

type RoleType =
  | "ecommerceBuyer"
  | "ecommerceSeller"
  | "realEstateBuyer"
  | "realEstateSeller";

interface UserWithRoles {
  roles?: string[];
  [key: string]: unknown;
}

const roleConfig = {
  ecommerceBuyer: {
    label: "Ecommerce Buyer",
    icon: ShoppingBag,
    color: "primary",
    route: "/ecommerce/buyer/dashboard",
  },
  ecommerceSeller: {
    label: "Ecommerce Seller",
    icon: Store,
    color: "secondary",
    route: "/ecommerce/seller/dashboard",
  },
  realEstateBuyer: {
    label: "Real Estate Buyer",
    icon: Home,
    color: "accent",
    route: "/real-estate/buyer/dashboard",
  },
  realEstateSeller: {
    label: "Real Estate Seller",
    icon: Home,
    color: "primary",
    route: "/real-estate/seller/dashboard",
  },
};

export default function Login() {
  const router = useRouter();
  const [login, { isLoading: loading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("zayanToken");
      if (token) {
        // User is already logged in, redirect to home
        router.push("/");
      }
    }
  }, [router]);

  const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

  const persistSession = (token?: string, user?: unknown) => {
    if (token) {
      localStorage.setItem("zayanToken", token);
      document.cookie = `zayanToken=${token}; path=/; max-age=${COOKIE_MAX_AGE}`;
    }

    if (user) {
      const serialized = JSON.stringify(user);
      localStorage.setItem("user", serialized);
      document.cookie = `zayanUser=${encodeURIComponent(
        serialized,
      )}; path=/; max-age=${COOKIE_MAX_AGE}`;
    }
  };

  const hasAnyRole = (user: UserWithRoles) => {
    if (!user?.roles || !Array.isArray(user.roles)) return false;
    return user.roles.length > 0;
  };

  const getRedirectRoute = (role: RoleType) => {
    return roleConfig[role].route;
  };

  const handleRoleSelection = (role: RoleType) => {
    const route = getRedirectRoute(role);
    setShowRoleModal(false);
    router.push(route);
  };

  const handleLoginSuccess = (user: UserWithRoles) => {
    if (!hasAnyRole(user)) {
      router.push("/select-roles");
      return;
    }

    const roles = user?.roles || [];

    // If user has only one role, redirect directly
    if (roles.length === 1) {
      const role = roles[0] as RoleType;
      router.push(getRedirectRoute(role));
      return;
    }

    // If user has multiple roles, show modal
    if (roles.length > 1) {
      setUserRoles(roles);
      setShowRoleModal(true);
      return;
    }

    // Fallback
    router.push("/select-roles");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      const message = "Please fill in all fields";
      setError(message);
      toast({
        title: "Missing information",
        description: message,
        variant: "destructive",
      });
      return;
    }

    try {
      const credentials: LoginPayload = { email, password };

      const result = await login(credentials).unwrap();

      if (result?.message === "Login successful") {
        persistSession(result.token, result.user);

        // Dispatch custom event to notify Navbar of auth state change
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("authStateChange"));
        }

        toast({
          title: "Welcome back!",
          description: result?.message || "Login successful",
        });

        if (result?.user) {
          handleLoginSuccess(result.user);
        } else {
          router.push("/select-roles");
        }
      } else {
        const message = result?.message || "Unable to login. Please try again.";
        setError(message);
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error | undefined)?.message ||
        "Unable to login. Please try again.";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(11,54,66,0.90), rgba(15,70,86,0.90), rgba(24,78,95,0.90)), url('/Images/loginright.png')",
      }}
    >
      {/* Main Card */}
      <div className="relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-[#0f4656]">
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Left Side - Branding Section (desktop) */}
          <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center p-12">
            {/* Slanted Background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#0f4656",
                clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* Background Pattern/Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.15)" }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-lg">
              {/* Logo + Copy */}
              <div className="mb-10">
                <div className="inline-flex items-center justify-center gap-3 mb-4 w-full">
                  <img
                    src="/Images/footerlogo.png"
                    alt="Zayan Logo"
                    className="w-[150px] h-[150px]"
                  />
                </div>
                <h1
                  className="text-4xl xl:text-5xl font-heading font-bold mb-3"
                  style={{ color: "#ffffff" }}
                >
                  Seamless access to your marketplace.
                </h1>
                <p
                  className="text-sm md:text-base max-w-md"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Manage your ecommerce and real-estate activities from a
                  single, powerful dashboard. Sign in to continue where you left
                  off.
                </p>
              </div>

              {/* Illustration */}
              <div className="mt-6 flex justify-center lg:justify-start">
                <div className="relative w-64 h-64 xl:w-[500px] xl:h-72 rounded-xl overflow-hidden border border-[rgba(239,134,76,0.4)] shadow-2xl bg-[rgba(0,0,0,0.25)]">
                  {/* Animated glow */}
                  <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[rgba(239,134,76,0.35)] blur-3xl animate-pulse" />
                  <img
                    src="/Images/loginright.png"
                    alt="Friendly character welcoming user through a door"
                    className="relative z-10 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-transparent">
            {/* Slanted Background (desktop) */}
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                backgroundColor: "#ffbf58",
                clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* Solid background on mobile */}
            <div
              className="absolute inset-0 lg:hidden"
              style={{ backgroundColor: "#ffffff" }}
            />

            <div className="relative z-10 w-full max-w-md">
              {/* Mobile Logo - Only visible on small screens */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-block">
                  <img
                    src="/Images/footerlogo.png"
                    alt="Zayan Logo"
                    className="w-[100px] h-[110px]"
                  />
                </div>
                <p className="mt-2" style={{ color: "#ef864c" }}>
                  Welcome back
                </p>
              </div>

              {/* Form Card */}
              <div
                className="bg-white rounded-2xl shadow-xl border p-8 mb-6"
                style={{ borderColor: "rgba(239, 134, 76, 0.2)" }}
              >
                <h2
                  className="text-2xl font-heading font-bold mb-6"
                  style={{ color: "#0f4656" }}
                >
                  Login to Your Account
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "#0f4656" }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                        style={{ color: "#ef864c" }}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: "rgba(239, 134, 76, 0.3)" }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "#ef864c")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(239, 134, 76, 0.3)")
                        }
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "#0f4656" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                        style={{ color: "#ef864c" }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: "rgba(239, 134, 76, 0.3)" }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "#ef864c")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "rgba(239, 134, 76, 0.3)")
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                        style={{ color: "#ef864c" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#d9723f")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#ef864c")
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border rounded cursor-pointer"
                        style={{ borderColor: "rgba(239, 134, 76, 0.3)" }}
                      />
                      <span className="text-sm" style={{ color: "#0f4656" }}>
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="text-sm transition-colors font-medium"
                      style={{ color: "#ef864c" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#d9723f")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#ef864c")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2 text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) =>
                      !loading &&
                      (e.currentTarget.style.backgroundColor = "#d9723f")
                    }
                    onMouseLeave={(e) =>
                      !loading &&
                      (e.currentTarget.style.backgroundColor = "#ef864c")
                    }
                    size="lg"
                  >
                    {loading ? "Logging in..." : "Login"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className="w-full border-t"
                      style={{ borderColor: "rgba(239, 134, 76, 0.2)" }}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span
                      className="px-2 bg-white"
                      style={{ color: "#0f4656" }}
                    >
                      OR
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full py-3 border rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    style={{
                      borderColor: "rgba(239, 134, 76, 0.3)",
                      color: "#0f4656",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239, 134, 76, 0.1)";
                      e.currentTarget.style.borderColor = "#ef864c";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor =
                        "rgba(239, 134, 76, 0.3)";
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    className="w-full py-3 border rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    style={{
                      borderColor: "rgba(239, 134, 76, 0.3)",
                      color: "#0f4656",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239, 134, 76, 0.1)";
                      e.currentTarget.style.borderColor = "#ef864c";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor =
                        "rgba(239, 134, 76, 0.3)";
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p style={{ color: "#0f4656" }}>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => router.push("/signup")}
                    className="font-medium transition-colors"
                    style={{ color: "#ef864c" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#d9723f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#ef864c")
                    }
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* end flex container */}
        </div>

        {/* end main card */}
      </div>

      {/* Role Selection Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="w-full sm:max-w-[720px] border-0 bg-transparent p-0">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-[#0f4656]">
            {/* Slanted accent strip */}
            <div
              className="absolute inset-y-0 right-0 w-[42%] hidden sm:block"
              style={{
                backgroundColor: "#ffbf58",
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 20% 100%)",
              }}
            />

            <div className="relative px-6 py-6 sm:px-9 sm:py-8">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-heading text-white flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(239,134,76,0.2)] text-[#ef864c] shadow-lg">
                    <Home className="w-5 h-5" />
                  </span>
                  Choose Your Role
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base pt-2 text-[rgba(255,255,255,0.8)]">
                  You have multiple ways to use Zayan. Select how you want to
                  continue this session.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
                {userRoles.map((role) => {
                  const config = roleConfig[role as RoleType];
                  if (!config) return null;

                  const Icon = config.icon;
                  const baseColor =
                    config.color === "primary"
                      ? "#ef864c"
                      : config.color === "secondary"
                        ? "#4f46e5"
                        : "#22c55e";

                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelection(role as RoleType)}
                      className="group relative overflow-hidden rounded-2xl border border-[rgba(239,134,76,0.35)] bg-[rgba(6,44,56,0.95)] px-5 py-5 text-left transition-all hover:border-[#ef864c] hover:bg-[rgba(9,60,75,0.98)] hover:-translate-y-0.5 h-full"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-[rgba(239,134,76,0.25)]/40 via-transparent to-transparent pointer-events-none" />
                      <div className="relative flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md"
                          style={{ color: baseColor }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg leading-tight">
                            {config.label}
                          </h3>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.7)]">
                            Continue as {config.label.split(" ")[1]}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[rgba(255,255,255,0.7)] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-xs text-center text-[rgba(255,255,255,0.7)]">
                You can always switch roles later from your profile settings.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
