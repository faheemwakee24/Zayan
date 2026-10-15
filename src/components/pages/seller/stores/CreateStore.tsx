"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import {
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useGetStoreByIdQuery,
  useUploadStoreBannerImageMutation,
} from "@/services/redux/api/storeApi";

export default function CreateStore() {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.id as string | undefined;
  const isEditMode = Boolean(storeId);

  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [uploadBannerImage, { isLoading: isUploadingBanner }] =
    useUploadStoreBannerImageMutation();

  const {
    data: storeData,
    isLoading: isLoadingStore,
    error: storeError,
  } = useGetStoreByIdQuery(storeId || "", {
    skip: !isEditMode,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    bannerImage: "",
  });
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError(null);
    setBannerPreview(URL.createObjectURL(file));

    try {
      const result = await uploadBannerImage(file).unwrap();
      if (!result?.url) {
        throw new Error("Upload response missing image URL");
      }
      setFormData((prev) => ({
        ...prev,
        bannerImage: result.url,
      }));
    } catch (err: unknown) {
      console.error("Banner upload error:", err);
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      setError(
        errorMessage || "Failed to upload banner image. Please try again.",
      );
      setBannerPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Populate form when store data is loaded (edit mode)
  useEffect(() => {
    if (storeData?.store && isEditMode) {
      const store = storeData.store;
      setFormData({
        name: store.name || "",
        description: store.description || "",
        location: store.location || "",
        bannerImage: store.bannerImage || "",
      });
      // If bannerImage is a URL, set it as preview
      if (store.bannerImage && store.bannerImage.startsWith("http")) {
        setBannerPreview(store.bannerImage);
      }
    }
  }, [storeData, isEditMode]);

  const handleRemoveBanner = () => {
    if (bannerPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    setFormData((prev) => ({
      ...prev,
      bannerImage: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.description || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (isEditMode && storeId) {
        // Update existing store
        await updateStore({
          id: storeId,
          payload: {
            name: formData.name,
            description: formData.description,
            location: formData.location,
            bannerImage: formData.bannerImage || undefined,
          },
        }).unwrap();
      } else {
        // Create new store
        await createStore({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          bannerImage: formData.bannerImage || undefined,
        }).unwrap();
      }
      // Clean up preview URL if it exists
      if (bannerPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
      router.push("/ecommerce/seller/stores");
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      setError(
        errorMessage ||
          `Failed to ${isEditMode ? "update" : "create"} store. Please try again.`,
      );
    }
  };

  // Show loading state while fetching store data in edit mode
  if (isEditMode && isLoadingStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
      </div>
    );
  }

  // Show error state if store not found in edit mode
  if (isEditMode && storeError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load store</p>
          <Button 
            className="text-white"
            style={{ backgroundColor: '#ef864c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            onClick={() => router.push("/ecommerce/seller/stores")}
          >
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl  px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start flex-col gap-4 mb-8">
          <button
            onClick={() => router.push("/ecommerce/seller/stores")}
            className="inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-80"
            style={{ color: '#ef864c' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
            {isEditMode ? "Edit Store" : "Create New Store"}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {/* Banner */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2 className="text-xl font-heading font-bold mb-6" style={{ color: '#0f4656' }}>
                Store Banner
              </h2>
              <div className="flex items-center gap-8">
                <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-4xl overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
                  {bannerPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={isUploadingBanner}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : formData.bannerImage && formData.bannerImage.startsWith("http") ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.bannerImage}
                        alt="Store banner"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={isUploadingBanner}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#ffffff' }}>{formData.bannerImage || "🏪"}</span>
                  )}
                  {isUploadingBanner && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={isUploadingBanner}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 mb-2 border-2 font-semibold"
                    style={{ color: '#ef864c', borderColor: '#ef864c' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef864c20'
                      e.currentTarget.style.color = '#d9723f'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = '#ef864c'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingBanner}
                  >
                    {isUploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Banner Image
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-foreground/60">
                    JPG, PNG or GIF. Max size 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2 className="text-xl font-heading font-bold mb-6" style={{ color: '#0f4656' }}>
                Store Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-medium mb-2" style={{ color: '#0f4656' }}>
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter store name"
                    maxLength={100}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#ef864c'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium mb-2" style={{ color: '#0f4656' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your store..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all"
                    style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#ef864c'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-base font-medium mb-2" style={{ color: '#0f4656' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    maxLength={200}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': '#ef864c' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#ef864c'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  />
                </div>
              </div>
            </div>

            {/* Store Policies */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2 className="text-xl font-heading font-bold mb-6" style={{ color: '#0f4656' }}>
                Store Policies
              </h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-border cursor-pointer mt-1"
                    style={{ accentColor: '#ef864c' }}
                  />
                  <span className="text-sm text-foreground/80">
                    I accept the seller&apos;s terms and conditions
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-border cursor-pointer mt-1"
                    style={{ accentColor: '#ef864c' }}
                  />
                  <span className="text-sm text-foreground/80">
                    I agree to maintain quality standards
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="px-8 text-white"
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
                disabled={isLoading || isUploadingBanner}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Store" : "Create Store"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-2 font-semibold"
                style={{ color: '#ef864c', borderColor: '#ef864c' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#ef864c20'
                    e.currentTarget.style.color = '#d9723f'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = ''
                    e.currentTarget.style.color = '#ef864c'
                  }
                }}
                onClick={() => router.push("/ecommerce/seller/stores")}
                disabled={isLoading || isUploadingBanner}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
