"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Edit, Package, Loader2 } from "lucide-react";
import { useGetCategoryByIdQuery } from "@/services/redux/api/categoryApi";
import { useGetProductsQuery } from "@/services/redux/api/productApi";
import { useGetMySubscriptionQuery } from "@/services/redux/api/subscriptionApi";

export default function CategoryDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useGetCategoryByIdQuery(id || "", {
    skip: !id,
  });

  const category = categoryData?.category;

  // Get store ID from category
  const storeId = useMemo(() => {
    if (!category) return null;
    return typeof category.store === "object"
      ? category.store._id
      : category.store;
  }, [category]);

  // Fetch products for this category
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery(
    id && storeId ? { category: id, store: storeId } : undefined,
    { skip: !id || !storeId }
  );

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    const allProducts = productsData?.products || [];
    if (!searchQuery.trim()) return allProducts;
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsData?.products, searchQuery]);

  // Subscription: product limit (backend enforces)
  const { data: subData } = useGetMySubscriptionQuery("ecommerceSeller");
  const { data: allProductsForLimit } = useGetProductsQuery(undefined);
  // Must match backend Product.countDocuments({ owner }) for subscription limit
  const totalProductCount = allProductsForLimit?.count ?? allProductsForLimit?.products?.length ?? 0;
  const subscription = subData?.subscription;
  const maxProducts = subscription?.planId?.features?.maxListings ?? 1;
  const isProductLimitReached =
    maxProducts > 0 && totalProductCount >= maxProducts;

  if (isLoadingCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {categoryError ? "Failed to load category" : "Category not found"}
          </p>
          <Button 
            className="text-white"
            style={{ backgroundColor: '#ef864c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            onClick={() => router.push("/ecommerce/seller/categories")}
          >
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => router.push("/ecommerce/seller/categories")}
                className="inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-80 shrink-0"
                style={{ color: '#ef864c' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0" style={{ backgroundColor: '#ef864c20' }}>
                  {category.icon && category.icon.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <span>{category.icon || "📦"}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold mb-1" style={{ color: '#0f4656' }}>
                    {category.name}
                  </h1>
                  <p className="text-foreground/60">
                    {category.description || "No description"}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-2 font-semibold gap-2 shrink-0"
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
                router.push(`/ecommerce/seller/categories/${id}/edit`)
              }
            >
              <Edit className="w-4 h-4" />
              Edit Category
            </Button>
          </div>
        </div>

        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold" style={{ color: '#0f4656' }}>
              Products
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              Total: {category.products || 0} {category.products === 1 ? 'product' : 'products'}
            </p>
          </div>
          <Button
            className="gap-2 text-white"
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
              if (storeId) {
                router.push(
                  `/ecommerce/seller/products/create?store=${storeId}&category=${id}`
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
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
            onFocus={(e) => e.target.style.borderColor = '#ef864c'}
            onBlur={(e) => e.target.style.borderColor = ''}
          />
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
          </div>
        ) : productsError ? (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <p className="text-red-500 mb-4">Failed to load products</p>
            <Button 
              className="text-white"
              style={{ backgroundColor: '#ef864c' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const productImage =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : "📦";

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() =>
                    router.push(`/ecommerce/seller/products/${product._id}`)
                  }
                >
                  <div className="h-40 flex items-center justify-center text-5xl overflow-hidden relative" style={{ backgroundColor: '#0f4656' }}>
                    {productImage && productImage.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span style={{ color: '#ffffff' }}>{productImage}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold mb-3 line-clamp-1" style={{ color: '#0f4656' }}>
                      {product.name}
                    </h4>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Package className="w-4 h-4" style={{ color: '#ef864c' }} />
                        <span>Stock: {product.stock || 0}</span>
                      </div>
                      <p className="text-sm text-foreground/60">
                        Sales: {product.sales || 0}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="font-bold text-lg" style={{ color: '#ef864c' }}>
                        {product?.currency === "USD" 
                          ? `$${product.price}` 
                          : `${product.price} ${product?.currency}`}
                        {product?.unit && ` / ${product?.unit}`}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 border-2 font-semibold"
                        style={{ color: '#ef864c', borderColor: '#ef864c' }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          e.currentTarget.style.backgroundColor = '#ef864c20'
                          e.currentTarget.style.color = '#d9723f'
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          e.currentTarget.style.backgroundColor = ''
                          e.currentTarget.style.color = '#ef864c'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/ecommerce/seller/products/${product._id}/edit`
                          );
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: '#ef864c20' }}>
              📦
            </div>
            <p className="text-sm font-medium mb-2" style={{ color: '#0f4656' }}>
              {searchQuery
                ? "No products match your search"
                : "No products in this category yet"}
            </p>
            <p className="text-xs text-foreground/60 mb-4">
              {searchQuery ? "Try a different search term" : "Start adding products to this category"}
            </p>
            {!searchQuery && storeId && (
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
                  router.push(
                    `/ecommerce/seller/products/create?store=${storeId}&category=${id}`
                  );
                }}
                disabled={isProductLimitReached}
              >
                <Plus className="w-4 h-4" />
                Add Product to This Category
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
