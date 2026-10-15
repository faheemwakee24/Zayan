"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Grid,
  Package,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowRightLeft,
  Crown,
} from "lucide-react";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import AccountStatusBanner from "@/components/AccountStatusBanner";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebaropen, setsidebaropen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setsidebaropen(true);
      } else {
        setsidebaropen(false);
      }
    };

    // Check initially
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data to check status
  const { data: userData } = useGetCurrentUserQuery("ecommerce_seller");
  const user = userData?.user;

  // Check if account is suspended, banned, or seller role is disabled
  const isSuspended = user?.accountStatus === "suspended";
  const isBanned = user?.accountStatus === "banned";
  const isEcommerceDisabled =
    user?.disabledRoles?.includes("ecommerceSeller") || false;

  // Check if any condition matches
  const shouldShowBanner = isSuspended || isBanned || isEcommerceDisabled;

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/ecommerce/seller/dashboard",
    },
    {
      icon: Store,
      label: "Stores",
      path: "/ecommerce/seller/stores",
    },
    {
      icon: Grid,
      label: "Categories",
      path: "/ecommerce/seller/categories",
    },
    {
      icon: Package,
      label: "Products",
      path: "/ecommerce/seller/products",
    },
    // {
    //   icon: ShoppingCart,
    //   label: "Orders",
    //   path: "/ecommerce/seller/orders",
    // },
    // {
    //   icon: BarChart3,
    //   label: "Analytics",
    //   path: "/ecommerce/seller/analytics",
    // },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/ecommerce/seller/messages",
    },
    {
      icon: Crown,
      label: "Subscription",
      path: "/ecommerce/seller/subscription",
    },
  ];

  const accountItems = [
    {
      icon: ArrowRightLeft,
      label: "Switch to Buying",
      path: "/ecommerce/buyer/dashboard",
    },
    {
      icon: User,
      label: "Profile",
      path: "/ecommerce/seller/profile",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setsidebaropen(false);
  };

  const isActiveLink = (path: string) => {
    if (path === "/ecommerce/seller/dashboard") {
      return pathname === "/ecommerce/seller/dashboard";
    }
    return pathname === path || (pathname?.startsWith(path + "/") ?? false);
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

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebaropen && (
        <div
          className="fixed inset-0 bg-black/40 z-[40] min-[1200px]:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setsidebaropen(false)}
        />
      )}
      <div
        className={`commonclass flex flex-col border-r border-border/50 shadow-xl transition-all duration-300 ease-in-out will-change-[width] min-[1200px]:w-64 ${
          sidebaropen ? "w-64" : "w-0 overflow-hidden"
        }`}
        style={{
          backgroundColor: "#0f4656",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          className={`p-6 border-b flex items-center transition-all duration-300 ease-in-out ${"justify-between"}`}
          style={{ borderColor: "#ffffff20" }}
        >
          <div className={`flex items-center ${"gap-3"}`}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg ring-2"
              style={{
                backgroundColor: "#ef864c",
                boxShadow: "0 10px 15px -3px rgba(239, 134, 76, 0.2)",
                borderColor: "#ef864c33",
              }}
            >
              <Store className="w-5 h-5" />
            </div>
            <span
              className={`font-heading font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${"opacity-100 max-w-full"}`}
              style={{ color: "#ffffff" }}
            >
              SellerHub
            </span>
          </div>
          <button
            onClick={() => setsidebaropen(!sidebaropen)}
            className={`p-2 rounded-lg transition-all closcommonclass duration-200 flex-shrink-0 hover:scale-110 active:scale-95`}
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef864c20")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            title={"Close sidebar"}
          >
            <X
              className="w-4 h-4"
              style={{ color: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef864c")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
            />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="mb-2 px-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${"opacity-100"}`}
              style={{ color: "#ffffff80" }}
            >
              Main Menu
            </span>
          </div>

          {menuItems.map((item) => {
            const isActive = isActiveLink(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "text-white shadow-lg scale-[1.02]"
                    : "hover:scale-[1.01] active:scale-[0.99]"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "#ef864c",
                        boxShadow: "0 10px 15px -3px rgba(239, 134, 76, 0.2)",
                      }
                    : { backgroundColor: "transparent" }
                }
                onMouseEnter={
                  !isActive
                    ? (e) =>
                        (e.currentTarget.style.backgroundColor = "#ef864c20")
                    : undefined
                }
                onMouseLeave={
                  !isActive
                    ? (e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                    : undefined
                }
                title={item.label}
              >
                <div
                  className="relative flex-shrink-0"
                  style={
                    isActive ? { color: "#ffffff" } : { color: "#ffffff80" }
                  }
                >
                  <item.icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                    onMouseEnter={
                      !isActive
                        ? (e) => (e.currentTarget.style.color = "#ef864c")
                        : undefined
                    }
                    onMouseLeave={
                      !isActive
                        ? (e) => (e.currentTarget.style.color = "#ffffff80")
                        : undefined
                    }
                  />
                  {isActive && (
                    <div
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ backgroundColor: "#ffffff" }}
                    />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${"opacity-100 max-w-full"}`}
                  style={
                    isActive
                      ? { color: "#ffffff", fontWeight: "600" }
                      : { color: "#ffffff" }
                  }
                  onMouseEnter={
                    !isActive
                      ? (e) => (e.currentTarget.style.color = "#ef864c")
                      : undefined
                  }
                  onMouseLeave={
                    !isActive
                      ? (e) => (e.currentTarget.style.color = "#ffffff")
                      : undefined
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Account Section */}
        <div
          className="p-4 border-t space-y-1.5"
          style={{ borderColor: "#ffffff20" }}
        >
          <div className="mb-2 px-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${"opacity-100"}`}
              style={{ color: "#ffffff80" }}
            >
              Account
            </span>
          </div>
          {accountItems.map((item) => {
            const isActive = isActiveLink(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "shadow-md"
                    : "hover:scale-[1.01] active:scale-[0.99]"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "#ef864c20",
                        borderColor: "#ef864c40",
                        borderWidth: "1px",
                      }
                    : { backgroundColor: "transparent" }
                }
                onMouseEnter={
                  !isActive
                    ? (e) =>
                        (e.currentTarget.style.backgroundColor = "#ef864c20")
                    : undefined
                }
                onMouseLeave={
                  !isActive
                    ? (e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                    : undefined
                }
                title={item.label}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                  style={
                    isActive ? { color: "#ef864c" } : { color: "#ffffff80" }
                  }
                  onMouseEnter={
                    !isActive && sidebaropen
                      ? (e) => (e.currentTarget.style.color = "#ef864c")
                      : undefined
                  }
                  onMouseLeave={
                    !isActive && sidebaropen
                      ? (e) => (e.currentTarget.style.color = "#ffffff80")
                      : undefined
                  }
                />
                <span
                  className={`text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${"opacity-100 max-w-full"}`}
                  style={
                    isActive
                      ? { color: "#ffffff", fontWeight: "600" }
                      : { color: "#ffffff" }
                  }
                  onMouseEnter={
                    !isActive && sidebaropen
                      ? (e) => (e.currentTarget.style.color = "#ef864c")
                      : undefined
                  }
                  onMouseLeave={
                    !isActive && sidebaropen
                      ? (e) => (e.currentTarget.style.color = "#ffffff")
                      : undefined
                  }
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <div
            className="pt-2 mt-2 border-t"
            style={{ borderColor: "#ffffff20" }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent transition-all duration-200 group relative hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogOut
                className="w-5 h-5 transition-all duration-200 flex-shrink-0 group-hover:scale-110"
                style={{ color: "#ffffff80" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef864c")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#ffffff80")
                }
              />
              <span
                className={`text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${"opacity-100 max-w-full"}`}
                style={{ color: "#ffffff80" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef864c")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#ffffff80")
                }
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header for Mobile */}
        <div
          className="backdrop-blur-md h-[72px] border-b shadow-sm px-4 py-4 flex items-center justify-between"
          style={{ backgroundColor: "#0f4656", borderColor: "#ffffff20" }}
        >
          <button
            onClick={() => setsidebaropen(!sidebaropen)}
            className="p-2 closcommonclass rounded-lg transition-all duration-200 active:scale-95"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef864c20")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Menu className="w-6 h-6" style={{ color: "#ffffff" }} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
              style={{
                backgroundColor: "#ef864c",
                boxShadow: "0 4px 6px -1px rgba(239, 134, 76, 0.2)",
              }}
            >
              <Store className="w-5 h-5" />
            </div>
            <span
              className="font-heading font-bold"
              style={{ color: "#ffffff", letterSpacing: "0.5px" }}
            >
              Zayan Ecommerce hub
            </span>
          </div>
          <div className="w-6"></div>
        </div>
        {/* Main Content */}
        {shouldShowBanner ? (
          <main className="flex-1 overflow-auto bg-muted">
            <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
              <div className="w-full max-w-2xl">
                <AccountStatusBanner user={user} category="ecommerce" />
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 overflow-auto bg-muted">{children}</main>
        )}
      </div>
    </div>
  );
}
