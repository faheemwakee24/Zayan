"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetRecommendationsQuery } from "@/services/redux/api/marketplaceApi";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface RecommendationsProps {
  itemType: "product" | "property";
  limit?: number;
  title?: string;
  showViewAll?: boolean;
  className?: string;
}

export function Recommendations({
  itemType,
  limit = 8,
  title,
  showViewAll = true,
  className,
}: RecommendationsProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetRecommendationsQuery({
    itemType,
    limit,
  });

  const items = data?.items || [];
  const displayTitle = title || `Recommended For You`;

  if (error) {
    return null; // Silently fail - don't break the page
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{displayTitle}</h2>
        </div>
        {showViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${itemType === "product" ? "ecommerce" : "real-estate"}/buyer/${itemType === "product" ? "products" : "properties"}`)}
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
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item: any) => {
            const itemImage = item.images?.[0] || item.image;
            const itemName = itemType === "product" ? item.name : item.title;
            const itemPrice = item.price || 0;

            return (
              <Card
                key={item._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() =>
                  router.push(
                    `/${itemType === "product" ? "ecommerce" : "real-estate"}/buyer/${itemType === "product" ? "products" : "properties"}/${item._id}`
                  )
                }
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                  {itemImage && (itemImage.startsWith("http") || itemImage.startsWith("https") || itemImage.startsWith("data:")) ? (
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
                  <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
                    Recommended
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                    {itemName}
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    ${itemPrice.toLocaleString()}
                  </p>
                  {item.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-sm text-muted-foreground">
                        ⭐ {item.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No recommendations available at the moment.</p>
          <p className="text-sm mt-2">Start browsing to get personalized recommendations!</p>
        </Card>
      )}
    </div>
  );
}

