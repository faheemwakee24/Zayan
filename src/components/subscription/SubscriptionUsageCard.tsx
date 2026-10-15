"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Building2, ArrowUpRight } from "lucide-react";
import { useGetMySubscriptionQuery } from "@/services/redux/api/subscriptionApi";
import { useGetProductsQuery } from "@/services/redux/api/productApi";
import { useGetPropertiesQuery } from "@/services/redux/api/propertyApi";

type Role = "ecommerceSeller" | "realEstateSeller";

const subscriptionUrl: Record<Role, string> = {
  ecommerceSeller: "/ecommerce/seller/subscription",
  realEstateSeller: "/real-estate/seller/subscription",
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function SubscriptionUsageCard({ role }: { role: Role }) {
  const { data: subData } = useGetMySubscriptionQuery(role);
  const { data: productsData } = useGetProductsQuery(undefined, {
    skip: role !== "ecommerceSeller",
  });
  const { data: propertiesData } = useGetPropertiesQuery(undefined, {
    skip: role !== "realEstateSeller",
  });

  const subscription = subData?.subscription;
  const planName = subscription?.planId?.name ?? "Basic";
  const maxListings = subscription?.planId?.features?.maxListings ?? 1;
  const isUnlimited = maxListings === 0;

  const currentCount =
    role === "ecommerceSeller"
      ? productsData?.count ?? productsData?.products?.length ?? 0
      : propertiesData?.properties?.length ?? 0;

  const usageLabel = role === "ecommerceSeller" ? "Products" : "Listings";
  const atLimit = !isUnlimited && currentCount >= maxListings;
  const isFreeTier = !subscription || planName === "Basic";

  return (
    <Card className="border border-[#0f4656]/10 bg-white rounded-2xl shadow-sm overflow-hidden mb-6 sm:mb-8">
      <CardHeader className="pb-2 pt-5 px-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#ef864c20" }}
            >
              {role === "ecommerceSeller" ? (
                <Package className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#ef864c" }} />
              ) : (
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#ef864c" }} />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: "#0f4656" }}>
                Plan & usage
              </h3>
              <p className="text-xs text-muted-foreground">
                {planName} plan · {usageLabel.toLowerCase()} in use
              </p>
            </div>
          </div>
          <Link href={subscriptionUrl[role]}>
            <Button
              size="sm"
              variant="outline"
              className="border-[#0f4656]/20 text-[#0f4656] hover:bg-[#0f4656]/5 font-semibold gap-1.5"
            >
              View billing
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 sm:px-6 pb-5 pt-0">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#0f4656" }}>
              {currentCount}
            </span>
            <span className="text-sm text-muted-foreground">
              / {isUnlimited ? "Unlimited" : maxListings} {usageLabel.toLowerCase()}
            </span>
          </div>
          {subscription?.endDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" style={{ color: "#ef864c" }} />
              Renews {formatDate(subscription.endDate)}
            </div>
          )}
          {atLimit && (
            <Badge className="bg-amber-100 text-amber-800 border-0 text-xs font-semibold">
              Limit reached
            </Badge>
          )}
        </div>
        {atLimit && (
          <p className="text-xs text-muted-foreground mt-3">
            {isFreeTier
              ? "You've reached your free limit. Upgrade to add more and grow your catalog."
              : "Upgrade your plan to add more " + usageLabel.toLowerCase() + "."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
