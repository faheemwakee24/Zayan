"use client";

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
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import {
  useGetStoresQuery,
  useDeleteStoreMutation,
} from "@/services/redux/api/storeApi";
import { useState } from "react";

export default function StoresList() {
  const router = useRouter();
  const { data, isLoading, error } = useGetStoresQuery();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const stores = data?.stores || [];

  const handleDeleteClick = (id: string, name: string) => {
    setStoreToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;

    try {
      setDeletingId(storeToDelete.id);
      await deleteStore(storeToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    } catch (err) {
      console.error("Failed to delete store:", err);
      // Error will be handled by the mutation
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStoreToDelete(null);
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load stores</p>
          <Button
            className="text-white"
            style={{ backgroundColor: "#ef864c" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d9723f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef864c")
            }
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header — ecommerce upgrade messaging focuses on product limits, not store count */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-heading font-bold"
              style={{ color: "#0f4656" }}
            >
              Stores
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage all your stores in one place
            </p>
          </div>
          <Button
            className="gap-2 text-white"
            style={{ backgroundColor: "#ef864c" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d9723f";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef864c";
            }}
            onClick={() => router.push("/ecommerce/seller/stores/create")}
          >
            <Plus className="w-4 h-4" />
            Create Store
          </Button>
        </div>

        {/* Stores Grid */}
        {stores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60 mb-4">No stores found</p>
            <Button
              className="text-white"
              style={{ backgroundColor: "#ef864c" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d9723f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ef864c")
              }
              onClick={() => router.push("/ecommerce/seller/stores/create")}
            >
              Create Your First Store
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <div
                key={store._id}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Banner with Stats */}
                <div className="relative h-32 bg-[#0f4656] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform overflow-hidden">
                  {store.bannerImage && store.bannerImage.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.bannerImage}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span style={{ color: "#ffffff" }}>
                      {store.bannerImage || "🏪"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-lg font-heading font-bold mb-1"
                    style={{ color: "#0f4656" }}
                  >
                    {store.name}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-4">
                    📍 {store.location}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 border-2 font-semibold"
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
                        router.push(`/ecommerce/seller/stores/${store._id}`)
                      }
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 border-2 font-semibold"
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
                        router.push(
                          `/ecommerce/seller/stores/${store._id}/edit`,
                        )
                      }
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 border-2 font-semibold"
                      style={{ color: "#ef864c", borderColor: "#ef864c" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef864c20";
                        e.currentTarget.style.color = "#d9723f";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "#ef864c";
                      }}
                      onClick={() => handleDeleteClick(store._id, store.name)}
                      disabled={deletingId === store._id || isDeleting}
                    >
                      {deletingId === store._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Store</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the store &quot;
                {storeToDelete?.name}&quot;? This action cannot be undone and
                will permanently delete the store and all associated data
                including categories and products.
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
