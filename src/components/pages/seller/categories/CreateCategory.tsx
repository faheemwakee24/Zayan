"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ChevronDown, Upload, X } from "lucide-react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoryByIdQuery,
  useUploadCategoryIconMutation,
} from "@/services/redux/api/categoryApi";
import { useGetStoresQuery } from "@/services/redux/api/storeApi";
import { useParams } from "next/navigation";

export default function CreateCategory() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params?.id as string | undefined;
  const storeIdFromQuery = searchParams?.get("store");
  const isEditMode = Boolean(categoryId);

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [uploadCategoryIcon, { isLoading: isUploadingIcon }] =
    useUploadCategoryIconMutation();
  const { data: storesData } = useGetStoresQuery();
  const stores = storesData?.stores || [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useGetCategoryByIdQuery(categoryId || "", {
    skip: !isEditMode,
  });

  const [formData, setFormData] = useState({
    store: storeIdFromQuery || "",
    name: "",
    description: "",
    icon: "",
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  // Populate form when category data is loaded (edit mode)
  useEffect(() => {
    if (categoryData?.category && isEditMode) {
      const category = categoryData.category;
      setFormData({
        store:
          typeof category.store === "object"
            ? category.store._id
            : category.store,
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "",
      });
      // If icon is a URL, set it as preview
      if (category.icon && category.icon.startsWith("http")) {
        setIconPreview(category.icon);
      }
    }
  }, [categoryData, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleIconUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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
    setIconPreview(URL.createObjectURL(file));

    try {
      const result = await uploadCategoryIcon(file).unwrap();
      if (!result?.url) {
        throw new Error("Upload response missing image URL");
      }
      setFormData((prev) => ({
        ...prev,
        icon: result.url,
      }));
    } catch (err: unknown) {
      console.error("Icon upload error:", err);
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      setError(
        errorMessage || "Failed to upload icon image. Please try again.",
      );
      setIconPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveIcon = () => {
    if (iconPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconPreview(null);
    setFormData((prev) => ({
      ...prev,
      icon: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.store || !formData.name) {
      setError("Please select a store and provide a category name");
      return;
    }

    try {
      if (isEditMode && categoryId) {
        await updateCategory({
          id: categoryId,
          payload: {
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
          },
        }).unwrap();
      } else {
        await createCategory({
          store: formData.store,
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        }).unwrap();
      }
      // Clean up preview URL if it exists
      if (iconPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreview);
      }
      router.back();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      setError(
        errorMessage ||
          `Failed to ${isEditMode ? "update" : "create"} category. Please try again.`,
      );
    }
  };

  // Show loading state while fetching category data in edit mode
  if (isEditMode && isLoadingCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#ef864c" }}
        />
      </div>
    );
  }

  // Show error state if category not found in edit mode
  if (isEditMode && categoryError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load category</p>
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
            Back to Categories
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
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-80"
            style={{ color: "#ef864c" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1
            className="text-2xl md:text-3xl font-heading font-bold"
            style={{ color: "#0f4656" }}
          >
            {isEditMode ? "Edit Category" : "Create Category"}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {!isLoadingCategory &&
              storesData &&
              stores.length === 0 &&
              !isEditMode && (
                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-sm shadow-orange-100">
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-orange-800 mb-1">
                      Store Required
                    </h3>
                    <p className="text-orange-600 text-sm">
                      You need to create a store before you can add categories.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      router.push("/ecommerce/seller/stores/create")
                    }
                    className="text-white whitespace-nowrap px-6"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#d9723f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ef864c")
                    }
                  >
                    Create Store Now
                  </Button>
                </div>
              )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Store Selection */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Store Selection
              </h2>
              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Select Store <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="store"
                    value={formData.store}
                    onChange={handleChange}
                    disabled={isEditMode || isLoading || !!storeIdFromQuery}
                    className="appearance-none w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                    required
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-foreground/40" />
                </div>
                {isEditMode && (
                  <p className="text-xs text-foreground/60 mt-2">
                    Store cannot be changed after creation
                  </p>
                )}
              </div>
            </div>

            {/* Category Icon */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Category Icon
              </h2>
              <div className="flex items-center gap-8">
                <div
                  className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-4xl overflow-hidden"
                  style={{ backgroundColor: "#0f4656" }}
                >
                  {iconPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={isUploadingIcon}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : formData.icon && formData.icon.startsWith("http") ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.icon}
                        alt="Category icon"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={isUploadingIcon}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#ffffff" }}>
                      {formData.icon || "📦"}
                    </span>
                  )}
                  {isUploadingIcon && (
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
                    onChange={handleIconUpload}
                    className="hidden"
                    disabled={isUploadingIcon}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 mb-2 border-2 font-semibold"
                    style={{ color: "#ef864c", borderColor: "#ef864c" }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#ef864c20";
                        e.currentTarget.style.color = "#d9723f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "#ef864c";
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingIcon}
                  >
                    {isUploadingIcon ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Icon Image
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-foreground/60">
                    JPG, PNG or GIF. Max size 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Category Information */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Category Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Electronics, Accessories"
                    maxLength={100}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>

                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what products belong to this category..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="px-8 text-white"
                style={{ backgroundColor: "#ef864c" }}
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
                disabled={isLoading || isUploadingIcon}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-2 font-semibold"
                style={{ color: "#ef864c", borderColor: "#ef864c" }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = "#ef864c20";
                    e.currentTarget.style.color = "#d9723f";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "#ef864c";
                  }
                }}
                onClick={() => router.push("/ecommerce/seller/categories")}
                disabled={isLoading || isUploadingIcon}
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
