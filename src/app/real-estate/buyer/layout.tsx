"use client";

import RouteProtection from "@/components/RouteProtection";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import AccountStatusBanner from "@/components/AccountStatusBanner";

export default function RealEstateBuyerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: userData } = useGetCurrentUserQuery("realestate_buyer");
  const user = userData?.user;

  // Check if account is suspended or banned (account-level restrictions only)
  // Buyers should only see banners for account-level restrictions, not role-specific
  const isSuspended = user?.accountStatus === "suspended";
  const isBanned = user?.accountStatus === "banned";

  // Check if any condition matches (only account-level)
  const shouldShowBanner = isSuspended || isBanned;

  return (
    <RouteProtection requiredRole="realEstateBuyer">
      {shouldShowBanner ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
          <div className="w-full max-w-2xl">
            <AccountStatusBanner user={user} category="realestate" />
          </div>
        </div>
      ) : (
        <div className="min-h-screen">{children}</div>
      )}
    </RouteProtection>
  );
}

