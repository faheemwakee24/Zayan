"use client";

import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MessageSquare,
  Phone,
  Mail,
  Award,
  Users,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useGetSellerProfileByIdQuery, useGetPropertiesBySellerIdQuery, Property } from "@/services/redux/api/propertyApi";
import { useGetSellerReviewsQuery, useAddSellerResponseMutation, useCreateSellerReviewMutation } from "@/services/redux/api/reviewApi";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import { ReviewSummaryCard } from "@/components/reviews/ReviewSummaryCard";
import { ReviewItem } from "@/components/reviews/ReviewItem";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SellerProfileProps {
  sellerId: string;
}

export default function SellerProfile({ sellerId }: SellerProfileProps) {
  const { toast } = useToast();
  
  // Fetch seller profile data
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useGetSellerProfileByIdQuery({ id: sellerId, role: 'realestate_seller' });
  
  // Fetch seller's properties
  const { data: propertiesData, isLoading: propertiesLoading } = useGetPropertiesBySellerIdQuery(sellerId);
  
  // Fetch seller reviews
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useGetSellerReviewsQuery(sellerId);
  
  // Get current user
  const { data: currentUserData } = useGetCurrentUserQuery('realestate_buyer');
  const currentUserId = currentUserData?.user?._id;
  const isCurrentUserSeller = currentUserId === sellerId;
  
  // Review mutations
  const [addResponse] = useAddSellerResponseMutation();
  const [createReview] = useCreateSellerReviewMutation();
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [categoryRatings, setCategoryRatings] = useState({
    communication: 5,
    accuracy: 5,
    professionalism: 5,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const sellerProperties = propertiesData?.properties || [];

  // Loading state
  if (profileLoading) {
    return (
      <LandingLayout>
        <div className="p-4 lg:p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3 text-foreground/60">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
            <p>Loading seller profile...</p>
          </div>
        </div>
      </LandingLayout>
    );
  }

  // Error state
  if (profileError || !profileData?.profile) {
    return (
      <LandingLayout>
        <div className="p-4 lg:p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-red-700 mb-2">Error loading seller profile</h3>
            <p className="text-red-600 mb-4">Unable to load seller profile. Please try again.</p>
            <Link href="/real-estate/buyer/properties">
              <Button variant="outline">Back to Properties</Button>
            </Link>
          </div>
        </div>
      </LandingLayout>
    );
  }

  const profile = profileData.profile;
  // Format seller data
  const handleSubmitReview = async () => {
    if (!currentUserId) {
      toast({
        title: "Login required",
        description: "Please log in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toast({
        title: "Invalid rating",
        description: "Please provide a rating between 1 and 5 stars.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await createReview({
        sellerId,
        payload: {
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          categories: categoryRatings,
        },
      }).unwrap();

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      });

      setShowReviewForm(false);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setCategoryRatings({ communication: 5, accuracy: 5, professionalism: 5 });
      refetchReviews();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error
          ? (error.data as { message?: string })?.message ||
            "Please make sure you have interacted with this seller first."
          : "Please make sure you have interacted with this seller first.";
      toast({
        title: "Failed to submit review",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddResponse = async (reviewId: string, response: string) => {
    try {
      await addResponse({ reviewId, payload: { response } }).unwrap();
      toast({
        title: "Response added",
        description: "Your response has been added successfully.",
      });
      refetchReviews();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error
          ? (error.data as { message?: string })?.message ||
            "Unable to add response. Please try again."
          : "Unable to add response. Please try again.";
      toast({
        title: "Failed to add response",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const seller = {
    id: profile.id,
    name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
    avatar: profile.avatar || profile.firstName?.charAt(0) || "U",
    rating: reviewsData?.averageRating || profile.rating || 0,
    reviews: reviewsData?.count || 0,
    properties: profile.totalProperties || 0,
    experience: "", // Not available in current profile
    specialization: profile.specialization || "Real Estate Professional",
    description: profile.bio || "",
    phone: profile.phone || "",
    email: profile.email || "",
    responseTime: "< 24 hours", // Default
    image: profile.avatar || "",
    certifications: profile.certifications ? (typeof profile.certifications === 'string' ? profile.certifications.split(',').map(c => c.trim()) : profile.certifications) : [],
    languages: profile.languages || [],
    about: profile.bio || "",
  };

  return (
    <LandingLayout>
      <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/real-estate/buyer/properties"
          className="inline-flex items-center gap-2 font-semibold"
          style={{ color: '#ef864c' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - Profile Image */}
          <div>
            <Card className="overflow-hidden p-6 text-center">
              {seller.image && seller.image.startsWith('http') ? (
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden relative border-2 border-primary/20">
                  <Image
                    src={seller.image}
                    alt={seller.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ef864c' }}>
                  <span className="text-4xl font-bold text-white">{seller.avatar}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-2xl font-bold" style={{ color: '#0f4656' }}>{seller.name}</h1>
                {profile.verificationStatus === "approved" && (
                  <span
                    className="inline-flex items-center"
                    title="Verified User"
                  >
                    <svg
                      className="w-5 h-5 text-blue-500 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <p className="font-semibold mb-4" style={{ color: '#ef864c' }}>{seller.specialization}</p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(seller.rating) ? "fill-accent" : "text-foreground/20"}`}
                    style={i < Math.floor(seller.rating) ? { color: '#ef864c' } : {}}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold mb-2" style={{ color: '#0f4656' }}>
                {seller.rating.toFixed(1)} ({seller.reviews} {seller.reviews === 1 ? "review" : "reviews"})
              </p>

              <div className="space-y-3 mt-6 pt-6 border-t border-border">
                <Button className="w-full text-white hover:opacity-90" style={{ backgroundColor: '#ef864c' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {seller.phone}
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  {seller.email}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right - Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Key Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#0f4656' }}>Professional Overview</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Experience</p>
                  <p className="text-2xl font-bold" style={{ color: '#0f4656' }}>{seller.experience}</p>
                </div>
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Active Listings</p>
                  <p className="text-2xl font-bold" style={{ color: '#0f4656' }}>{seller.properties}</p>
                </div>
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Response Time</p>
                  <p className="text-lg font-bold" style={{ color: '#ef864c' }}>{seller.responseTime}</p>
                </div>
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold" style={{ color: '#0f4656' }}>{seller.reviews}</p>
                </div>
              </div>
            </Card>

            {/* About */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#0f4656' }}>About</h2>
              <p className="text-foreground/70 leading-relaxed mb-6">{seller.about || seller.description}</p>
              {/* <p className="text-foreground/70 leading-relaxed">{seller.description}</p> */}
            </Card>

            {/* Certifications & Languages */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#0f4656' }}>
                  <Award className="w-5 h-5" style={{ color: '#ef864c' }} />
                  Certifications
                </h3>
                <ul className="space-y-2">
                  {seller.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-foreground/70 flex items-start gap-2">
                      <span className="mt-1" style={{ color: '#ef864c' }}>✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#0f4656' }}>
                  <Users className="w-5 h-5" style={{ color: '#ef864c' }} />
                  Languages
                </h3>
                <ul className="space-y-2">
                  {seller.languages.map((lang, index) => (
                    <li key={index} className="text-sm text-foreground/70">
                      {lang}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: '#0f4656' }}>Reviews</h2>
            {currentUserId && !isCurrentUserSeller && (
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="gap-2"
              >
                {showReviewForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Write a Review
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && !isCurrentUserSeller && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0f4656' }}>Write a Review</h3>
              <div className="space-y-4">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            rating <= reviewRating
                              ? "fill-accent"
                              : "text-muted-foreground"
                          }`}
                          style={rating <= reviewRating ? { color: '#ef864c' } : {}}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-semibold" style={{ color: '#0f4656' }}>
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                {/* Category Ratings */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Category Ratings
                  </label>
                  
                  {/* Communication */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Communication</span>
                      <span className="text-sm font-semibold" style={{ color: '#0f4656' }}>{categoryRatings.communication} / 5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setCategoryRatings({ ...categoryRatings, communication: rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              rating <= categoryRatings.communication
                                ? "fill-accent"
                                : "text-muted-foreground"
                            }`}
                            style={rating <= categoryRatings.communication ? { color: '#ef864c' } : {}}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Accuracy</span>
                      <span className="text-sm font-semibold" style={{ color: '#0f4656' }}>{categoryRatings.accuracy} / 5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setCategoryRatings({ ...categoryRatings, accuracy: rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              rating <= categoryRatings.accuracy
                                ? "fill-accent"
                                : "text-muted-foreground"
                            }`}
                            style={rating <= categoryRatings.accuracy ? { color: '#ef864c' } : {}}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Professionalism */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Professionalism</span>
                      <span className="text-sm font-semibold" style={{ color: '#0f4656' }}>{categoryRatings.professionalism} / 5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setCategoryRatings({ ...categoryRatings, professionalism: rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              rating <= categoryRatings.professionalism
                                ? "fill-accent"
                                : "text-muted-foreground"
                            }`}
                            style={rating <= categoryRatings.professionalism ? { color: '#ef864c' } : {}}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Review Comment
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your detailed experience..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </Card>
          )}

          {/* Review Summary */}
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ef864c' }} />
            </div>
          ) : reviewsData && reviewsData.count > 0 ? (
            <>
              <ReviewSummaryCard reviewsData={reviewsData} />
              
              {/* Individual Reviews */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold" style={{ color: '#0f4656' }}>
                  All Reviews ({reviewsData.count})
                </h3>
                {reviewsData.reviews.map((review) => (
                  <ReviewItem
                    key={review._id}
                    review={review}
                    isCurrentUserSeller={isCurrentUserSeller}
                    onAddResponse={handleAddResponse}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                This seller hasn&apos;t received any reviews yet. Be the first to leave a review!
              </p>
            </Card>
          )}
        </div>

        {/* Listings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#0f4656' }}>Featured Listings</h2>
            <Link href="/real-estate/buyer/properties" className="text-sm font-semibold flex items-center gap-1" style={{ color: '#ef864c' }} onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'} onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {propertiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ef864c' }} />
            </div>
          ) : sellerProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sellerProperties.slice(0, 6).map((property: Property) => (
                <Link key={property._id} href={`/real-estate/buyer/properties/${property._id}`}>
                  <Card className="overflow-hidden hover:shadow-premium transition-all duration-300 group">
                    <div className="relative h-48 overflow-hidden bg-foreground/5">
                      <Image
                        src={property.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9b274b1a9c7d?w=400&h=300&fit=crop"}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-2 transition-colors" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>
                        {property.title}
                      </h3>
                      <p className="text-foreground/60 text-sm mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" style={{ color: '#ef864c' }} />
                        {property.location}
                      </p>

                      <p className="text-2xl font-bold mb-3" style={{ color: '#0f4656' }}>
                        ${(property.price / 1000000).toFixed(1)}M
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-xs text-foreground/60 mb-4 pb-4 border-b border-border">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3 h-3" style={{ color: '#ef864c' }} /> {property.beds}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3 h-3" style={{ color: '#ef864c' }} /> {property.baths}
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="w-3 h-3" style={{ color: '#ef864c' }} /> {typeof property.sqft === 'number' ? property.sqft.toLocaleString() : property.sqft}
                        </div>
                      </div>

                      <Button className="w-full text-white hover:opacity-90 text-xs" size="sm" style={{ backgroundColor: '#ef864c' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-foreground/60">
              <p>No properties listed yet.</p>
            </div>
          )}
        </div>
      </div>
    </LandingLayout>
  );
}
