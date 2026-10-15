"use client";

import { useState, useMemo } from "react";
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
import { Plus, Edit, Eye, Search, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { useGetStoresQuery } from "@/services/redux/api/storeApi";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/services/redux/api/productApi";
import { useGetCategoriesQuery } from "@/services/redux/api/categoryApi";
import { useGetMySubscriptionQuery } from "@/services/redux/api/subscriptionApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

export default function ProductsList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch stores
  const { data: storesData, isLoading: isLoadingStores } = useGetStoresQuery();
  const stores = useMemo(() => storesData?.stores || [], [storesData?.stores]);

  // Subscription: ecommerce limit is by PRODUCT count (plan.features.maxListings)
  const { data: subData } = useGetMySubscriptionQuery("ecommerceSeller");
  const { data: allProductsData } = useGetProductsQuery(undefined, {
    skip: false,
  });
  // Must match backend Product.countDocuments({ owner: userId }) — use API count when no store/category filter (full owner scope)
  const totalProductCount = useMemo(
    () => allProductsData?.count ?? allProductsData?.products?.length ?? 0,
    [allProductsData?.count, allProductsData?.products]
  );
  const subscription = subData?.subscription;
  const maxProducts = subscription?.planId?.features?.maxListings ?? 1;
  const isProductLimitReached =
    maxProducts > 0 && totalProductCount >= maxProducts;
  const isFreeTier = !subscription || subscription?.planId?.name === "Basic";

  // Track selected store ID
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Compute the effective selected store ID (use first store if none selected and stores are available)
  const effectiveStoreId = useMemo(() => {
    if (selectedStoreId) return selectedStoreId;
    if (stores.length > 0) return stores[0]._id;
    return null;
  }, [selectedStoreId, stores]);

  // Fetch products for selected store
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery(
    effectiveStoreId ? { store: effectiveStoreId } : undefined,
    { skip: !effectiveStoreId }
  );

  // Fetch categories for the selected store to populate filter
  const { data: categoriesData } = useGetCategoriesQuery(
    effectiveStoreId ? { store: effectiveStoreId } : undefined,
    { skip: !effectiveStoreId }
  );

  const allProducts = useMemo(
    () => productsData?.products || [],
    [productsData?.products]
  );

  const storeCategories = useMemo(
    () => categoriesData?.categories || [],
    [categoriesData?.categories]
  );

  // Get unique category names from products
  const categoryNames = useMemo(() => {
    const categoryMap = new Map<string, string>();
    storeCategories.forEach((cat) => {
      categoryMap.set(cat._id, cat.name);
    });
    return categoryMap;
  }, [storeCategories]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => {
        const categoryId =
          typeof p.category === "object" ? p.category._id : p.category;
        return categoryId === categoryFilter;
      });
    }

    return filtered;
  }, [allProducts, searchQuery, categoryFilter]);

  // Get unique categories from products for filter dropdown
  const availableCategories = useMemo(() => {
    const categoryIds = new Set<string>();
    allProducts.forEach((p) => {
      const categoryId =
        typeof p.category === "object" ? p.category._id : p.category;
      if (categoryId) categoryIds.add(categoryId);
    });
    return Array.from(categoryIds).map((id) => ({
      id,
      name: categoryNames.get(id) || "Unknown",
    }));
  }, [allProducts, categoryNames]);

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      await deleteProduct(productToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
              Products
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage all your products
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    className="gap-2 text-white"
                    style={{
                      backgroundColor: isProductLimitReached || !effectiveStoreId ? "#9ca3af" : "#ef864c",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#d9723f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#ef864c";
                      }
                    }}
                    onClick={() => {
                      if (isProductLimitReached) return;
                      if (effectiveStoreId) {
                        router.push(`/ecommerce/seller/products/create?store=${effectiveStoreId}`);
                      } else {
                        router.push("/ecommerce/seller/products/create");
                      }
                    }}
                    disabled={isProductLimitReached || !effectiveStoreId}
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </span>
              </TooltipTrigger>
              {isProductLimitReached ? (
                <TooltipContent className="bg-[#0f4656] text-white border-0 rounded-lg p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ef864c]" />
                    <p className="text-sm">
                      {isFreeTier
                        ? "You've reached your free product limit. Upgrade to grow your catalog."
                        : `Upgrade your plan to add more products (${totalProductCount}/${maxProducts} used).`}
                    </p>
                  </div>
                </TooltipContent>
              ) : null}
            </Tooltip>
          </TooltipProvider>
        </div>

       

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#ef864c'}
              onBlur={(e) => e.target.style.borderColor = ''}
            />
          </div>
          <div className="relative min-w-40">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white pr-10 transition-all"
              style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#ef864c'}
              onBlur={(e) => e.target.style.borderColor = ''}
              disabled={!effectiveStoreId || isLoadingProducts}
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-foreground/40" />
          </div>
        </div>
          {/* Store Tabs */}
          {isLoadingStores ? (
            <div className="mb-6 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#ef864c' }} />
            </div>
          ) : stores.length > 0 ? (
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {stores.map((store) => (
                  <button
                    key={store._id}
                    onClick={() => setSelectedStoreId(store._id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      effectiveStoreId === store._id
                        ? "text-white shadow-md"
                        : "text-foreground/70 hover:text-foreground hover:bg-white/50"
                    }`}
                    style={
                      effectiveStoreId === store._id
                        ? { backgroundColor: '#ef864c' }
                        : { backgroundColor: '#f3f4f6' }
                    }
                    onMouseEnter={(e) => {
                      if (effectiveStoreId !== store._id) {
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (effectiveStoreId !== store._id) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6'
                      }
                    }}
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <p className="text-foreground/60 mb-2">No stores found</p>
              <Button
                size="sm"
                variant="outline"
                className="border-2 font-semibold"
                style={{ color: '#ef864c', borderColor: '#ef864c' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef864c20'
                  e.currentTarget.style.color = '#d9723f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.color = '#ef864c'
                }}
                onClick={() => router.push("/ecommerce/seller/stores/create")}
              >
                Create Your First Store
              </Button>
            </div>
          )}

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
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
            <div className="overflow-x-auto table-wrapper">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-border" style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#0f4656' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const productImage =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "📦";
                    const categoryName =
                      typeof product.category === "object"
                        ? product.category.name
                        : categoryNames.get(product.category) || "Unknown";
                    const currency = product.currency || "USD";
                    const currencySymbol = currency === "USD" ? "$" : currency === "PKR" ? "₨" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
                    const unit = product.unit || "piece";
                    const status =
                      product.status === "active"
                        ? "Active"
                        : product.status === "out_of_stock"
                        ? "Out of Stock"
                        : "Inactive";

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-muted transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
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
                            <div>
                              <p className="font-medium" style={{ color: '#0f4656' }}>
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground/60">
                          {categoryName}
                        </td>
                        <td className="px-6 py-4 font-bold" style={{ color: '#ef864c' }}>
                          {currencySymbol}{product.price} {unit !== "piece" && `/ ${unit}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground/60">
                          {product.stock || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground/60">
                          {product.sales || 0}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#ef864c' }}>
                          ⭐ {product.rating || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              status === "Active"
                                ? "bg-green-100 text-green-700"
                                : status === "Out of Stock"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/ecommerce/seller/products/${product._id}`
                                )
                              }
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#ef864c' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef864c20'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/ecommerce/seller/products/${product._id}/edit`
                                )
                              }
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#ef864c' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef864c20'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteClick(product._id, product.name)
                              }
                              disabled={deletingId === product._id || isDeleting}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#ef864c' }}
                              onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.backgroundColor = '#ef864c20'
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                              title="Delete"
                            >
                              {deletingId === product._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: '#ef864c20' }}>
                📦
              </div>
              <p className="text-sm font-medium mb-2" style={{ color: '#0f4656' }}>
                {effectiveStoreId
                  ? "No products found for this store"
                  : "No products found"}
              </p>
              <p className="text-xs text-foreground/60 mb-4">
                {searchQuery || categoryFilter !== 'all' 
                  ? "Try adjusting your filters"
                  : "Start adding products to your store"}
              </p>
              {effectiveStoreId && (
                <Button
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: '#ef864c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                  onClick={() => {
                    router.push(
                      `/ecommerce/seller/products/create?store=${effectiveStoreId}`
                    );
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product to This Store
                </Button>
              )}
            </div>
          )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the product &quot;
                {productToDelete?.name}&quot;? This action cannot be undone and
                will permanently delete the product and all associated data.
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
    </div>
  );
}
