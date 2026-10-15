"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  LogOut,
  ChevronRight,
  Store,
  Grid3x3,
  Inbox,
  LayoutDashboard,
  Menu,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";

interface BuyerSidebarContentProps {
  onNavigate?: () => void;
}

function BuyerSidebarContent({ onNavigate }: BuyerSidebarContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Fetch current user profile for buyer role
  const { data, isLoading, isError } =
    useGetCurrentUserQuery("ecommerce_buyer");

  const userProfile = data?.user;

  const handleNavigation = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

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
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("authStateChange"));
      router.push("/");
    }
  };

  const isActive = (path: string) => {
    if (!pathname) return false;
    // For dashboard, match exactly
    if (path === "/ecommerce/buyer/dashboard") {
      return pathname === path;
    }
    // For other routes, check if pathname starts with the path
    return pathname.startsWith(path);
  };

  // Format user data
  const formattedUser = useMemo(() => {
    if (!userProfile) return null;

    const location =
      [userProfile.city, userProfile.state].filter(Boolean).join(", ") ||
      userProfile.location ||
      "Not specified";

    const joinDate = userProfile.createdAt
      ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Recently joined";

    const avatar =
      userProfile.avatar ||
      userProfile.name?.charAt(0) ||
      userProfile.email?.charAt(0) ||
      "U";

    return {
      name: userProfile.name || "User",
      email: userProfile.email || "",
      location,
      joinDate: `Joined ${joinDate}`,
      avatar,
    };
  }, [userProfile]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Error or no user state
  if (isError || !userProfile || !formattedUser) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        Unable to load profile
      </div>
    );
  }

  return (
    <>
      {/* Quick Shortcuts */}
      <div className="bg-white rounded-2xl border border-border p-4 lg:p-6 mb-4 lg:mb-6 space-y-3">
        <h3 className="font-heading font-bold text-foreground mb-4">
          Quick Links
        </h3>

        <button
          onClick={() => handleNavigation("/ecommerce/buyer/dashboard")}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-colors group border",
            isActive("/ecommerce/buyer/dashboard")
              ? "bg-primary-50 hover:bg-primary-100 border-primary/20"
              : "hover:bg-muted border-transparent",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isActive("/ecommerce/buyer/dashboard")
                  ? "bg-primary"
                  : "bg-primary-100",
              )}
            >
              <LayoutDashboard
                className={cn(
                  "w-5 h-5",
                  isActive("/ecommerce/buyer/dashboard")
                    ? "text-white"
                    : "text-primary",
                )}
              />
            </div>
            <span
              className={cn(
                "font-medium text-sm",
                isActive("/ecommerce/buyer/dashboard")
                  ? "text-primary"
                  : "text-foreground",
              )}
            >
              Dashboard
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isActive("/ecommerce/buyer/dashboard")
                ? "text-primary group-hover:translate-x-1"
                : "text-muted-foreground group-hover:text-primary",
            )}
          />
        </button>

        <button
          onClick={() => handleNavigation("/ecommerce/buyer/stores")}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-colors group border",
            isActive("/ecommerce/buyer/stores")
              ? "bg-primary-50 hover:bg-primary-100 border-primary/20"
              : "hover:bg-muted border-transparent",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isActive("/ecommerce/buyer/stores")
                  ? "bg-primary"
                  : "bg-primary-100",
              )}
            >
              <Store
                className={cn(
                  "w-5 h-5",
                  isActive("/ecommerce/buyer/stores")
                    ? "text-white"
                    : "text-primary",
                )}
              />
            </div>
            <span
              className={cn(
                "font-medium text-sm",
                isActive("/ecommerce/buyer/stores")
                  ? "text-primary"
                  : "text-foreground",
              )}
            >
              Stores
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isActive("/ecommerce/buyer/stores")
                ? "text-primary group-hover:translate-x-1"
                : "text-muted-foreground group-hover:text-primary",
            )}
          />
        </button>

        <button
          onClick={() => handleNavigation("/ecommerce/buyer/products")}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-colors group border",
            isActive("/ecommerce/buyer/products")
              ? "bg-secondary-50 hover:bg-secondary-100 border-secondary/20"
              : "hover:bg-muted border-transparent",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isActive("/ecommerce/buyer/products")
                  ? "bg-secondary"
                  : "bg-secondary-100",
              )}
            >
              <Grid3x3
                className={cn(
                  "w-5 h-5",
                  isActive("/ecommerce/buyer/products")
                    ? "text-white"
                    : "text-secondary",
                )}
              />
            </div>
            <span
              className={cn(
                "font-medium text-sm",
                isActive("/ecommerce/buyer/products")
                  ? "text-secondary"
                  : "text-foreground",
              )}
            >
              Products
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isActive("/ecommerce/buyer/products")
                ? "text-secondary group-hover:translate-x-1"
                : "text-muted-foreground group-hover:text-secondary",
            )}
          />
        </button>

        <button
          onClick={() => handleNavigation("/ecommerce/buyer/messages")}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-colors group border",
            isActive("/ecommerce/buyer/messages")
              ? "bg-accent-50 hover:bg-accent-100 border-accent/20"
              : "hover:bg-muted border-transparent",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isActive("/ecommerce/buyer/messages")
                  ? "bg-accent"
                  : "bg-accent-100",
              )}
            >
              <Inbox
                className={cn(
                  "w-5 h-5",
                  isActive("/ecommerce/buyer/messages")
                    ? "text-white"
                    : "text-accent",
                )}
              />
            </div>
            <span
              className={cn(
                "font-medium text-sm",
                isActive("/ecommerce/buyer/messages")
                  ? "text-accent"
                  : "text-foreground",
              )}
            >
              Messages
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isActive("/ecommerce/buyer/messages")
                ? "text-accent group-hover:translate-x-1"
                : "text-muted-foreground group-hover:text-accent",
            )}
          />
        </button>

        <hr className="my-3 border-border" />

        <button
          onClick={() => handleNavigation("/ecommerce/seller/dashboard")}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/10 transition-colors text-secondary hover:text-secondary/90",
          )}
        >
          <Store className="w-5 h-5" />
          <span className="font-medium text-sm">Switch to Selling</span>
        </button>

        <button
          onClick={() => handleNavigation("/settings")}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-border p-4 lg:p-6 lg:sticky lg:top-32">
        <div className="text-center mb-6">
          {userProfile.avatar &&
          (userProfile.avatar.startsWith("http") ||
            userProfile.avatar.startsWith("https") ||
            userProfile.avatar.startsWith("data:")) ? (
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userProfile.avatar}
                alt={formattedUser.name}
                className="w-full h-full object-cover"
                key={userProfile.avatar}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl mx-auto mb-4">
              <span className="text-white font-bold">
                {formattedUser.avatar}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="font-heading font-bold text-foreground">
              {formattedUser.name}
            </h3>
            {userProfile?.verificationStatus === "approved" && (
              <span className="inline-flex items-center" title="Verified User">
                <svg
                  className="w-4 h-4 text-blue-500 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {formattedUser.email}
          </p>
          <div className="text-xs text-muted-foreground mb-4">
            <p>{formattedUser.location}</p>
            <p>{formattedUser.joinDate}</p>
          </div>
        </div>

        <Button
          className="w-full mb-2"
          onClick={() => handleNavigation("/ecommerce/buyer/profile/edit")}
        >
          Edit Profile
        </Button>
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => handleNavigation("/ecommerce/buyer/profile")}
        >
          View Full Profile
        </Button>
      </div>
    </>
  );
}

export default function BuyerSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/ecommerce/buyer/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Get current active menu item text
  const getActiveMenuText = () => {
    if (isActive("/ecommerce/buyer/dashboard")) return "Dashboard";
    if (isActive("/ecommerce/buyer/stores")) return "Stores";
    if (isActive("/ecommerce/buyer/products")) return "Products";
    if (isActive("/ecommerce/buyer/messages")) return "Messages";
    if (isActive("/ecommerce/buyer/profile")) return "Profile";
    if (isActive("/settings")) return "Settings";
    return "Menu";
  };

  const activeMenuText = getActiveMenuText();

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:col-span-1">
        <BuyerSidebarContent />
      </div>

      {/* Mobile Dropdown Menu - Shows at top on mobile */}
      <div className="lg:hidden mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between gap-3 h-auto py-2.5 border-border hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive("/ecommerce/buyer/dashboard") && "bg-primary",
                    isActive("/ecommerce/buyer/stores") && "bg-primary",
                    isActive("/ecommerce/buyer/products") && "bg-secondary",
                    isActive("/ecommerce/buyer/messages") && "bg-accent",
                    isActive("/ecommerce/buyer/profile") && "bg-primary",
                    isActive("/settings") && "bg-muted",
                    !isActive("/ecommerce/buyer/dashboard") &&
                      !isActive("/ecommerce/buyer/stores") &&
                      !isActive("/ecommerce/buyer/products") &&
                      !isActive("/ecommerce/buyer/messages") &&
                      !isActive("/ecommerce/buyer/profile") &&
                      !isActive("/settings") &&
                      "bg-primary-100",
                  )}
                >
                  {isActive("/ecommerce/buyer/dashboard") && (
                    <LayoutDashboard className={cn("w-4 h-4", "text-white")} />
                  )}
                  {isActive("/ecommerce/buyer/stores") && (
                    <Store className={cn("w-4 h-4", "text-white")} />
                  )}
                  {isActive("/ecommerce/buyer/products") && (
                    <Grid3x3 className={cn("w-4 h-4", "text-white")} />
                  )}
                  {isActive("/ecommerce/buyer/messages") && (
                    <Inbox className={cn("w-4 h-4", "text-white")} />
                  )}
                  {isActive("/ecommerce/buyer/profile") && (
                    <User className={cn("w-4 h-4", "text-white")} />
                  )}
                  {isActive("/settings") && (
                    <Settings className={cn("w-4 h-4", "text-foreground")} />
                  )}
                  {!isActive("/ecommerce/buyer/dashboard") &&
                    !isActive("/ecommerce/buyer/stores") &&
                    !isActive("/ecommerce/buyer/products") &&
                    !isActive("/ecommerce/buyer/messages") &&
                    !isActive("/ecommerce/buyer/profile") &&
                    !isActive("/settings") && (
                      <Menu className={cn("w-4 h-4", "text-primary")} />
                    )}
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    (isActive("/ecommerce/buyer/dashboard") ||
                      isActive("/ecommerce/buyer/stores") ||
                      isActive("/ecommerce/buyer/products") ||
                      isActive("/ecommerce/buyer/messages") ||
                      isActive("/ecommerce/buyer/profile")) &&
                      "text-primary",
                  )}
                >
                  {activeMenuText}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            <DropdownMenuItem
              onClick={() => handleNavigation("/ecommerce/buyer/dashboard")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive("/ecommerce/buyer/dashboard")
                  ? "bg-primary-50 text-primary border border-primary/20"
                  : "hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isActive("/ecommerce/buyer/dashboard")
                    ? "bg-primary"
                    : "bg-primary-100",
                )}
              >
                <LayoutDashboard
                  className={cn(
                    "w-5 h-5",
                    isActive("/ecommerce/buyer/dashboard")
                      ? "text-white"
                      : "text-primary",
                  )}
                />
              </div>
              <span className="font-medium text-sm">Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigation("/ecommerce/buyer/stores")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive("/ecommerce/buyer/stores")
                  ? "bg-primary-50 text-primary border border-primary/20"
                  : "hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isActive("/ecommerce/buyer/stores")
                    ? "bg-primary"
                    : "bg-primary-100",
                )}
              >
                <Store
                  className={cn(
                    "w-5 h-5",
                    isActive("/ecommerce/buyer/stores")
                      ? "text-white"
                      : "text-primary",
                  )}
                />
              </div>
              <span className="font-medium text-sm">Stores</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigation("/ecommerce/buyer/products")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive("/ecommerce/buyer/products")
                  ? "bg-secondary-50 text-secondary border border-secondary/20"
                  : "hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isActive("/ecommerce/buyer/products")
                    ? "bg-secondary"
                    : "bg-secondary-100",
                )}
              >
                <Grid3x3
                  className={cn(
                    "w-5 h-5",
                    isActive("/ecommerce/buyer/products")
                      ? "text-white"
                      : "text-secondary",
                  )}
                />
              </div>
              <span className="font-medium text-sm">Products</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigation("/ecommerce/buyer/messages")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive("/ecommerce/buyer/messages")
                  ? "bg-accent-50 text-accent border border-accent/20"
                  : "hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isActive("/ecommerce/buyer/messages")
                    ? "bg-accent"
                    : "bg-accent-100",
                )}
              >
                <Inbox
                  className={cn(
                    "w-5 h-5",
                    isActive("/ecommerce/buyer/messages")
                      ? "text-white"
                      : "text-accent",
                  )}
                />
              </div>
              <span className="font-medium text-sm">Messages</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigation("/ecommerce/buyer/profile")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive("/ecommerce/buyer/profile")
                  ? "bg-primary-50 text-primary border border-primary/20"
                  : "hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isActive("/ecommerce/buyer/profile")
                    ? "bg-primary"
                    : "bg-primary-100",
                )}
              >
                <User
                  className={cn(
                    "w-5 h-5",
                    isActive("/ecommerce/buyer/profile")
                      ? "text-white"
                      : "text-primary",
                  )}
                />
              </div>
              <span className="font-medium text-sm">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleNavigation("/ecommerce/seller/dashboard")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-secondary/10 text-secondary hover:text-secondary/90",
              )}
            >
              <Store className="w-5 h-5" />
              <span className="font-medium text-sm">Switch to Selling</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigation("/settings")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive("/settings")
                  ? "bg-primary-50 text-primary border border-primary/20"
                  : "hover:bg-muted",
              )}
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-sm">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
