"use client";

import { AlertCircle, Ban, X, HeadphonesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/services/redux/api/authApi";

interface AccountStatusBannerProps {
  user: UserProfile | null | undefined;
  category?: "ecommerce" | "realestate" | "all";
  onClose?: () => void;
}

export default function AccountStatusBanner({
  user,
  category = "all",
  onClose,
}: AccountStatusBannerProps) {
  const router = useRouter();

  if (!user) return null;

  // Check if account is suspended or banned
  const isSuspended = user.accountStatus === "suspended";
  const isBanned = user.accountStatus === "banned";

  // Check if specific role is disabled
  const isEcommerceDisabled =
    category === "ecommerce" || category === "all"
      ? user.disabledRoles?.includes("ecommerceSeller") || false
      : false;

  const isRealEstateDisabled =
    category === "realestate" || category === "all"
      ? user.disabledRoles?.includes("realEstateSeller") || false
      : false;

  // Don't show banner if everything is fine
  if (!isSuspended && !isBanned && !isEcommerceDisabled && !isRealEstateDisabled) {
    return null;
  }

  const handleContactSupport = () => {
    // Navigate to contact page - use unified contact or category-specific
    if (category === "ecommerce") {
      router.push("/ecommerce/contact");
    } else if (category === "realestate") {
      router.push("/real-estate/contact");
    } else {
      router.push("/ecommerce/contact"); // Default fallback
    }
  };

  // Show ban banner (highest priority)
  if (isBanned) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-red-50/50 to-orange-50/30 dark:from-red-900/30 dark:via-red-900/20 dark:to-red-800/10 border-2 border-red-200 dark:border-red-800/50 p-8 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 dark:bg-red-700/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 dark:bg-orange-700/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Ban className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                Account Banned
              </h3>
              <div className="space-y-2 text-red-800 dark:text-red-200">
                <p className="text-base leading-relaxed">
                  Your account has been permanently banned. You are unable to access
                  any features on this platform.
                </p>
                {user.banReason && (
                  <div className="mt-3 p-3 bg-red-100/50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold mb-1">Reason:</p>
                    <p className="text-sm">{user.banReason}</p>
                  </div>
                )}
                {user.bannedAt && (
                  <p className="text-xs opacity-75 mt-2">
                    Banned on: {new Date(user.bannedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleContactSupport}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <HeadphonesIcon className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show suspension banner
  if (isSuspended) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50/30 dark:from-orange-900/30 dark:via-orange-900/20 dark:to-amber-800/10 border-2 border-orange-200 dark:border-orange-800/50 p-8 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 dark:bg-orange-700/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                Account Suspended
              </h3>
              <div className="space-y-2 text-orange-800 dark:text-orange-200">
                <p className="text-base leading-relaxed">
                  Your account has been suspended. You are unable to access most
                  features on this platform.
                </p>
                {user.suspensionReason && (
                  <div className="mt-3 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-semibold mb-1">Reason:</p>
                    <p className="text-sm">{user.suspensionReason}</p>
                  </div>
                )}
                {user.suspendedAt && (
                  <p className="text-xs opacity-75 mt-2">
                    Suspended on: {new Date(user.suspendedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleContactSupport}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <HeadphonesIcon className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show role disabled banner for ecommerce
  if (isEcommerceDisabled && (category === "ecommerce" || category === "all")) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50/50 to-orange-50/30 dark:from-yellow-900/30 dark:via-yellow-900/20 dark:to-amber-800/10 border-2 border-yellow-200 dark:border-yellow-800/50 p-8 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 dark:bg-yellow-700/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                E-commerce Seller Access Disabled
              </h3>
              <div className="space-y-2 text-yellow-800 dark:text-yellow-200">
                <p className="text-base leading-relaxed">
                  Your E-commerce Seller role has been disabled by an administrator.
                  You are unable to access seller features, create stores, manage
                  products, or sell items on the platform.
                </p>
                <p className="text-sm mt-3">
                  Please contact support if you believe this is an error or if you
                  need assistance.
                </p>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleContactSupport}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <HeadphonesIcon className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show role disabled banner for real estate
  if (isRealEstateDisabled && (category === "realestate" || category === "all")) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50/50 to-orange-50/30 dark:from-yellow-900/30 dark:via-yellow-900/20 dark:to-amber-800/10 border-2 border-yellow-200 dark:border-yellow-800/50 p-8 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 dark:bg-yellow-700/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-700/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                Real Estate Seller Access Disabled
              </h3>
              <div className="space-y-2 text-yellow-800 dark:text-yellow-200">
                <p className="text-base leading-relaxed">
                  Your Real Estate Seller role has been disabled by an administrator.
                  You are unable to access seller features, create property listings,
                  or manage properties on the platform.
                </p>
                <p className="text-sm mt-3">
                  Please contact support if you believe this is an error or if you
                  need assistance.
                </p>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleContactSupport}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <HeadphonesIcon className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
