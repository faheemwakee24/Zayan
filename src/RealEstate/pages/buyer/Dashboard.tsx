"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Bed,
  Bath,
  Square,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { BuyerDashboardLayout } from "@/RealEstate/components/BuyerDashboardLayout";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import {
  useGetBuyerPropertiesQuery,
  useGetTopSellersQuery,
} from "@/services/redux/api/propertyApi";
import {
  useGetUserConversationsQuery,
  type Conversation,
} from "@/services/redux/api/chatApi";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export default function BuyerDashboard() {
  const router = useRouter();
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedProperties((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  // Fetch current user profile (RTK Query will cache this, so it's efficient even if BuyerSidebar also calls it)
  const { data: userData } = useGetCurrentUserQuery("realestate_buyer");
  const userProfile = userData?.user;

  // Fetch featured properties (first 2 properties, sorted by views or featured)
  const { data: propertiesData, isLoading: propertiesLoading } =
    useGetBuyerPropertiesQuery({
      sortBy: "views",
      order: "desc",
    });
  const featuredProperties = propertiesData?.properties?.slice(0, 2) || [];

  // Fetch top sellers (first 3 high rating)
  const { data: topSellersData, isLoading: topSellersLoading } =
    useGetTopSellersQuery({
      role: "realEstateSeller",
      limit: 3,
    });
  console.log(topSellersData, "topSellersData");
  const topSellers = topSellersData?.sellers || [];

  // Fetch recent conversations (only buyer conversations)
  const { data: conversationsData, isLoading: conversationsLoading } =
    useGetUserConversationsQuery({ role: "realestate_buyer" });
  const recentMessages = conversationsData?.conversations
    ? [...conversationsData.conversations]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 3)
    : [];

  return (
    <BuyerDashboardLayout>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div
            className="border border-[#0f4656]/10 rounded-lg p-6 lg:p-8 relative overflow-hidden"
            style={{ backgroundColor: "rgba(15, 70, 86, 0.03)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef864c]/5 rounded-full -mr-16 -mt-16" />
            <div className="flex items-start justify-between mb-4 ">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0f4656] mb-1">
                  Welcome back, {userProfile?.name || "User"}! 👋
                </h1>
                <p className="text-sm text-[#0f4656]/60 font-bold max-w-2xl">
                  Ready to explore amazing properties? Check out today&apos;s
                  featured listings and recommendations.
                </p>
              </div>
              <div className="h-fit w-fit rounded-lg bg-[#ef864c] p-1 shadow-md">
                <NotificationBell channel="real-estate" />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap flex-col-reverse sm:flex-row ">
              <Button
                variant="outline"
                onClick={() => router.push("/real-estate")}
                className="h-10 border-2 border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5 rounded-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                Home
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/real-estate/buyer/messages")}
                className="h-10 border-2 border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5 rounded-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                View Messages
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/real-estate/seller/dashboard")}
                className="h-10 border-2 border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5 rounded-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                Switch to selling
              </Button>
              <Button
                className="h-10 gap-2 text-white bg-[#ef864c] hover:bg-[#d9723f] rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-[#ef864c]/20 transition-all"
                onClick={() => router.push("/real-estate/buyer/properties")}
              >
                Browse Properties
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-white rounded-xl border border-border p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <Heart className='w-5 h-5 text-secondary' />
                    <span className='text-xs font-medium text-secondary bg-secondary-100 px-2 py-1 rounded'>
                      +8 this week
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground mb-1'>
                    Saved Properties
                  </p>
                  <p className='text-3xl font-heading font-bold text-foreground'>
                    12
                  </p>
                </div>

                <div className='bg-white rounded-xl border border-border p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <MessageSquare className='w-5 h-5 text-accent' />
                  </div>
                  <p className='text-sm text-muted-foreground mb-1'>
                    Active Messages
                  </p>
                  <p className='text-3xl font-heading font-bold text-foreground'>
                    8
                  </p>
                  <p className='text-xs text-accent mt-1'>2 unread</p>
                </div>

                <div className='bg-white rounded-xl border border-border p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <Eye className='w-5 h-5 text-primary' />
                    <span className='text-xs font-medium text-primary bg-primary-100 px-2 py-1 rounded'>
                      +12% this month
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground mb-1'>
                    Properties Viewed
                  </p>
                  <p className='text-3xl font-heading font-bold text-foreground'>
                    45
                  </p>
                </div>
              </div> */}

          {/* Featured Properties */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-black text-[#0f4656] flex items-center gap-2 uppercase tracking-tight">
                <Star className="w-5 h-5 text-[#ef864c] fill-current" />
                Featured Properties
              </h2>
              <button
                onClick={() => router.push("/real-estate/buyer/properties")}
                className="text-[10px] font-black uppercase tracking-widest text-[#ef864c] hover:text-[#d9723f] transition-colors flex items-center gap-1.5"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {propertiesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card
                    key={i}
                    className="overflow-hidden h-full flex flex-col"
                  >
                    <div className="relative h-64 overflow-hidden bg-foreground/5 animate-pulse" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-foreground/10 rounded animate-pulse" />
                      <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                      <div className="h-8 bg-foreground/10 rounded animate-pulse" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : featuredProperties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredProperties?.map((property) => {
                  const sellerName =
                    property.owner?.name || property.seller?.name || "Unknown";
                  const sellerAvatar =
                    property.owner?.avatar ||
                    property.seller?.avatar ||
                    sellerName?.charAt(0) ||
                    "U";
                  const sellerRating =
                    property.owner?.rating || property.seller?.rating || 0;
                  const mainImage =
                    property.images?.[0] ||
                    property.image ||
                    "https://images.unsplash.com/photo-1512917774080-9b274b1a9c7d?w=600&h=400&fit=crop";

                  return (
                    <Link
                      key={property._id || property.id}
                      href={`/real-estate/buyer/properties/${
                        property._id || property.id
                      }`}
                    >
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group rounded-lg">
                        {/* Image */}
                        <div className="relative h-56 lg:h-64 overflow-hidden bg-[#0f4656]/5">
                          <Image
                            src={mainImage}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                          {property.status && (
                            <div className="absolute top-3 left-3 bg-[#0f4656] text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg">
                              {property.status}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSave(property._id || property.id);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-[#ef864c]"
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                savedProperties.includes(
                                  property._id || property.id,
                                )
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col space-y-3">
                          <div className="space-y-1">
                            <h3 className="text-base sm:text-lg font-black text-[#0f4656] line-clamp-1 group-hover:text-[#ef864c] transition-colors">
                              {property.title}
                            </h3>
                            <p className="text-[#0f4656]/60 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <MapPin className="w-3.5 h-3.5 text-[#ef864c]" />
                              {property?.location?.slice(0, 35) ||
                                `${property?.city || ""}${
                                  property?.city && property?.state ? ", " : ""
                                }${property?.state || ""}`.trim() ||
                                "Location not specified"}
                            </p>
                          </div>

                          <p className="text-xl lg:text-2xl font-black text-[#ef864c]">
                            ${property.price?.toLocaleString() || "0"}
                          </p>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#0f4656]/5 text-[10px] font-black uppercase tracking-widest text-[#0f4656]/60">
                            <div className="flex items-center gap-1.5">
                              <Bed className="w-3.5 h-3.5 text-[#ef864c]" />
                              {property.beds}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Bath className="w-3.5 h-3.5 text-[#ef864c]" />
                              {property.baths}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Square className="w-3.5 h-3.5 text-[#ef864c]" />
                              {property.sqft?.toLocaleString() || "0"}
                            </div>
                          </div>

                          {/* Seller Info */}
                          <div className="flex items-center gap-2.5 pt-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-[#0f4656]/5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sellerAvatar}
                                alt={sellerName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-[#0f4656] truncate uppercase tracking-tight">
                                {sellerName}
                              </p>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-[#ef864c]">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {sellerRating.toFixed(1)}
                              </div>
                            </div>
                            <Button className="h-8 px-4 text-white bg-[#ef864c] hover:bg-[#d9723f] rounded-lg font-black text-[10px] uppercase tracking-widest transition-all">
                              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No featured properties available at the moment.</p>
              </div>
            )}
          </div>

          {/* Top Sellers & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 pt-4">
            {/* Top Sellers */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-[#0f4656] flex items-center gap-2 uppercase tracking-tight">
                <Star className="w-5 h-5 text-[#ef864c] fill-current" />
                Top Sellers
              </h2>
              {topSellersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="p-4 flex items-center gap-4 rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#0f4656]/5 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#0f4656]/10 rounded animate-pulse" />
                        <div className="h-3 bg-[#0f4656]/10 rounded animate-pulse w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : topSellers?.length > 0 ? (
                <div className="space-y-3">
                  {topSellers?.map((seller, index) => {
                    const sellerName =
                      seller.name ||
                      `${seller.firstName || ""} ${
                        seller.lastName || ""
                      }`.trim() ||
                      "Unknown";
                    const sellerAvatar =
                      seller.avatar || sellerName?.charAt(0) || "U";
                    // Use id if available, otherwise fallback to index for unique key
                    const sellerId = seller._id || `seller-${index}`;

                    return (
                      <Link
                        key={sellerId}
                        href={`/real-estate/buyer/seller-profile/${sellerId}`}
                      >
                        <Card className="p-3.5 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 rounded-lg mt-3 group">
                          {sellerAvatar &&
                          (sellerAvatar.startsWith("http") ||
                            sellerAvatar.startsWith("https") ||
                            sellerAvatar.startsWith("data:")) ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#0f4656]/5 flex-shrink-0 group-hover:border-[#ef864c]/20 transition-all">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sellerAvatar}
                                alt={sellerName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#ef864c] text-white shadow-md">
                              <span className="text-xs font-black uppercase">
                                {sellerAvatar}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-[#0f4656] text-sm uppercase tracking-tight truncate">
                              {sellerName}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#0f4656]/50 mt-0.5 uppercase tracking-wide">
                              <div className="flex items-center gap-1 text-[#ef864c]">
                                <Star className="w-3 h-3 fill-current" />
                                {seller.rating?.toFixed(1) || "0.0"}
                              </div>
                              <span className="hidden sm:inline">
                                • {seller.reviews || 0} reviews
                              </span>
                              <span>
                                • {seller.totalProperties || 0} Assets
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-2 border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            View
                          </Button>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No top sellers available at the moment.</p>
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#0f4656] flex items-center gap-2 uppercase tracking-tight">
                  <MessageSquare className="w-5 h-5 text-[#ef864c] fill-current" />
                  Recent Messages
                </h2>
                <button
                  onClick={() => router.push("/real-estate/buyer/messages")}
                  className="text-[10px] font-black uppercase tracking-widest text-[#ef864c] hover:text-[#d9723f] transition-colors flex items-center gap-1.5"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {conversationsLoading ? (
                <div className="space-y-3 flex flex-col">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="p-4 flex items-center gap-4 rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#0f4656]/5 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#0f4656]/10 rounded animate-pulse" />
                        <div className="h-3 bg-[#0f4656]/10 rounded animate-pulse w-2/3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : recentMessages.length > 0 ? (
                <div className="space-y-3 flex flex-col gap-[2px]">
                  {recentMessages.map((conversation: Conversation) => {
                    const seller = conversation.seller;
                    const property = conversation.property;
                    const sellerName = seller?.name || "Unknown Seller";
                    const sellerAvatar =
                      seller?.avatar || sellerName?.charAt(0) || "U";
                    const propertyTitle = property?.title || "Property";
                    const lastMessage =
                      conversation.lastMessage || "No messages yet";

                    return (
                      <Link
                        key={conversation.id}
                        href={`/real-estate/buyer/messages/${conversation.id}`}
                      >
                        <Card className="p-3.5 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 rounded-lg mt-3 group">
                          {sellerAvatar &&
                          (sellerAvatar.startsWith("http") ||
                            sellerAvatar.startsWith("https") ||
                            sellerAvatar.startsWith("data:")) ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#0f4656]/5 flex-shrink-0 group-hover:border-[#ef864c]/20 transition-all">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sellerAvatar}
                                alt={sellerName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#ef864c] text-white shadow-md">
                              <span className="text-xs font-black uppercase">
                                {sellerAvatar}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-[#0f4656] text-sm uppercase tracking-tight truncate">
                              {sellerName}
                            </p>
                            <p className="text-[10px] font-bold text-[#0f4656]/50 truncate mt-0.5 uppercase tracking-wide">
                              {propertyTitle}
                            </p>
                            <p className="text-[10px] font-bold text-[#0f4656]/80 truncate mt-1 bg-[#0f4656]/5 p-1 px-2 rounded-sm inline-block">
                              {lastMessage}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[#ef864c] mt-2 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(conversation.updatedAt)}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#0f4656]/5 rounded-lg">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#0f4656]/20" />
                  <p className="text-xs font-black text-[#0f4656]/60 uppercase tracking-widest">
                    No messages yet
                  </p>
                  <p className="text-[9px] font-bold text-[#0f4656]/30 uppercase tracking-tight mt-1">
                    Start a conversation from a property page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BuyerDashboardLayout>
  );
}
