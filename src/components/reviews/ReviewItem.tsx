"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, BadgeCheck, MessageSquare, Reply } from "lucide-react";
import { SellerReview } from "@/services/redux/api/reviewApi";
import { formatDistanceToNow } from "date-fns";

interface ReviewItemProps {
  review: SellerReview;
  isCurrentUserSeller?: boolean;
  onAddResponse?: (reviewId: string, response: string) => Promise<void>;
  showResponseForm?: boolean;
}

export function ReviewItem({
  review,
  isCurrentUserSeller = false,
  onAddResponse,
  showResponseForm = false,
}: ReviewItemProps) {
  const [showResponseInput, setShowResponseInput] = useState(showResponseForm);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !onAddResponse) return;

    setIsSubmitting(true);
    try {
      await onAddResponse(review._id, responseText.trim());
      setResponseText("");
      setShowResponseInput(false);
    } catch (error) {
      console.error("Failed to submit response", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = review.categories || {};
  const hasCategories =
    categories.communication ||
    categories.accuracy ||
    categories.professionalism;

  return (
    <Card className="p-6">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-medium overflow-hidden">
            {review.user.avatar &&
            (review.user.avatar.startsWith("http") ||
              review.user.avatar.startsWith("https") ||
              review.user.avatar.startsWith("data:")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {review.user.avatar || review.user.name.charAt(0) || "U"}
              </span>
            )}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{review.user.name}</p>
              {review.verified && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < review.rating
                  ? "fill-accent text-accent"
                  : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="ml-2 font-bold text-primary">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Category Ratings */}
      {hasCategories && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Category Ratings:
          </p>
          <div className="grid grid-cols-3 gap-4">
            {categories.communication && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Communication
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(categories.communication || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-semibold text-primary ml-1">
                    {categories.communication.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {categories.accuracy && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(categories.accuracy || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-semibold text-primary ml-1">
                    {categories.accuracy.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {categories.professionalism && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Professionalism
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(categories.professionalism || 0)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-semibold text-primary ml-1">
                    {categories.professionalism.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      )}

      {/* Review Comment */}
      {review.comment && (
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Seller Response */}
      {review.sellerResponse && review.sellerResponse.response && (
        <div
          className="mt-4 p-4 border-l-4 rounded-r-lg"
          style={{ backgroundColor: "#ef864c10", borderLeftColor: "#ef864c" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4" style={{ color: "#ef864c" }} />
            <p className="text-sm font-semibold" style={{ color: "#ef864c" }}>
              Seller Response
            </p>
            {review.sellerResponse.respondedAt && (
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDistanceToNow(
                  new Date(review.sellerResponse.respondedAt),
                  { addSuffix: true },
                )}
              </span>
            )}
          </div>
          <p className="text-sm font-medium" style={{ color: "#0f4656" }}>
            {review.sellerResponse.response}
          </p>
        </div>
      )}

      {/* Add Response Button (for seller) */}
      {isCurrentUserSeller &&
        (!review.sellerResponse || !review.sellerResponse.response) && (
          <div className="mt-4 pt-4 border-t border-border">
            {!showResponseInput ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponseInput(true)}
                className="gap-2 transition-all hover:bg-[#ef864c10]"
                style={{ color: "#ef864c", borderColor: "#ef864c" }}
              >
                <Reply className="w-4 h-4" />
                Add Response
              </Button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a response to this review..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none text-sm"
                  style={{ borderColor: "#0f465620", color: "#0f4656" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#ef864c")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#0f465620")
                  }
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!responseText.trim() || isSubmitting}
                    size="sm"
                    className="text-white h-10 px-6 rounded-xl font-bold"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#d9723f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ef864c")
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Submit Response"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-6 rounded-xl font-bold border-2"
                    style={{ color: "#0f4656", borderColor: "#0f465620" }}
                    onClick={() => {
                      setShowResponseInput(false);
                      setResponseText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
    </Card>
  );
}
