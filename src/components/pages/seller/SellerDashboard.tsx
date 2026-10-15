"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Eye,
  Star,
  MessageCircle,
  Plus,
  Lightbulb,
  ArrowRight,
  Package,
  Store,
  Loader2,
} from "lucide-react";
import { useGetStoresQuery } from "@/services/redux/api/storeApi";
import { useGetProductsQuery } from "@/services/redux/api/productApi";
import { useGetUserConversationsQuery } from "@/services/redux/api/chatApi";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SubscriptionUsageCard } from "@/components/subscription/SubscriptionUsageCard";
import { cn } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
const formatTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  //eeeeeedsssdsdadd
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

export default function SellerDashboard() {
  const router = useRouter();

  // Get stores
  const { data: storesData, isLoading: isStoresLoading } = useGetStoresQuery();
  const stores = useMemo(() => storesData?.stores || [], [storesData?.stores]);
  const totalStores = stores.length;

  // Get products
  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery();
  const products = useMemo(
    () => productsData?.products || [],
    [productsData?.products],
  );
  const totalProducts = products.length;

  // Calculate metrics
  const totalLikes = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.likes || 0), 0);
  }, [products]);

  const totalViews = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.views || 0), 0);
  }, [products]);

  const avgRating = useMemo(() => {
    const ratings = products
      .filter((p) => p.rating && p.rating > 0)
      .map((p) => p.rating || 0);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
  }, [products]);

  // Get recent conversations
  const { data: conversationsData, isLoading: isConversationsLoading } =
    useGetUserConversationsQuery({
      role: "ecommerce_seller",
    });
  const conversations = useMemo(
    () => conversationsData?.conversations || [],
    [conversationsData?.conversations],
  );
  const recentMessages = useMemo(() => {
    return conversations.slice(0, 3).map((conv) => {
      const buyer = conv.buyer;
      const productTitle =
        conv.product?.title || conv.property?.title || "Product";
      return {
        id: conv.id,
        buyerName: buyer?.name || "Unknown Buyer",
        message: conv.lastMessage || "No message yet",
        product: productTitle,
        time: formatTime(conv.updatedAt),
        conversationId: conv.id,
      };
    });
  }, [conversations]);

  // Get top products by engagement (likes + views)
  const topProducts = useMemo(() => {
    return products
      .map((product) => ({
        name: product.name,
        engagement:
          product.likes && product.views
            ? Math.round(
                ((product.likes + product.views) /
                  Math.max(totalLikes + totalViews, 1)) *
                  100,
              )
            : 0,
        likes: product.likes || 0,
        views: product.views || 0,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 4);
  }, [products, totalLikes, totalViews]);

  // Get primary store name for greeting

  const metrics = [
    {
      label: "Total Stores",
      value: isStoresLoading ? "..." : totalStores.toString(),
      change: "",
      icon: Store,
      color: "primary",
    },
    {
      label: "Total Products",
      value: isProductsLoading ? "..." : totalProducts.toString(),
      change: "",
      icon: Package,
      color: "secondary",
    },
    {
      label: "Total Likes",
      value: isProductsLoading ? "..." : totalLikes.toLocaleString(),
      change: "",
      icon: Heart,
      color: "accent",
    },
    {
      label: "Total Views",
      value: isProductsLoading ? "..." : totalViews.toLocaleString(),
      change: "",
      icon: Eye,
      color: "primary",
    },
    {
      label: "Avg Rating",
      value: avgRating > 0 ? avgRating.toFixed(1) : "0.0",
      change: `Based on ${products.filter((p) => p.rating && p.rating > 0).length} products`,
      icon: Star,
      color: "secondary",
    },
  ];

  // Generate monthly data from products (simplified - using current month data)
  const monthlyData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();

    // Always show 6 months of data leading up to current month
    const startIdx = Math.max(0, currentMonth - 5);
    const chartMonths = months.slice(startIdx, currentMonth + 1);

    // If we have less than 6 months (e.g. earlier than June),
    // prepending previous year months for a better trend
    if (chartMonths.length < 6) {
      const prevYearMonths = months.slice(12 - (6 - chartMonths.length));
      chartMonths.unshift(...prevYearMonths);
    }

    return chartMonths.map((month, idx) => {
      const isCurrentMonth = idx === chartMonths.length - 1;

      // If it's the current month, show the real total data
      // For previous months, we don't have historical snapshots in this simplified state,
      // so we'll show 0 to be honest, or a tiny fraction to keep the trend aesthetic
      // only if there is actually data to distribute.
      let monthLikes = 0;
      let monthViews = 0;

      if (isCurrentMonth) {
        monthLikes = totalLikes;
        monthViews = totalViews;
      } else {
        // Honest representation: we don't have time-series data yet, so previous months are 0
        monthLikes = 0;
        monthViews = 0;
      }

      return {
        month,
        likes: monthLikes,
        views: monthViews,
      };
    });
  }, [totalLikes, totalViews]);

  const dynamicSuggestions = useMemo(() => {
    const s = [];

    // 1. Critical: No Stores
    if (totalStores === 0) {
      s.push({
        id: "create-store",
        title: "Launch Your Digital Storefront",
        description:
          "You haven't created a store yet. Stores with professional names and banners get 4x more visibility.",
        icon: "🏪",
        priority: "high",
        actionUrl: "/ecommerce/seller/stores/create",
        actionLabel: "Build Store",
      });
    }

    // 2. High Priority: No Products
    if (totalStores > 0 && totalProducts === 0) {
      s.push({
        id: "add-product",
        title: "List Your First Product",
        description:
          "Ready to sell? Add your first item to start reaching thousands of active buyers on Zayan.",
        icon: "�",
        priority: "high",
        actionUrl: "/ecommerce/seller/products/create",
        actionLabel: "Add Product",
      });
    }

    // 3. Medium: Low Image Count
    const productsWithFewImages = products.filter(
      (p) => (p.images?.length || 0) < 3,
    );
    if (productsWithFewImages.length > 0) {
      s.push({
        id: "optimization-images",
        title: "Boost Visual Appeal",
        description: `${productsWithFewImages.length} of your products have fewer than 3 images. High-quality galleries increase sales by 35%.`,
        icon: "📸",
        priority: "medium",
        actionUrl: "/ecommerce/seller/products",
        actionLabel: "Optimize Media",
      });
    }

    // 4. Critical: Out of Stock items
    const outOfStock = products.filter((p) => (p.stock || 0) === 0);
    if (outOfStock.length > 0) {
      s.push({
        id: "restock",
        title: "Inventory Alert",
        description:
          "You have items that are out of stock. Customers can't buy these right now—restock to recover lost sales.",
        icon: "⚠️",
        priority: "high",
        actionUrl: "/ecommerce/seller/products",
        actionLabel: "Update Stock",
      });
    }

    // 5. Engagement/Discovery: Low views high likes
    const potentialViral = products.find(
      (p) => (p.likes || 0) > 5 && (p.views || 0) < 100,
    );
    if (potentialViral) {
      s.push({
        id: "promote",
        title: "Hidden Gem Detected",
        description: `"${potentialViral.name}" is getting high likes for its view count. Consider updating its keywords to reach more buyers.`,
        icon: "✨",
        priority: "medium",
        actionUrl: "/ecommerce/seller/products",
        actionLabel: "Improve SEO",
      });
    }

    // Fallback/Generic if nothing else
    if (s.length < 2) {
      s.push({
        id: "insights",
        title: "Daily Market Insights",
        description:
          "Consumer trends show a 20% spike in electronics searches this week. Ensure your prices are competitive.",
        icon: "💡",
        priority: "low",
        actionUrl: "/ecommerce/seller/dashboard",
        actionLabel: "View Trends",
      });
    }

    return s.slice(0, 4);
  }, [totalStores, totalProducts, products]);

  const handleAction = (url: string) => {
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Greeting Header */}
        <div
          className="rounded-2xl border border-border p-5 sm:p-8 mb-6 sm:mb-8"
          style={{ backgroundColor: "#0f4656" }}
        >
          <div className="flex items-start flex-col sm:flex-row gap-4 sm:gap-6 sm:justify-between">
            <div className="space-y-1">
              <h1
                className="text-xl sm:text-4xl font-heading font-bold"
                style={{ color: "#ffffff" }}
              >
                Welcome back! 👋
              </h1>
              <p
                className="text-sm sm:text-base"
                style={{ color: "#ffffff80" }}
              >
                Here&apos;s what&apos;s happening with your store today
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="[&_svg]:text-white [&_button]:text-white scale-90 sm:scale-100">
                <NotificationBell channel="ecommerce" />
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/ecommerce")}
                className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-base border-2 font-semibold h-auto"
                style={{ color: "#ef864c", borderColor: "#ef864c" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef864c20";
                  e.currentTarget.style.color = "#d9723f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "#ef864c";
                }}
              >
                Home
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription & usage — plan, product count, renewal, upgrade CTA */}
        <SubscriptionUsageCard role="ecommerceSeller" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-border p-3 sm:p-6 shadow-sm"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-4"
                style={{ backgroundColor: "#ef864c20" }}
              >
                <metric.icon
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  style={{ color: "#ef864c" }}
                />
              </div>
              <p className="text-[10px] sm:text-sm text-foreground/60 mb-0.5 sm:mb-1 uppercase font-bold tracking-tight">
                {metric.label}
              </p>
              <p
                className="text-xl sm:text-3xl font-heading font-bold"
                style={{ color: "#0f4656" }}
              >
                {metric.value}
              </p>
              {metric.change && (
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
                  {metric.change}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Charts and Graphs */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Engagement Trends Chart */}
            <div className="bg-white rounded-2xl border border-border p-5 sm:p-8">
              <h3
                className="text-lg sm:text-xl font-heading font-bold mb-4 sm:mb-6"
                style={{ color: "#0f4656" }}
              >
                Engagement Trends
              </h3>
              {monthlyData.length > 0 ? (
                <div className="h-64 sm:h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient
                          id="colorLikes"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef864c"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef864c"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorViews"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0f4656"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0f4656"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          padding: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#0f4656"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        name="Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="likes"
                        stroke="#ef864c"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLikes)"
                        name="Likes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                  No data available yet
                </div>
              )}
              <div className="flex items-center gap-6 mt-4 px-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#ef864c" }}
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Likes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#0f4656" }}
                  />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Views
                  </span>
                </div>
              </div>
            </div>

            {/* Product Engagement */}
            <div className="bg-white rounded-2xl border border-border p-5 sm:p-8">
              <h3
                className="text-lg sm:text-xl font-heading font-bold mb-4 sm:mb-6"
                style={{ color: "#0f4656" }}
              >
                Top Products by Engagement
              </h3>
              {topProducts.length > 0 ? (
                <div className="space-y-5 sm:space-y-6">
                  {topProducts.map((product, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-base font-bold text-slate-700">
                          {product.name}
                        </span>
                        <span
                          className="text-xs sm:text-sm font-black"
                          style={{ color: "#ef864c" }}
                        >
                          {product.engagement}%
                        </span>
                      </div>
                      <div className="w-full rounded-full h-1.5 sm:h-2 bg-slate-100">
                        <div
                          className="rounded-full h-1.5 sm:h-2 transition-all duration-1000"
                          style={{
                            width: `${product.engagement}%`,
                            backgroundColor: "#ef864c",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No products yet. Add your first product to see engagement!
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
              <h3
                className="text-base sm:text-lg font-heading font-bold mb-4"
                style={{ color: "#0f4656" }}
              >
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  className="w-full gap-2 text-white h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-orange-200"
                  style={{ backgroundColor: "#ef864c" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d9723f")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef864c")
                  }
                  onClick={() =>
                    router.push("/ecommerce/seller/products/create")
                  }
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-2 h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold transition-all"
                  style={{ color: "#ef864c", borderColor: "#ef864c" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef864c10";
                    e.currentTarget.style.borderColor = "#d9723f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.borderColor = "#ef864c";
                  }}
                  onClick={() => router.push("/ecommerce/seller/stores/create")}
                >
                  <Store className="w-4 h-4" />
                  Create Store
                </Button>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-base sm:text-lg font-heading font-bold flex items-center gap-2"
                  style={{ color: "#0f4656" }}
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  Messages
                </h3>
                <button
                  className="text-xs sm:text-sm font-black hover:underline underline-offset-4"
                  style={{ color: "#ef864c" }}
                  onClick={() => router.push("/ecommerce/seller/messages")}
                >
                  View All
                </button>
              </div>
              {isConversationsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    className="w-6 h-6 animate-spin"
                    style={{ color: "#ef864c" }}
                  />
                </div>
              ) : recentMessages.length > 0 ? (
                <div className="space-y-2">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="group p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/ecommerce/seller/messages/${msg.conversationId}`,
                        )
                      }
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-xs sm:text-sm text-slate-800">
                          {msg.buyerName}
                        </p>
                        <span className="text-[9px] sm:text-xs text-slate-400 whitespace-nowrap">
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1 line-clamp-1   font-medium">
                        &quot;{msg.message}&quot;
                      </p>
                      <p className="text-[9px] sm:text-xs font-bold mt-2 inline-block px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">
                        {msg.product}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs sm:text-sm font-medium">
                  No messages yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl sm:text-2xl font-heading font-bold flex items-center gap-2"
              style={{ color: "#0f4656" }}
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              AI Suggestions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {dynamicSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={cn(
                  "group rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:shadow-lg",
                  suggestion.priority === "high"
                    ? "bg-orange-50/50 border-orange-100"
                    : "bg-white border-slate-100 hover:border-slate-200",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl sm:text-3xl bg-white p-2 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm sm:text-lg text-slate-800 truncate">
                        {suggestion.title}
                      </h4>
                      {suggestion.priority === "high" && (
                        <span className="text-[9px] sm:text-xs px-2 py-0.5 rounded-full bg-orange-600 text-white font-black uppercase tracking-wider">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {suggestion.description}
                    </p>
                    <button
                      onClick={() => handleAction(suggestion.actionUrl)}
                      className="mt-4 text-xs sm:text-sm font-black flex items-center gap-1 hover:gap-2 transition-all underline-offset-4 hover:underline"
                      style={{ color: "#ef864c" }}
                    >
                      {suggestion.actionLabel || "Take Action"}
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
