"use client";

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { SellerReviewsResponse } from "@/services/redux/api/reviewApi";

interface ReviewSummaryCardProps {
  reviewsData: SellerReviewsResponse;
  categoryRatings?: {
    communication: number;
    accuracy: number;
    professionalism: number;
  };
}

export function ReviewSummaryCard({ reviewsData, categoryRatings }: ReviewSummaryCardProps) {
  const { averageRating, count, starBreakdown } = reviewsData;
  const categories = categoryRatings || reviewsData.categoryRatings;

  // Calculate percentage for each star rating
  const getStarPercentage = (stars: number): number => {
    if (count === 0) return 0;
    const starCount = starBreakdown[stars as keyof typeof starBreakdown] || 0;
    return Math.round((starCount / count) * 100);
  };

  // Render star rating bar
  const renderStarBar = (stars: number, count: number, percentage: number) => (
    <div key={stars} className="flex items-center gap-2">
      <div className="flex items-center gap-1 w-16">
        <span className="text-sm font-medium text-foreground">{stars}</span>
        <Star className="w-4 h-4 fill-accent text-accent" />
      </div>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-muted-foreground w-12 text-right">
        {count} ({percentage}%)
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Rating Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Overall Rating</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? "fill-accent text-accent"
                      : i < averageRating
                      ? "fill-accent/50 text-accent/50"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {count} {count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Star Breakdown */}
        <div className="space-y-2 pt-4 border-t border-border">
          {[5, 4, 3, 2, 1].map((stars) =>
            renderStarBar(
              stars,
              starBreakdown[stars as keyof typeof starBreakdown] || 0,
              getStarPercentage(stars)
            )
          )}
        </div>
      </Card>

      {/* Category Ratings Card */}
      {categories && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Category Ratings</h3>
          <div className="space-y-4">
            {/* Communication */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Communication</span>
                <span className="text-sm font-bold text-primary">
                  {categories.communication > 0 ? categories.communication.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(categories.communication || 0)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Accuracy</span>
                <span className="text-sm font-bold text-primary">
                  {categories.accuracy > 0 ? categories.accuracy.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(categories.accuracy || 0)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Professionalism */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Professionalism</span>
                <span className="text-sm font-bold text-primary">
                  {categories.professionalism > 0 ? categories.professionalism.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(categories.professionalism || 0)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Review Stats Card */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Review Statistics</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-primary">{count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
            <p className="text-2xl font-bold text-secondary">{averageRating.toFixed(1)} / 5.0</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">5-Star Reviews</p>
            <p className="text-2xl font-bold text-accent">
              {starBreakdown[5] || 0} ({getStarPercentage(5)}%)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

