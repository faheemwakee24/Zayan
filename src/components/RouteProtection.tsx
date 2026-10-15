"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  checkRouteAccess, 
  isAuthenticated, 
  hasRole,
  type UserRole,
  getUserFromStorage
} from "@/utils/routeProtection";
import { canAccessCategory } from "@/utils/accessControl";

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function RouteProtection({ 
  children, 
  requiredRole 
}: RouteProtectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    // Wait for client-side to check localStorage
    if (typeof window === "undefined") {
      setIsChecking(false);
      return;
    }

    const checkAccess = () => {
      // First check authentication
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      // If requiredRole is provided, check it directly
      if (requiredRole) {
        if (!hasRole(requiredRole)) {
          router.push("/settings");
          return;
        }

        // Check if user is banned/suspended or role is disabled for seller roles
        const user = getUserFromStorage();
        if (user && (requiredRole === "ecommerceSeller" || requiredRole === "realEstateSeller")) {
          const category = requiredRole === "ecommerceSeller" ? "ecommerce" : "realestate";
          const access = canAccessCategory(user, category);
          console.log(access,"checking accces");
          if (!access.canAccess) {
            // Allow access to show banner, but don't redirect
            // The banner will inform the user and actions will be blocked
            // For banned users, we might want to redirect to home
            if (access.reason === "banned") {
              router.push("/");
              return;
            }
          }
        }

        setCanAccess(true);
        setIsChecking(false);
        return;
      }

      // Otherwise, derive from pathname
      if (!pathname) {
        setIsChecking(false);
        return;
      }
      
      const { canAccess: access, redirectTo } = checkRouteAccess(pathname);
      
      if (!access && redirectTo) {
        router.push(redirectTo);
        return;
      }

      setCanAccess(access);
      setIsChecking(false);
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAccess, 100);
    return () => clearTimeout(timer);
  }, [pathname, router, requiredRole]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return null; // Will redirect, so return nothing
  }

  return <>{children}</>;
}

