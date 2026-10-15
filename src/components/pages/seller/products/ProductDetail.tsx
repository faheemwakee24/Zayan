"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Loader2,
  Star,
} from "lucide-react";
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useGetProductReviewsQuery,
  type Review,
} from "@/services/redux/api/productApi";
import { DescriptionWithSeeMore } from "@/components/DescriptionWithSeeMore";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useGetProductByIdQuery(id || "", {
    skip: !id,
  });

  const product = productData?.product;
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
  } = useGetProductReviewsQuery(id || "", {
    skip: !id,
  });
  const reviews = reviewsData?.reviews || [];

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      setDeletingId(id);
      await deleteProduct(id).unwrap();
      setDeleteDialogOpen(false);
      router.push("/ecommerce/seller/products");
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const analyticsData = [
    { period: "Week 1", views: 120, clicks: 45, sales: 12 },
    { period: "Week 2", views: 180, clicks: 78, sales: 28 },
    { period: "Week 3", views: 240, clicks: 95, sales: 45 },
    { period: "Week 4", views: 320, clicks: 142, sales: 89 },
  ];

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {productError ? "Failed to load product" : "Product not found"}
          </p>
          <Button 
            className="text-white"
            style={{ backgroundColor: '#ef864c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            onClick={() => router.push("/ecommerce/seller/products")}
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const productImage =
    product.images && product.images.length > 0 ? product.images[0] : "📦";
  const categoryName =
    typeof product.category === "object"
      ? product.category.name
      : "Unknown Category";

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/ecommerce/seller/products")}
              className="inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-80"
              style={{ color: '#ef864c' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
              {product.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-2 font-semibold"
              style={{ color: '#ef864c', borderColor: '#ef864c' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ef864c20'
                e.currentTarget.style.color = '#d9723f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = '#ef864c'
              }}
              onClick={() =>
                router.push(`/ecommerce/seller/products/${id}/edit`)
              }
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-2 font-semibold"
              style={{ color: '#ef864c', borderColor: '#ef864c' }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#ef864c20'
                  e.currentTarget.style.color = '#d9723f'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = '#ef864c'
              }}
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
              {/* Image */}
              <div className="h-40 rounded-xl flex items-center justify-center text-6xl overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
                {productImage && productImage.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span style={{ color: '#ffffff' }}>{productImage}</span>
                )}
              </div>

              {/* Image Gallery */}
              {product.images && product.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: '#0f4656' }}>
                    Images ({product.images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="h-16 rounded-lg flex items-center justify-center text-2xl overflow-hidden"
                        style={{ backgroundColor: '#0f4656' }}
                      >
                        {img && img.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span style={{ color: '#ffffff' }}>{img || "📦"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 py-6 border-y border-border">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Category</p>
                  <p className="font-medium" style={{ color: '#0f4656' }}>
                    {categoryName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Price</p>
                  <p className="font-bold text-lg" style={{ color: '#ef864c' }}>{product?.currency ==="USD" ? `$${product.price}`:`${product.price} ${product?.currency} / ${product?.unit}`}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Stock</p>
                  <p className="font-medium" style={{ color: '#0f4656' }}>
                    {product.stock || 0} items
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Rating</p>
                  <p className="font-medium" style={{ color: '#ef864c' }}>
                    ⭐ {product.rating || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Status</p>
                  <p className="font-medium text-foreground">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : product.status === "out_of_stock"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.status === "active"
                        ? "Active"
                        : product.status === "out_of_stock"
                        ? "Out of Stock"
                        : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h3 className="text-lg font-heading font-bold mb-4" style={{ color: '#0f4656' }}>
                Description
              </h3>
              <DescriptionWithSeeMore
                description={product.description || "No description available"}
                textClassName="text-foreground/60"
              />
            </div>

            {/* Sales Analytics */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-2" style={{ color: '#0f4656' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#ef864c' }} />
                Product Analytics
              </h3>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-border">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">
                    Total Sales
                  </p>
                  <p className="text-3xl font-bold" style={{ color: '#ef864c' }}>
                    {product.sales || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">
                    Stock Left
                  </p>
                  <p className="text-3xl font-bold" style={{ color: '#0f4656' }}>
                    {product.stock || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Rating</p>
                  <p className="text-3xl font-bold" style={{ color: '#ef864c' }}>
                    {product.rating || 0}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: '#0f4656' }}>
                      Recent Reviews
                    </p>
                    <p className="text-xs text-foreground/60">
                      Showing feedback for this product
                    </p>
                  </div>
                  {isLoadingReviews ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#ef864c' }} />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-xl">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: '#ef864c20' }}>
                        ⭐
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#0f4656' }}>No reviews yet</p>
                      <p className="text-xs text-foreground/60">No reviews yet for this product.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: Review) => (
                        <div
                          key={review._id}
                          className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden" style={{ backgroundColor: '#ef864c20' }}>
                                {review.user.avatar &&
                                (review.user.avatar.startsWith("http") ||
                                  review.user.avatar.startsWith("https") ||
                                  review.user.avatar.startsWith("data:")) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={review.user.avatar}
                                    alt={review.user.name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span style={{ color: '#ef864c' }}>
                                    {review.user.avatar ||
                                      review.user.name.charAt(0) ||
                                      "U"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium" style={{ color: '#0f4656' }}>
                                  {review.user.name}
                                </p>
                                {review.user.email && (
                                  <p className="text-xs text-foreground/60">
                                    {review.user.email}
                                  </p>
                                )}
                                <p className="text-xs text-foreground/60">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-current"
                                      : "text-border"
                                  }`}
                                  style={i < review.rating ? { color: '#ef864c' } : undefined}
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="mt-3 font-medium" style={{ color: '#0f4656' }}>
                              {review.title}
                            </h4>
                          )}
                          {review.comment && (
                            <p className="text-foreground/60 mt-1">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the product &quot;
                {product?.name}&quot;? This action cannot be undone and will
                permanently delete the product and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
