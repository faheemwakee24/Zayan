"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Menu,
  X,
  LogIn,
  UserPlus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Always start with false to match server render (prevents hydration mismatch)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const notificationChannel =
    pathname?.startsWith("/real-estate")
      ? "real-estate"
      : pathname?.startsWith("/ecommerce")
        ? "ecommerce"
        : undefined;

  // Fetch user data when logged in
  const { data: userData } = useGetCurrentUserQuery(
    isLoggedIn ? undefined : undefined,
    { skip: !isLoggedIn },
  );
  console.log(userData, "userdat");
  const user = userData?.user;

  // Reset avatar error when avatar URL changes
  const currentAvatar = user?.avatar || "";
  useEffect(() => {
    if (currentAvatar) {
      setAvatarError(false);
    }
  }, [currentAvatar]);

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
    if (userRoles.includes("ecommerceBuyer"))
      return "/ecommerce/buyer/dashboard";
    if (userRoles.includes("ecommerceSeller"))
      return "/ecommerce/seller/dashboard";
    if (userRoles.includes("realEstateBuyer"))
      return "/real-estate/buyer/dashboard";
    if (userRoles.includes("realEstateSeller"))
      return "/real-estate/seller/dashboard";
    return "/settings";
  };

  const getProfileRoute = () => {
    if (userRoles.includes("ecommerceBuyer")) return "/ecommerce/buyer/profile";
    if (userRoles.includes("ecommerceSeller"))
      return "/ecommerce/seller/profile";
    if (userRoles.includes("realEstateBuyer"))
      return "/real-estate/buyer/profile";
    if (userRoles.includes("realEstateSeller"))
      return "/real-estate/seller/profile";
    return "/settings";
  };

  // Check authentication state after component mounts (client-side only)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("zayanToken");
        setIsLoggedIn(!!token);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth);

    // Listen for custom auth state changes (e.g., when user logs in/out in same tab)
    window.addEventListener("authStateChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authStateChange", checkAuth);
    };
  }, []);

  // Handle logout - remove token from localStorage and cookies
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

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0f4656] border-b border-[#0f4656] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-bold text-2xl text-white hover:opacity-90 transition-opacity"
            >
              <img
                src="/Images/mainlogo.png"
                alt="RealeState Logo"
                className="w-[60px] h-[50px] "
              />
              <span className="hidden sm:inline">Zayan</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden min-[1000px]:flex items-center gap-8">
              <Link
                href="/ecommerce"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/ecommerce/buyer/blogs"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Blogs
              </Link>
              <Link
                href="/ecommerce/buyer/about"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/ecommerce/contact"
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* RealEstate Switch */}
              <button
                className="hidden min-[1000px]:flex px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-white/90"
                onClick={() => router.push("/real-estate")}
              >
                Switch to Real Estate
              </button>

              {/* Notifications — filtered by current app (ecommerce vs real-estate) */}
              <div className="block">
                <NotificationBell channel={notificationChannel} />
              </div>

              {/* Cart */}

              {/* Auth Buttons or Profile Dropdown */}
              <div suppressHydrationWarning>
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white bg-transparent">
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
                          {/* {user?.name || user?.firstName || 'Profile'} */}
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
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-white hover:bg-white/10"
                      onClick={() => router.push("/login")}
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2 bg-[#ef864c] hover:bg-[#d9723f] text-white"
                      onClick={() => router.push("/signup")}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Up</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-[1000px]:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="min-[1000px]:hidden border-t border-white/10 py-4 space-y-2 pb-4 bg-[#0f4656]">
              <Link
                href="/ecommerce"
                className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/ecommerce/buyer/blogs"
                className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blogs
              </Link>
              <Link
                href="/ecommerce/buyer/about"
                className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/ecommerce/contact"
                className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              <button
                className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-white"
                onClick={() => {
                  router.push("/real-estate");
                  setMobileMenuOpen(false);
                }}
              >
                Switch to Real Estate
              </button>

              <div className="px-4 py-2 border-t border-border pt-4">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 rounded-lg border border-transparent bg-white/10 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#ef864c]"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                </div>

                {!isLoggedIn && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white/10"
                      onClick={() => {
                        router.push("/login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-[#ef864c] hover:bg-[#d9723f] text-white"
                      onClick={() => {
                        router.push("/signup");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
