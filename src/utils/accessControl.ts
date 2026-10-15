import type { UserProfile } from "@/services/redux/api/authApi";
import type { User } from "@/utils/routeProtection";

// Type that works with both the lightweight `User` stored in localStorage
// and the full `UserProfile` coming from the API
type UserWithStatus =
  | (User | UserProfile) & {
      accountStatus?: "active" | "suspended" | "banned";
      disabledRoles?: string[];
      banReason?: string;
      suspensionReason?: string;
    }
  | null
  | undefined;

/**
 * Check if user can access a specific category/role
 */
export function canAccessCategory(
  user: UserWithStatus,
  category: "ecommerce" | "realestate"
): {
  canAccess: boolean;
  reason?: "banned" | "suspended" | "role_disabled" | "not_authenticated";
  message?: string;
} {

  console.log(user,"user");
  console.log(category,"category");
  if (!user) {
    return {
      canAccess: false,
      reason: "not_authenticated",
      message: "You must be logged in to access this feature.",
    };
  }

  // Check if banned
  if (user.accountStatus === "banned") {
    return {
      canAccess: false,
      reason: "banned",
      message: user.banReason || "Your account has been banned.",
    };
  }

  // Check if suspended
  if (user.accountStatus === "suspended") {
    return {
      canAccess: false,
      reason: "suspended",
      message: user.suspensionReason || "Your account has been suspended.",
    };
  }

  // Check if role is disabled
  const roleName =
    category === "ecommerce" ? "ecommerceSeller" : "realEstateSeller";

  if (user.disabledRoles?.includes(roleName)) {
    return {
      canAccess: false,
      reason: "role_disabled",
      message: `Your ${category === "ecommerce" ? "E-commerce" : "Real Estate"} Seller role has been disabled.`,
    };
  }

  return {
    canAccess: true,
  };
}

/**
 * Check if user can perform seller actions
 */
export function canPerformSellerActions(
  user: UserProfile | null | undefined,
  category: "ecommerce" | "realestate"
): boolean {
  const access = canAccessCategory(user, category);
  return access.canAccess;
}

