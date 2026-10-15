/**
 * Route Protection Utilities
 * Checks authentication and user roles for route access
 */

export type UserRole = 
  | "ecommerceBuyer" 
  | "ecommerceSeller" 
  | "realEstateBuyer" 
  | "realEstateSeller";

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  roles?: UserRole[];
  [key: string]: unknown;
}

/**
 * Get user from localStorage
 */
export function getUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("zayanToken");
}

/**
 * Get user roles from localStorage
 */
export function getUserRoles(): UserRole[] {
  const user = getUserFromStorage();
  return user?.roles || [];
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole): boolean {
  const roles = getUserRoles();
  return roles.includes(role);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(requiredRoles: UserRole[]): boolean {
  const userRoles = getUserRoles();
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/ecommerce/buyer/about",
  "/ecommerce/contact",
  "/ecommerce/buyer/blogs",
  "/real-estate/about",
  "/real-estate/contact",
  "/real-estate/blog",
  "/real-estate/agents",
];

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Get required role from pathname
 */
export function getRequiredRoleFromPath(pathname: string): UserRole | null {
  // Check if it's a public route first
  if (isPublicRoute(pathname)) {
    return null;
  }

  // Ecommerce routes
  if (pathname.startsWith("/ecommerce/buyer")) {
    return "ecommerceBuyer";
  }
  if (pathname.startsWith("/ecommerce/seller")) {
    return "ecommerceSeller";
  }
  
  // Real Estate routes
  if (pathname.startsWith("/real-estate/buyer")) {
    return "realEstateBuyer";
  }
  if (pathname.startsWith("/real-estate/seller")) {
    return "realEstateSeller";
  }
  
  return null;
}

/**
 * Check if user can access a route
 * Returns: { canAccess: boolean, redirectTo?: string }
 */
export function checkRouteAccess(pathname: string): {
  canAccess: boolean;
  redirectTo?: string;
} {
  // Public routes don't require authentication
  if (isPublicRoute(pathname)) {
    return { canAccess: true };
  }

  // Check authentication first
  if (!isAuthenticated()) {
    return {
      canAccess: false,
      redirectTo: "/login",
    };
  }

  // Get required role for this path
  const requiredRole = getRequiredRoleFromPath(pathname);
  
  // If no role required, allow access
  if (!requiredRole) {
    return { canAccess: true };
  }

  // Check if user has the required role
  if (!hasRole(requiredRole)) {
    return {
      canAccess: false,
      redirectTo: "/settings",
    };
  }

  return { canAccess: true };
}

