"use client";

import { ReactNode, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/RealEstate/components/ui/button";
import {
  Menu,
  Building2,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/RealEstate/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isAuthenticated } from "@/utils/routeProtection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/RealEstate/components/ui/dropdown-menu";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";

interface LandingLayoutProps {
  children: ReactNode;
}

const navigationLinks = [
  { href: "/real-estate", label: "Home" },
  { href: "/real-estate/about", label: "About" },
  { href: "/real-estate/blog", label: "Blogs" },
  { href: "/real-estate/contact", label: "Contact" },
];

export function LandingLayout({ children }: LandingLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Initialize auth state as false to match server render (prevents hydration mismatch)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch user data when logged in
  const { data: userData } = useGetCurrentUserQuery(
    isLoggedIn ? undefined : undefined,
    { skip: !isLoggedIn },
  );
  const user = userData?.user;

  // Get user roles from localStorage to determine navigation routes
  const userRoles = useMemo(() => {
    if (typeof window !== "undefined" && isLoggedIn) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          return userObj?.roles || [];
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    return [];
  }, [isLoggedIn]);

  // Determine dashboard and profile routes based on user roles
  const getDashboardRoute = () => {
    if (userRoles.includes("realEstateBuyer"))
      return "/real-estate/buyer/dashboard";
    if (userRoles.includes("realEstateSeller"))
      return "/real-estate/seller/dashboard";
    if (userRoles.includes("ecommerceBuyer"))
      return "/ecommerce/buyer/dashboard";
    if (userRoles.includes("ecommerceSeller"))
      return "/ecommerce/seller/dashboard";
    return "/settings";
  };

  const getProfileRoute = () => {
    if (userRoles.includes("realEstateBuyer"))
      return "/real-estate/buyer/profile";
    if (userRoles.includes("realEstateSeller"))
      return "/real-estate/seller/profile";
    if (userRoles.includes("ecommerceBuyer")) return "/ecommerce/buyer/profile";
    if (userRoles.includes("ecommerceSeller"))
      return "/ecommerce/seller/profile";
    return "/settings";
  };

  // Check authentication state after mount (client-side only)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        setIsLoggedIn(isAuthenticated());
      }
    };

    // Initial check
    checkAuth();

    // Listen for auth state changes
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authStateChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authStateChange", checkAuth);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // Remove from localStorage
      localStorage.removeItem("zayanToken");
      localStorage.removeItem("user");

      // Remove from cookies
      document.cookie =
        "zayanToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "zayanUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      setIsLoggedIn(false);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("authStateChange"));
      router.push("/");
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/real-estate") {
      return pathname === "/real-estate" || pathname === "/real-estate/";
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: "#0f4656", borderColor: "#c7c7c7" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/real-estate"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/Images/mainlogo.png"
                alt="RealeState Logo"
                className="w-[70px] h-[60px] "
              />

              <span
                className="hidden sm:inline text-xl font-bold"
                style={{ color: "#ffffff" }}
              >
                RealeState
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActiveLink(link.href)
                      ? "font-semibold text-white"
                      : "text-white/80 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side - Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/ecommerce" className="hidden md:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 bg-transparent hover:bg-white/10 hover:border-white/50"
                >
                  Switch to Ecommerce
                </Button>
              </Link>
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block"
                    suppressHydrationWarning
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white/80 hover:bg-white/10"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" suppressHydrationWarning>
                    <Button
                      size="sm"
                      style={{ backgroundColor: "#ef864c" }}
                      className="text-white hover:opacity-90"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white bg-transparent"
                      suppressHydrationWarning
                    >
                      <div className="relative">
                        {user?.avatar && !avatarError ? (
                          <img
                            src={user.avatar}
                            alt={user.name || "Profile"}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center shadow-md">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium">
                        Dashboard
                      </span>
                      <ChevronDown className="w-4 h-4 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push(getProfileRoute())}
                      className="cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(getDashboardRoute())}
                      className="cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-white/10"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-72 border-l border-[#ffffff20] p-6 [&>button]:text-white"
                  style={{ backgroundColor: "#0f4656" }}
                >
                  <nav className="flex flex-col gap-2 mt-8">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                          isActiveLink(link.href)
                            ? "text-white shadow-md"
                            : "text-white/70 hover:text-white hover:bg-[#ef864c20]",
                        )}
                        style={
                          isActiveLink(link.href)
                            ? { backgroundColor: "#ef864c" }
                            : {}
                        }
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="pt-4 border-t border-[#ffffff20] mt-4 space-y-3">
                      <Link href="/ecommerce" className="block">
                        <Button
                          variant="outline"
                          className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                        >
                          Switch to Ecommerce
                        </Button>
                      </Link>
                      {!isLoggedIn && (
                        <>
                          <Link href="/login" className="block">
                            <Button
                              variant="outline"
                              className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                            >
                              Login
                            </Button>
                          </Link>
                          <Link href="/signup" className="block">
                            <Button
                              className="w-full text-white hover:opacity-90 border-none"
                              style={{ backgroundColor: "#ef864c" }}
                            >
                              Sign Up
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="text-white mt-20"
        style={{ backgroundColor: "#0f4656" }}
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link
                href="/real-estate"
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src="/Images/footerlogo.png"
                    alt="RealeState Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold">RealeState</h3>
              </Link>
              <p className="text-white/70 text-sm">
                Premium real estate platform for buyers and sellers across the
                USA.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link
                    href="/real-estate"
                    className="hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/real-estate/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/real-estate/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/real-estate/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-policy"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex gap-2">
                  <Mail className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                  <a
                    href="mailto:hello@zayan.com"
                    className="hover:text-white transition-colors"
                  >
                    hello@zayan.com
                  </a>
                </li>
                <li className="flex gap-2">
                  <Phone className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                  <a
                    href="tel:+923001234567"
                    className="hover:text-white transition-colors"
                  >
                    +92 (300) 1234567
                  </a>
                </li>
                <li className="flex gap-2">
                  <MapPin className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                  <span>Karachi, Pakistan</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white/70">
              © 2024 RealeState. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
