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
import { Plus, Edit, Eye, Loader2, Trash2, Package } from "lucide-react";
import { useGetStoresQuery } from "@/services/redux/api/storeApi";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/services/redux/api/categoryApi";

export default function CategoriesList() {
  const router = useRouter();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Fetch stores
  const { data: storesData, isLoading: isLoadingStores } = useGetStoresQuery();
  const stores = useMemo(() => storesData?.stores || [], [storesData?.stores]);

  // Compute the effective selected store ID (use first store if none selected and stores are available)
  const effectiveStoreId = useMemo(() => {
    if (selectedStoreId) return selectedStoreId;
    if (stores.length > 0) return stores[0]._id;
    return null;
  }, [selectedStoreId, stores]);

  // Fetch categories for selected store
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetCategoriesQuery(
    effectiveStoreId ? { store: effectiveStoreId } : undefined,
    { skip: !effectiveStoreId }
  );

  const storeCategories = categoriesData?.categories || [];

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingId(categoryToDelete.id);
      await deleteCategory(categoryToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
      // Error will be handled by the mutation, but we can show a toast here if needed
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
              Categories
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage your product categories
            </p>
          </div>
          <Button
            className="gap-2 text-white"
            style={{ backgroundColor: '#ef864c' }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#d9723f'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#ef864c'
              }
            }}
            onClick={() => {
              if (effectiveStoreId) {
                router.push(`/ecommerce/seller/categories/create?store=${effectiveStoreId}`);
              } else {
                router.push("/ecommerce/seller/categories/create");
              }
            }}
            disabled={!effectiveStoreId && stores.length > 0}
          >
            <Plus className="w-4 h-4" />
            Create Category
          </Button>
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

        {/* Categories Grid */}
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
          </div>
        ) : categoriesError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load categories</p>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storeCategories.length > 0 ? (
              storeCategories.map((category) => {
                const createdDate = category.createdAt
                  ? new Date(category.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A";

                return (
                  <div
                    key={category._id}
                    className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Icon Area */}
                    <div className="h-28 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform overflow-hidden relative" style={{ backgroundColor: '#0f4656' }}>
                      {category.icon && category.icon.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span style={{ color: '#ffffff' }}>{category.icon || "📦"}</span>
                      )}
                      {/* Products badge */}
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1" style={{ backgroundColor: '#ef864c' }}>
                        <Package className="w-3 h-3" />
                        {category.products || 0}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-heading font-bold mb-2" style={{ color: '#0f4656' }}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-foreground/60 mb-4">
                        Created {createdDate}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 border-2 font-semibold"
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
                            router.push(
                              `/ecommerce/seller/categories/${category._id}`
                            )
                          }
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 border-2 font-semibold"
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
                            router.push(
                              `/ecommerce/seller/categories/${category._id}/edit`
                            )
                          }
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <button
                          className="p-2 border-2 rounded-lg transition-colors text-sm"
                          style={{ borderColor: '#ef864c', color: '#ef864c' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef864c20'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          onClick={() => handleDeleteClick(category._id, category.name)}
                          disabled={deletingId === category._id || isDeleting}
                          title="Delete"
                        >
                          {deletingId === category._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-border">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: '#ef864c20' }}>
                  📦
                </div>
                <p className="text-sm font-medium mb-2" style={{ color: '#0f4656' }}>
                  {effectiveStoreId
                    ? "No categories found for this store"
                    : "No categories found"}
                </p>
                <p className="text-xs text-foreground/60 mb-4">
                  Create your first category to organize products
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
                        `/ecommerce/seller/categories/create?store=${effectiveStoreId}`
                      );
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the category &quot;
                {categoryToDelete?.name}&quot;? This action cannot be undone and
                will permanently delete the category and all associated data.
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
