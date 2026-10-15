"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Package,
  Users,
  Eye,
  Star,
  Loader2,
  MapPin,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useGetStoreByIdQuery } from "@/services/redux/api/storeApi";
import { useGetCategoriesQuery } from "@/services/redux/api/categoryApi";
import { useGetProductsQuery } from "@/services/redux/api/productApi";
import { useGetMySubscriptionQuery } from "@/services/redux/api/subscriptionApi";
import {
  useGetSellerReviewsQuery,
  useAddSellerResponseMutation,
} from "@/services/redux/api/reviewApi";
import { ReviewSummaryCard, ReviewItem } from "@/components/reviews";
import { useToast } from "@/hooks/use-toast";

export default function StoreDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data, isLoading, error } = useGetStoreByIdQuery(id || "", {
    skip: !id,
  });

  const store = data?.store;

  // Fetch categories for this store
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery(id ? { store: id } : undefined, { skip: !id });

  const categories = categoriesData?.categories || [];

  // Fetch products for this store (recent products, limit to 6)
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsQuery(id ? { store: id } : undefined, { skip: !id });

  const allProducts = productsData?.products || [];
  const products = allProducts.slice(0, 6); // Show only 6 recent products

  // Subscription: product limit (backend enforces)
  const { data: subData } = useGetMySubscriptionQuery("ecommerceSeller");
  const { data: allProductsForLimit } = useGetProductsQuery(undefined);
  // Must match backend Product.countDocuments({ owner }) for subscription limit
  const totalProductCount = allProductsForLimit?.count ?? allProductsForLimit?.products?.length ?? 0;
  const subscription = subData?.subscription;
  const maxProducts = subscription?.planId?.features?.maxListings ?? 1;
  const isProductLimitReached =
    maxProducts > 0 && totalProductCount >= maxProducts;

  const { toast } = useToast();

  // Fetch reviews using the store owner's ID
  const storeOwnerId =
    typeof store?.owner === "object" ? store.owner._id : store?.owner;
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useGetSellerReviewsQuery(storeOwnerId || "", {
    skip: !storeOwnerId,
  });

  const [addResponse] = useAddSellerResponseMutation();

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
        error && typeof error === "object" && "data" in error
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#ef864c" }}
        />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error ? "Failed to load store" : "Store not found"}
          </p>
          <Button
            className="text-white"
            style={{ backgroundColor: "#ef864c" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d9723f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef864c")
            }
            onClick={() => router.back()}
          >
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/ecommerce/seller/stores")}
          className="inline-flex items-center gap-2 mb-6 font-semibold transition-colors hover:opacity-80"
          style={{ color: "#ef864c" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </button>

        {/* Store Header */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6 shadow-sm">
          <div
            className="h-32 md:h-40 flex items-center justify-center text-5xl overflow-hidden"
            style={{ backgroundColor: "#0f4656" }}
          >
            {store?.bannerImage && store.bannerImage.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.bannerImage}
                alt={store?.name || "Store banner"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span style={{ color: "#ffffff" }}>
                {store?.bannerImage || "🏪"}
              </span>
            )}
          </div>

          {/* Store Info */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1
                  className="text-2xl md:text-3xl font-heading font-bold mb-3"
                  style={{ color: "#0f4656" }}
                >
                  {store?.name}
                </h1>
                <div className="flex items-center gap-2 mb-3 text-foreground/70">
                  <MapPin className="w-4 h-4" style={{ color: "#ef864c" }} />
                  <span className="font-medium">{store?.location}</span>
                </div>
                {store?.description && (
                  <p className="text-foreground/60 text-sm md:text-base max-w-2xl">
                    {store?.description}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="border-2 font-semibold gap-2 shrink-0"
                style={{ color: "#ef864c", borderColor: "#ef864c" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef864c20";
                  e.currentTarget.style.color = "#d9723f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "#ef864c";
                }}
                onClick={() =>
                  router.push(`/ecommerce/seller/stores/${id}/edit`)
                }
              >
                <ExternalLink className="w-4 h-4" />
                Edit Store
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#ef864c20" }}
              >
                <Package className="w-5 h-5" style={{ color: "#ef864c" }} />
              </div>
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium">
                  Products
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#ef864c" }}
                >
                  {store.products || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#0f465620" }}
              >
                <Users className="w-5 h-5" style={{ color: "#0f4656" }} />
              </div>
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium">
                  Followers
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#0f4656" }}
                >
                  {(store.followers || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#ef864c20" }}
              >
                <Star
                  className="w-5 h-5 fill-current"
                  style={{ color: "#ef864c" }}
                />
              </div>
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium">
                  Rating
                </p>
                <p
                  className="text-2xl font-bold mt-1 flex items-center gap-1"
                  style={{ color: "#ef864c" }}
                >
                  {store.rating || 0}
                  <Star className="w-4 h-4 fill-current" />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#0f465620" }}
              >
                <Eye className="w-5 h-5" style={{ color: "#0f4656" }} />
              </div>
              <div>
                <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium">
                  Views
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#0f4656" }}
                >
                  {(store.views || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Categories Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className="text-xl font-heading font-bold mb-1"
                    style={{ color: "#0f4656" }}
                  >
                    Categories
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {categories.length}{" "}
                    {categories.length === 1 ? "category" : "categories"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1 text-white shrink-0"
                  style={{ backgroundColor: "#ef864c" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d9723f")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef864c")
                  }
                  onClick={() => {
                    if (id) {
                      router.push(
                        `/ecommerce/seller/categories/create?store=${id}`,
                      );
                    } else {
                      router.push("/ecommerce/seller/categories/create");
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "#ef864c" }}
                  />
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#ef864c40] hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() =>
                        router.push(
                          `/ecommerce/seller/categories/${category._id}`,
                        )
                      }
                    >
                      <div className="shrink-0">
                        {category.icon && category.icon.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={category.icon}
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: "#ef864c20" }}
                          >
                            {category.icon || "📦"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium truncate transition-colors"
                          style={{ color: "#0f4656" }}
                        >
                          {category.name}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {category.products || 0}{" "}
                          {category.products === 1 ? "product" : "products"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-[#ef864c] transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: "#ef864c20" }}
                  >
                    📦
                  </div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    No categories yet
                  </p>
                  <p className="text-xs text-foreground/60 mb-4">
                    Create your first category to organize products
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-2 font-semibold gap-2"
                    style={{ color: "#ef864c", borderColor: "#ef864c" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef864c20";
                      e.currentTarget.style.color = "#d9723f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "#ef864c";
                    }}
                    onClick={() => {
                      if (id) {
                        router.push(
                          `/ecommerce/seller/categories/create?store=${id}`,
                        );
                      } else {
                        router.push("/ecommerce/seller/categories/create");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Category
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className="text-xl font-heading font-bold mb-1"
                    style={{ color: "#0f4656" }}
                  >
                    Recent Products
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {allProducts.length}{" "}
                    {allProducts.length === 1 ? "product" : "products"} total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {allProducts.length > 6 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-2 font-semibold gap-2"
                      style={{ color: "#ef864c", borderColor: "#ef864c" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef864c20";
                        e.currentTarget.style.color = "#d9723f";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "#ef864c";
                      }}
                      onClick={() =>
                        router.push(`/ecommerce/seller/products?store=${id}`)
                      }
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gap-1 text-white shrink-0"
                    style={{
                      backgroundColor: isProductLimitReached ? "#9ca3af" : "#ef864c",
                    }}
                    onMouseEnter={(e) => {
                      if (!isProductLimitReached)
                        e.currentTarget.style.backgroundColor = "#d9723f";
                    }}
                    onMouseLeave={(e) => {
                      if (!isProductLimitReached)
                        e.currentTarget.style.backgroundColor = "#ef864c";
                    }}
                    onClick={() => {
                      if (isProductLimitReached) return;
                      if (id) {
                        router.push(
                          `/ecommerce/seller/products/create?store=${id}`,
                        );
                      } else {
                        router.push("/ecommerce/seller/products/create");
                      }
                    }}
                    disabled={categories.length === 0 || isProductLimitReached}
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              </div>

              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "#ef864c" }}
                  />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const productImage =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "📦";

                    return (
                      <div
                        key={product._id}
                        className="rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() =>
                          router.push(
                            `/ecommerce/seller/products/${product._id}`,
                          )
                        }
                      >
                        <div
                          className="relative h-40 flex items-center justify-center text-5xl overflow-hidden"
                          style={{ backgroundColor: "#0f4656" }}
                        >
                          {productImage && productImage.startsWith("http") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span style={{ color: "#ffffff" }}>
                              {productImage}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-4">
                          <h4
                            className="font-semibold mb-2 line-clamp-1"
                            style={{ color: "#0f4656" }}
                          >
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p
                              className="font-bold text-lg"
                              style={{ color: "#ef864c" }}
                            >
                              {product?.currency === "USD"
                                ? `$${product.price}`
                                : `${product.price} ${product?.currency}`}
                              {product?.unit && ` / ${product?.unit}`}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-foreground/60">
                              <Eye className="w-3 h-3" />
                              {product.sales || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: "#ef864c20" }}
                  >
                    📦
                  </div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    {categories.length === 0
                      ? "Create a category first to add products"
                      : "No products yet"}
                  </p>
                  <p className="text-xs text-foreground/60 mb-4">
                    {categories.length === 0
                      ? "Categories help organize your products"
                      : "Start adding products to your store"}
                  </p>
                  {categories.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-2 font-semibold gap-2"
                      style={{
                        color: isProductLimitReached ? "#9ca3af" : "#ef864c",
                        borderColor: isProductLimitReached ? "#9ca3af" : "#ef864c",
                      }}
                      onMouseEnter={(e) => {
                        if (!isProductLimitReached) {
                          e.currentTarget.style.backgroundColor = "#ef864c20";
                          e.currentTarget.style.color = "#d9723f";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = isProductLimitReached ? "#9ca3af" : "#ef864c";
                      }}
                      onClick={() => {
                        if (isProductLimitReached) return;
                        if (id) {
                          router.push(
                            `/ecommerce/seller/products/create?store=${id}`,
                          );
                        } else {
                          router.push("/ecommerce/seller/products/create");
                        }
                      }}
                      disabled={isProductLimitReached}
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Seller Reviews Section */}
            <div className="bg-white rounded-xl border border-border p-6 mt-8">
              <h3
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Seller Reviews
              </h3>

              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: "#ef864c" }}
                  />
                </div>
              ) : reviewsData && reviewsData.count > 0 ? (
                <div className="space-y-8">
                  {/* Reviews Summary */}
                  <ReviewSummaryCard reviewsData={reviewsData} />

                  {/* Reviews List */}
                  <div className="space-y-4 pt-8 border-t border-border">
                    <h4 className="font-bold text-[#0f4656]">
                      All Reviews ({reviewsData.count})
                    </h4>
                    <div className="space-y-4">
                      {reviewsData.reviews.map((review) => (
                        <ReviewItem
                          key={review._id}
                          review={review}
                          isCurrentUserSeller={true}
                          onAddResponse={handleAddResponse}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: "#ef864c20" }}
                  >
                    ⭐
                  </div>
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    No reviews yet
                  </p>
                  <p className="text-xs text-foreground/60">
                    Reviews from buyers will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
