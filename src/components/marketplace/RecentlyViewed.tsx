"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, ArrowRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetRecentlyViewedQuery } from "@/services/redux/api/marketplaceApi";
import { useGetProductByIdForBuyerQuery } from "@/services/redux/api/productApi";
import { useGetPropertyByIdForBuyerQuery } from "@/services/redux/api/propertyApi";
import { skipToken } from "@reduxjs/toolkit/query";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface RecentlyViewedProps {
  itemType?: "product" | "property";
  limit?: number;
  title?: string;
  showViewAll?: boolean;
  className?: string;
  viewAllRoute?: string;
}

export function RecentlyViewed({
  itemType,
  limit = 8,
  title,
  showViewAll = true,
  className,
  viewAllRoute,
}: RecentlyViewedProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetRecentlyViewedQuery({
    itemType,
    limit,
  });

  const viewedItems = data?.items || [];
  const displayTitle = title || "Recently Viewed";

  if (error) {
    return null; // Silently fail
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{displayTitle}</h2>
        </div>
        {showViewAll && viewedItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                viewAllRoute ||
                  (itemType === "product"
                    ? "/ecommerce/buyer/products"
                    : "/real-estate/buyer/properties")
              )
            }
            className="gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="w-full h-40 bg-muted animate-pulse rounded-lg mb-4" />
              <div className="h-4 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : viewedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {viewedItems.slice(0, limit).map((viewedItem: any) => (
            <RecentlyViewedItem
              key={`${viewedItem.itemType}-${viewedItem.itemId}`}
              itemType={viewedItem.itemType}
              itemId={viewedItem.itemId}
              lastViewedAt={viewedItem.lastViewedAt}
              viewCount={viewedItem.viewCount}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recently viewed items.</p>
          <p className="text-sm mt-2">
            Start browsing to see your viewing history here!
          </p>
        </Card>
      )}
    </div>
  );
}

function RecentlyViewedItem({
  itemType,
  itemId,
  lastViewedAt,
  viewCount,
}: {
  itemType: "product" | "property";
  itemId: string;
  lastViewedAt: string;
  viewCount: number;
}) {
  const router = useRouter();
  const { data: productData } = useGetProductByIdForBuyerQuery(
    itemType === "product" ? itemId : skipToken,
    { skip: itemType !== "product" }
  );
  const { data: propertyData } = useGetPropertyByIdForBuyerQuery(
    itemType === "property" ? itemId : skipToken,
    { skip: itemType !== "property" }
  );

  const item =
    itemType === "product" ? productData?.product : propertyData?.property;
  if (!item) return null;

  // Safely pick an image depending on the item type to satisfy the union type
  let itemImage: string | undefined;
  if (itemType === "product") {
    // Product has images?: string[]
    itemImage = (item as any).images?.[0];
  } else {
    // Property has images: string[] (and may have image in some shapes)
    const propertyItem = item as any;
    itemImage = propertyItem.image || propertyItem.images?.[0];
  }

  const itemName = itemType === "product" ? (item as any).name : (item as any).title;
  const itemPrice = (item as any).price || 0;

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() =>
        router.push(
          `/${
            itemType === "product" ? "ecommerce" : "real-estate"
          }/buyer/${itemType === "product" ? "products" : "properties"}/${itemId}`
        )
      }
    >
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {itemImage &&
        (itemImage.startsWith("http") ||
          itemImage.startsWith("https") ||
          itemImage.startsWith("data:")) ? (
          <Image
            src={itemImage}
            alt={itemName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {itemType === "product" ? "📦" : "🏠"}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {viewCount}x
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {itemName}
        </h3>
        <p className="text-lg font-bold text-primary">
          ${itemPrice.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(lastViewedAt), { addSuffix: true })}
        </p>
      </div>
    </Card>
  );
}


