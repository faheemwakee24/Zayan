"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Star,
  TrendingUp,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Store,
  Home,
  Loader2,
} from "lucide-react";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import { useGetAllProductsForBuyerQuery } from "@/services/redux/api/productApi";
import { useGetUserConversationsQuery } from "@/services/redux/api/chatApi";
import { NotificationBell } from "@/components/notifications/NotificationBell";

// Helper function to format time
const formatTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function BuyerDashboard() {
  const router = useRouter();

  // Get current user
  const { data: currentUserData } = useGetCurrentUserQuery("ecommerce_buyer");
  const userProfile = currentUserData?.user;
  const ecommerceBuyerProfile = userProfile?.profiles?.ecommerce_buyer as {
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
  } | undefined;

  // Get all products to find liked ones
  const { data: productsData, isLoading: isProductsLoading } = useGetAllProductsForBuyerQuery({});
  const allProducts = useMemo(() => productsData?.products || [], [productsData?.products]);

  // Get liked products
  const likedProducts = useMemo(() => {
    return allProducts.filter((product) => product.isLiked).slice(0, 4);
  }, [allProducts]);

  // Get recent chats
  const { data: conversationsData, isLoading: isConversationsLoading } = useGetUserConversationsQuery({
    role: "ecommerce_buyer",
  });
  const conversations = useMemo(() => conversationsData?.conversations || [], [conversationsData?.conversations]);
  const recentChats = useMemo(() => {
    return conversations.slice(0, 5);
  }, [conversations]);

  // Calculate stats
  const activeChatsCount = conversations.length;

  // Get user display name
  const userName = useMemo(() => {
    if (ecommerceBuyerProfile) {
      const firstName = ecommerceBuyerProfile.firstName || "";
      const lastName = ecommerceBuyerProfile.lastName || "";
      return `${firstName} ${lastName}`.trim() || userProfile?.name || "User";
    }
    return userProfile?.name || "User";
  }, [ecommerceBuyerProfile, userProfile]);

  // Get recommendations (top rated products)
  const recommendations = useMemo(() => {
    return allProducts
      .filter((product) => product.rating && product.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [allProducts]);



  return (
    <EcommerceBuyerLayout>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: '#0f4656' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2" style={{ color: '#ffffff' }}>
                    Welcome back, {userName.split(" ")[0]}! 👋
                  </h1>
                </div>
                <div className="[&_svg]:text-white [&_button]:text-white">
                  <NotificationBell channel="ecommerce" />
                </div>
              </div>
              <p className="mb-4" style={{ color: '#ffffff80' }}>
                Ready to explore amazing products? Check out today&apos;s deals and
                recommendations.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button 
                  className="gap-2 text-white" 
                  style={{ backgroundColor: '#ef864c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                  onClick={() => router.push("/ecommerce/buyer/products")}
                >
                  Browse Products
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-white border-white bg-transparent hover:bg-white/20"
                  onClick={() => router.push("/ecommerce/seller/dashboard")}
                >
                  <Store className="w-4 h-4" />
                  Switch to Selling
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-white bg-transparent border-white hover:bg-white/20"
                  onClick={() => router.push("/ecommerce")}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-5 h-5" style={{ color: '#ef864c' }} />
                  
                </div>
                <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1">Wishlisted</p>
                <p className="text-3xl font-heading font-bold" style={{ color: '#ef864c' }}>
                  {isProductsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ef864c' }} />
                  ) : (
                    allProducts.filter((p) => p.isLiked).length
                  )}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <MessageCircle className="w-5 h-5" style={{ color: '#0f4656' }} />
                </div>
                <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1">
                  Active Chats
                </p>
                <p className="text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
                  {isConversationsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#ef864c' }} />
                  ) : (
                    activeChatsCount
                  )}
                </p>
              </div>
            </div>

            {/* Recommended for You */}
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2" style={{ color: '#0f4656' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#ef864c' }} />
                Recommended for You
              </h2>

              {isProductsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.map((product) => {
                    const productImage = product.images?.[0] || "📦";
                    const currency = product.currency || "USD";
                    const currencySymbol = currency === "USD" ? "$" : currency === "PKR" ? "₨" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
                    
                    return (
                      <div
                        key={product._id}
                        className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer shadow-sm"
                        style={{ '--hover-border-color': '#ef864c' } as React.CSSProperties}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                        onClick={() => router.push(`/ecommerce/buyer/products/${product._id}`)}
                      >
                        <div className="relative h-40 flex items-center justify-center text-4xl overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
                          {productImage && (productImage.startsWith("http") || productImage.startsWith("https") || productImage.startsWith("data:")) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{productImage}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-heading font-bold text-sm mb-2 line-clamp-2 transition-colors" style={{ color: '#0f4656' }}>
                            {product.name}
                          </h3>
                          {product.rating && product.rating > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(product.rating || 0)
                                      ? "fill-current"
                                      : "text-border"
                                  }`}
                                  style={i < Math.floor(product.rating || 0) ? { color: '#ef864c' } : undefined}
                                />
                              ))}
                              <span className="text-xs text-foreground/60 ml-1">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <p className="text-lg font-heading font-bold mb-3" style={{ color: '#ef864c' }}>
                            {currencySymbol}{product.price}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            style={{ borderColor: '#ef864c', color: '#ef864c' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef864c20';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/ecommerce/buyer/products/${product._id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No recommendations available
                </div>
              )}
            </div>

            {/* Recently Liked */}
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2" style={{ color: '#0f4656' }}>
                <Heart className="w-6 h-6" style={{ color: '#ef864c' }} />
                Recently Liked
              </h2>

              {isProductsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
                </div>
              ) : likedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {likedProducts.map((product) => {
                    const productImage = product.images?.[0] || "📦";
                    const currency = product.currency || "USD";
                    const currencySymbol = currency === "USD" ? "$" : currency === "PKR" ? "₨" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
                    
                    return (
                      <div
                        key={product._id}
                        className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer shadow-sm"
                        style={{ '--hover-border-color': '#ef864c' } as React.CSSProperties}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef864c'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                        onClick={() => router.push(`/ecommerce/buyer/products/${product._id}`)}
                      >
                        <div className="relative h-40 flex items-center justify-center text-4xl overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
                          {productImage && (productImage.startsWith("http") || productImage.startsWith("https") || productImage.startsWith("data:")) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{productImage}</span>
                          )}
                          <button 
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-heading font-bold text-sm mb-2 line-clamp-2 transition-colors" style={{ color: '#0f4656' }}>
                            {product.name}
                          </h3>
                          {product.rating && product.rating > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(product.rating || 0)
                                      ? "fill-current"
                                      : "text-border"
                                  }`}
                                  style={i < Math.floor(product.rating || 0) ? { color: '#ef864c' } : undefined}
                                />
                              ))}
                              <span className="text-xs text-foreground/60 ml-1">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <p className="text-lg font-heading font-bold mb-3" style={{ color: '#ef864c' }}>
                            {currencySymbol}{product.price}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            style={{ borderColor: '#ef864c', color: '#ef864c' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef864c20';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/ecommerce/buyer/products/${product._id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No liked products yet. Start exploring and like products you love!
                </div>
              )}
            </div>

            {/* Recent Chats */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold flex items-center gap-2" style={{ color: '#0f4656' }}>
                  <MessageCircle className="w-6 h-6" style={{ color: '#ef864c' }} />
                  Recent Chats
                </h2>
                <button 
                  className="font-medium transition-colors flex items-center gap-1"
                  style={{ color: '#ef864c' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#d9723f'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ef864c'}
                  onClick={() => router.push("/ecommerce/buyer/messages")}
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {isConversationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
                </div>
              ) : recentChats.length > 0 ? (
                <div className="space-y-2">
                  {recentChats.map((conversation) => {
                    const counterpart = conversation.buyer?.id === userProfile?._id 
                      ? conversation.seller 
                      : conversation.buyer;
                    const productTitle = conversation.product?.title || conversation.property?.title || "Product";
                    const lastMessageTime = conversation.updatedAt 
                      ? formatTime(conversation.updatedAt) 
                      : "";

                    return (
                      <div
                        key={conversation.id}
                        className="bg-white rounded-lg border border-border p-3 hover:shadow-md transition-all group cursor-pointer shadow-sm hover:border-[#ef864c]"
                        onClick={() => router.push(`/ecommerce/buyer/messages/${conversation.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg overflow-hidden flex-shrink-0 border-2" style={{ borderColor: '#ef864c40', backgroundColor: '#ef864c10' }}>
                            {counterpart?.avatar && (counterpart.avatar.startsWith("http") || counterpart.avatar.startsWith("https") || counterpart.avatar.startsWith("data:")) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={counterpart.avatar}
                                alt={counterpart?.name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base">{counterpart?.avatar || "💬"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-sm font-semibold transition-colors truncate" style={{ color: '#0f4656' }}>
                                {counterpart?.name || "Unknown User"}
                              </h3>
                              {lastMessageTime && (
                                <span className="text-xs text-foreground/50 whitespace-nowrap flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lastMessageTime}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground/70 line-clamp-1 mb-0.5 font-medium">
                              {productTitle}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-xs text-foreground/60 line-clamp-1">
                                {conversation.lastMessage}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ef864c20' }}>
                              <MessageCircle className="w-4 h-4" style={{ color: '#ef864c' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No recent chats. Start a conversation with a seller!
                </div>
              )}
            </div>
        </div>
      </div>
    </EcommerceBuyerLayout>
  );
}
