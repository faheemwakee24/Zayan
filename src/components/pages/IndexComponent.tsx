"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  Check,
  ArrowRight,
  Heart,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useGetAllProductsForBuyerQuery } from "@/services/redux/api/productApi";
import { useGetBuyerStoresQuery } from "@/services/redux/api/storeApi";
import { useGetBlogsQuery } from "@/services/redux/api/blogApi";
import {
  TrendingItems,
  Recommendations,
  RecentlyViewed,
} from "@/components/marketplace";
import type { BuyerStore } from "@/services/redux/api/storeApi";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

export default function IndexComponent() {
  const [scrollY, setScrollY] = useState(0);
  // Initialize auth state as false to match server render, then update on client
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Fetch top products (sorted by rating)
  const { data: productsData, isLoading: isProductsLoading } =
    useGetAllProductsForBuyerQuery({
      sortBy: "rating",
      order: "desc",
    });

  console.log(productsData, "checking products ");
  // Fetch stores for community count and top sellers (sorted by rating)
  const { data: storesData } = useGetBuyerStoresQuery({
    sortBy: "rating",
    order: "desc",
  });

  // Fetch latest blogs - only E-commerce blogs
  const { data: blogsData, isLoading: isBlogsLoading } = useGetBlogsQuery({
    page: 1,
    limit: 3,
    type: "ecommerce", // Filter only E-commerce blogs
  });

  // Get featured product (top rated)
  const featuredProduct = useMemo(() => {
    if (!productsData?.products || productsData.products.length === 0)
      return null;
    return productsData.products[0];
  }, [productsData]);

  // Calculate monthly sales growth (simplified - using product sales data)
  const monthlySalesGrowth = useMemo(() => {
    if (!productsData?.products) return 142; // Default fallback
    const totalSales = productsData.products.reduce(
      (sum, p) => sum + (p.sales || 0),
      0,
    );
    const avgSales = totalSales / Math.max(productsData.products.length, 1);
    // Calculate growth percentage (simplified calculation)
    return Math.min(Math.round(avgSales / 10), 200); // Cap at 200%
  }, [productsData]);

  // Get community stats
  const storeCount = useMemo(() => {
    return storesData?.count || storesData?.stores?.length || 0;
  }, [storesData]);

  const totalUsers = useMemo(() => {
    // Estimate users based on stores (assuming multiple users per store)
    return Math.max(storeCount * 10, 50000); // Minimum 50K
  }, [storeCount]);

  // Get featured products (top 4, excluding the hero product)
  const featuredProducts = useMemo(() => {
    if (!productsData?.products || productsData.products.length === 0)
      return [];
    return productsData.products.slice(1, 5); // Skip first (hero product), take next 4
  }, [productsData]);

  // Get top sellers (top 3)
  const topSellers = useMemo(() => {
    if (!storesData?.stores || storesData.stores.length === 0) return [];
    return storesData.stores.slice(0, 3) as BuyerStore[];
  }, [storesData]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for auth state changes (e.g., login/logout in other tabs)
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("zayanToken");
        setIsAuthenticated(!!token);
      }
    };

    // Check auth state on mount (after hydration)
    checkAuth();

    // Listen for storage changes (cross-tab)
    window.addEventListener("storage", checkAuth);
    // Listen for custom auth state changes (same-tab)
    window.addEventListener("authStateChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authStateChange", checkAuth);
    };
  }, []);

  return (
    <div className="w-full">
      {/* ======================== HERO SECTION ======================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden  py-[20px] bg-[#0f4656]">
        {/* Animated Teal/Orange Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Soft gradient orbs */}
          <div
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-full blur-3xl animate-float"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tl from-[#ef864c]/25 via-[#ef864c]/10 to-transparent rounded-full blur-3xl animate-float-slow"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-float"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />

          {/* Subtle rings */}
          <div className="absolute top-20 right-16 w-32 h-32 border border-white/10 rounded-full animate-rotate-slow" />
          <div
            className="absolute bottom-28 left-16 w-48 h-48 border border-white/10 rounded-full animate-rotate-slow"
            style={{ animationDuration: "30s" }}
          />
        </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-[0px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <div className="inline-block mb-6">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  style={{
                    backgroundColor: "#0f4656",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  🚀 Zayan Multi‑Vendor Marketplace
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight tracking-tight">
                <span className="text-white">Buy. Sell. </span>
                <span className="bg-gradient-to-r from-[#ffffff] via-[#ef864c] to-[#ef864c] bg-clip-text text-transparent">
                  Grow
                </span>
                <br />
                <span className="bg-gradient-to-r from-white via-white to-[#ef864c] bg-clip-text text-transparent">
                  Together
                </span>
              </h1>

              <p className="text-lg mb-8 leading-relaxed max-w-lg text-white/80">
                The ultimate multi-vendor marketplace for Pakistani
                entrepreneurs. Connect with thousands of buyers, showcase your
                products, and grow your business with intelligent analytics and
                real-time communication tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-white text-[#0f4656] hover:bg-white/90 shadow-xl"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push("/ecommerce/seller/dashboard");
                    } else {
                      router.push("/signup");
                    }
                  }}
                >
                  Explore as Seller
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push("/ecommerce/buyer/dashboard");
                    } else {
                      router.push("/signup");
                    }
                  }}
                >
                  Start Shopping
                  <ShoppingBag className="w-4 h-4" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 max-w-sm">
                <div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-xs text-white/70">Active Sellers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100K+</div>
                  <div className="text-xs text-white/70">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs text-white/70">Happy Users</div>
                </div>
              </div>
            </div>

            {/* Right - Floating Cards & 3D Effect */}
            <div className="relative h-96 md:h-[500px] hidden lg:block">
              {/* Main Hero Card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="relative w-80 h-96 rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 p-6 transform transition-transform duration-300 hover:shadow-[0_30px_80px_rgba(79,70,229,0.2)] hover:scale-105"
                  style={{
                    transform: `perspective(1200px) rotateX(${scrollY * 0.02}deg)`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-transparent to-secondary-400/5 rounded-2xl"></div>

                  {/* Featured Product Card */}
                  {isProductsLoading ? (
                    <div className="relative h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      <div className="text-center">
                        <ShoppingBag className="w-16 h-16 text-primary mx-auto mb-2 opacity-60 animate-pulse" />
                        <p className="text-xs text-muted-foreground font-medium">
                          Loading...
                        </p>
                      </div>
                    </div>
                  ) : featuredProduct ? (
                    <>
                      <div className="relative h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden group">
                        {featuredProduct.images &&
                        featuredProduct.images.length > 0 ? (
                          <img
                            src={featuredProduct.images[0]}
                            alt={featuredProduct.name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement?.classList.add(
                                "flex",
                              );
                            }}
                          />
                        ) : null}
                        {(!featuredProduct.images ||
                          featuredProduct.images.length === 0) && (
                          <div className="text-center absolute inset-0 flex items-center justify-center">
                            <ShoppingBag className="w-16 h-16 text-primary mx-auto mb-2 opacity-60" />
                            <p className="text-xs text-muted-foreground font-medium line-clamp-1 px-2 absolute bottom-2 left-0 right-0">
                              {featuredProduct.name}
                            </p>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10">
                          <Heart
                            className={`w-4 h-4 ${featuredProduct.isLiked ? "fill-accent text-accent" : "text-accent"}`}
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <h3 className="font-heading font-bold text-lg mb-1 line-clamp-1">
                          {featuredProduct.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(featuredProduct.rating || 0)
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            (
                            {featuredProduct.views
                              ? Math.floor(featuredProduct.views / 100) / 10 +
                                "K"
                              : "0"}{" "}
                            views)
                          </span>
                        </div>

                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-2xl font-bold text-primary">
                            {featuredProduct.currency || "$"}
                            {featuredProduct.price}
                          </span>
                          {featuredProduct.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {featuredProduct.currency || "$"}
                              {Math.round(featuredProduct.price * 1.3)}
                            </span>
                          )}
                        </div>

                        <Button
                          className="w-full gap-2"
                          onClick={() => {
                            router.push(
                              `/ecommerce/buyer/products/${featuredProduct._id}`,
                            );
                          }}
                        >
                          View Product
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="relative h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      <div className="text-center">
                        <ShoppingBag className="w-16 h-16 text-primary mx-auto mb-2 opacity-60" />
                        <p className="text-xs text-muted-foreground font-medium">
                          No products available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Stats Badges */}
              <div className="absolute top-10 right-0 w-48 bg-white rounded-xl p-4 shadow-lg border border-border animate-float">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monthly Sales
                    </p>
                    <p className="font-bold text-lg text-foreground">
                      +{monthlySalesGrowth}%
                    </p>
                  </div>
                </div>
              </div>

              {/* User Avatar Group Badge */}
              <div className="absolute bottom-10 left-0 bg-white rounded-xl p-4 shadow-lg border border-border animate-float-slow">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Join Our Community
                </p>
                <div className="flex -space-x-2 mb-2">
                  {storesData?.stores?.slice(0, 4).map((store, i) => (
                    <div
                      key={store._id || i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      title={store.name}
                    >
                      {store.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )) ||
                    [0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-white"
                      ></div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalUsers >= 1000
                    ? `${(totalUsers / 1000).toFixed(0)}K+`
                    : totalUsers}{" "}
                  active {storeCount > 0 ? "stores" : "users"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== FEATURED PRODUCTS SECTION ======================== */}
      <section className="py-20 bg-gradient-to-b from-white to-background/50">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover trending products from our top sellers this week
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isProductsLoading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="group bg-white rounded-2xl border border-border overflow-hidden animate-pulse"
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-3 w-2/3"></div>
                    <div className="h-6 bg-muted rounded mb-4 w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => {
                const hasDiscount = product.price && (product.sales || 0) > 0;
                const discountPercent =
                  hasDiscount && product.sales
                    ? Math.round(
                        ((product.sales - product.price) / product.sales) * 100,
                      )
                    : 0;
                const originalPrice = product.price
                  ? Math.round(product.price * 1.3)
                  : 0;

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:border-primary transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      router.push(`/ecommerce/buyer/products/${product._id}`);
                    }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag className="w-20 h-20 text-primary opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <button
                          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle like functionality
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 ${product.isLiked ? "fill-accent text-accent" : "text-accent"}`}
                          />
                        </button>
                      </div>
                      {hasDiscount && discountPercent > 0 && (
                        <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                          -{discountPercent}%
                        </div>
                      )}
                      {product.isFeatured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-accent to-accent/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ring-2 ring-white/50">
                          <Star className="w-3 h-3 fill-white" />
                          Featured
                        </div>
                      )}
                      {/* Adjust discount badge position if featured exists */}
                      {hasDiscount &&
                        discountPercent > 0 &&
                        product.isFeatured && (
                          <div className="absolute top-10 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            -{discountPercent}%
                          </div>
                        )}
                      {/* Original discount badge logic was above, but I'll make them stack nicely */}
                    </div>

                    <div className="p-4">
                      <h3 className="font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3 h-3 ${
                              j < Math.floor(product.rating || 0)
                                ? "fill-accent text-accent"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground">
                          (
                          {product.views
                            ? Math.floor(product.views / 100) / 10 + "K"
                            : "0"}{" "}
                          views)
                        </span>
                      </div>

                      <div className="flex items-end gap-2 mb-4">
                        <span
                          className="text-xl font-bold"
                          style={{ color: "#ef864c" }}
                        >
                          {product.currency || "$"}
                          {product.price}
                        </span>
                        {originalPrice > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.currency || "$"}
                            {originalPrice}
                          </span>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/ecommerce/buyer/products/${product._id}`,
                          );
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                No featured products available
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/ecommerce/buyer/products")}
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ======================== TOP SELLERS SECTION ======================== */}
      <section className="py-20 bg-gradient-to-b from-background via-white to-background">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Top Rated Sellers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the most trusted sellers on our marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topSellers?.length > 0 ? (
              topSellers.map((store, index) => {
                const storeInitial = store.name?.charAt(0).toUpperCase() || "S";
                const rating = store.rating || 0;
                const productCount = store.products || 0;
                const followerCount = store.followers || 0;
                const positiveFeedback = Math.min(
                  95 + Math.round(rating * 2),
                  100,
                );
                const responseTime =
                  rating > 4.5 ? "0.5h" : rating > 4 ? "1h" : "2h";

                return (
                  <div
                    key={store._id}
                    className="bg-white rounded-2xl p-6 border border-border hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    onClick={() => {
                      router.push(`/ecommerce/buyer/stores/${store._id}`);
                    }}
                  >
                    {/* Seller Avatar & Banner */}
                    <div className="relative -mx-6 -mt-6 h-32 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 rounded-t-2xl mb-6 flex items-end justify-center pb-4">
                      {store.bannerImage ? (
                        <img
                          src={store.bannerImage}
                          alt={store.name}
                          className="w-full h-full object-cover rounded-t-2xl"
                        />
                      ) : null}
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary absolute">
                        {store.seller?.avatar ? (
                          <img
                            src={store.seller.avatar}
                            alt={store.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.textContent = storeInitial;
                              }
                            }}
                          />
                        ) : (
                          storeInitial
                        )}
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-foreground text-center mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {store.name}
                    </h3>

                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`w-4 h-4 ${
                            j < Math.floor(rating)
                              ? "fill-accent text-accent"
                              : j < rating
                                ? "fill-accent/50 text-accent"
                                : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium text-foreground ml-2">
                        {rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {productCount} products •{" "}
                      {followerCount >= 1000
                        ? `${(followerCount / 1000).toFixed(1)}K`
                        : followerCount}{" "}
                      followers
                    </p>

                    {/* Seller Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-border">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {positiveFeedback}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Positive Feedback
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">
                          {responseTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Response Time
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2"
                      variant={index === 0 ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/ecommerce/buyer/stores/${store._id}`);
                      }}
                    >
                      Visit Store
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No top sellers available
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/ecommerce/buyer/stores")}
            >
              Browse All Stores
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS SECTION ======================== */}
      <section className="py-20 bg-white">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start buying or selling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            {[
              {
                icon: Users,
                title: "Create Account",
                description:
                  "Sign up as a buyer or seller. Choose your role and set up your profile.",
                step: 1,
              },
              {
                icon: ShoppingBag,
                title: "Browse or Add Products",
                description:
                  "Explore thousands of products or add your own to start selling.",
                step: 2,
              },
              {
                icon: MessageCircle,
                title: "Chat & Transact",
                description:
                  "Connect with buyers or sellers, negotiate, and complete transactions.",
                step: 3,
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent opacity-30"></div>
                )}

                <div className="bg-gradient-to-br from-white to-muted rounded-2xl p-8 border border-border group-hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading font-bold text-lg">
                    {item.step}
                  </div>

                  <div className="mb-6 mt-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-foreground mb-3 text-center">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== SELLER DASHBOARD PREVIEW ======================== */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-white">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Powerful Seller Dashboard
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run your store and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Analytics & Insights",
                features: [
                  "Real-time sales tracking",
                  "Product performance metrics",
                  "Customer analytics",
                ],
              },
              {
                icon: ShoppingBag,
                title: "Product Management",
                features: [
                  "Bulk product upload",
                  "Image galleries",
                  "Inventory tracking",
                ],
              },
              {
                icon: MessageCircle,
                title: "Direct Messaging",
                features: [
                  "Real-time chat with buyers",
                  "Message templates",
                  "Chat history",
                ],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0f4656]/10 via-[#0f4656]/5 to-[#ef864c]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-heading font-bold text-lg text-foreground mb-4 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <ul className="space-y-3">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex gap-2 items-start">
                      <Check className="w-5 h-5 text-[#ef864c] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push("/signup")}
            >
              Start Selling Today
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ======================== USER REVIEWS SECTION ======================== */}
      <section className="py-20 bg-gradient-to-b from-white via-background/40 to-white">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              What Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied buyers and sellers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ali Ahmed",
                role: "Fashion Seller",
                content:
                  "MarketHub has transformed my online selling. The dashboard is intuitive and sales have tripled in 3 months!",
              },
              {
                name: "Fatima Khan",
                role: "Electronics Buyer",
                content:
                  "Great selection of products and the direct messaging feature helps me get quick responses from sellers.",
              },
              {
                name: "Hassan Raza",
                role: "Electronics Seller",
                content:
                  "The analytics tools help me understand what customers want. Highly recommended for any seller!",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white to-muted rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-[#ef864c] text-[#ef864c]"
                    />
                  ))}
                </div>

                <p className="text-foreground mb-6 leading-relaxed">
                  &quot;{review.content}&quot;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c]"></div>
                  <div>
                    <p className="font-heading font-bold text-sm text-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== BLOGS SECTION ======================== */}
      <section className="py-20 bg-gradient-to-b from-background via-white to-background">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Latest Blog Posts
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips and trends for buying and selling online
            </p>
          </div>

          {isBlogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogsData?.blogs && blogsData.blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogsData.blogs.slice(0, 3).map((blog) => {
                const formatDate = (dateString: string | null) => {
                  if (!dateString) return "";
                  const date = new Date(dateString);
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                };

                const calculateReadTime = (excerpt?: string) => {
                  const text = excerpt || "";
                  if (!text) return "1 min read";
                  const words = text.split(/\s+/).length;
                  const minutes = Math.ceil(words / 200) || 1;
                  return `${minutes} min read`;
                };

                return (
                  <Link
                    key={blog._id}
                    href={`/ecommerce/buyer/blogs/${blog.slug}`}
                    className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          📝
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-xs font-bold px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                          {blog.category.replace("E-commerce - ", "")}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {calculateReadTime(blog.excerpt)}
                        </div>
                      </div>

                      <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>

                      <div className="text-primary text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No blog posts available yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================== CTA SECTION ======================== */}
      <section
        className="py-20 text-white relative overflow-hidden"
        style={{ backgroundColor: "#0f4656" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-float-slow" />
        </div>

        <div className="  mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of successful buyers and sellers already using Zayan.
            Whether you want to shop or start your business, we&apos;re here to
            help.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 bg-white hover:bg-white/95 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300"
              style={{ color: "#0f4656" }}
              onClick={() => {
                if (isAuthenticated) {
                  router.push("/ecommerce/seller/dashboard");
                } else {
                  router.push("/signup");
                }
              }}
            >
              Join as Seller
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-2 border-white text-white bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              onClick={() => {
                if (isAuthenticated) {
                  router.push("/ecommerce/buyer/products");
                } else {
                  router.push("/signup");
                }
              }}
            >
              Browse Products
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
