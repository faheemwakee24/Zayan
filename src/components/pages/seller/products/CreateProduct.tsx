"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Loader2, Sparkles } from "lucide-react";
import { useGetStoresQuery } from "@/services/redux/api/storeApi";
import { useGetCategoriesQuery } from "@/services/redux/api/categoryApi";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
  useGetProductsQuery,
} from "@/services/redux/api/productApi";
import {
  useGenerateProductDescriptionMutation,
  useSuggestPricingMutation,
  useCheckAiAvailabilityQuery,
} from "@/services/redux/api/aiApi";
import { useGetMySubscriptionQuery } from "@/services/redux/api/subscriptionApi";
import Link from "next/link";
import { AiPromptModal } from "@/components/ai/AiPromptModal";
import { AiPricingModal } from "@/components/ai/AiPricingModal";
import { toast } from "sonner";

export default function CreateProduct() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeIdFromQuery = searchParams ? searchParams.get("store") : "";
  const categoryIdFromQuery = searchParams ? searchParams.get("category") : "";

  const [formData, setFormData] = useState({
    store: storeIdFromQuery || "",
    category: categoryIdFromQuery || "",
    name: "",
    description: "",
    price: "",
    currency: "USD",
    unit: "piece",
    stock: "",
    images: [] as string[],
  });

  const [error, setError] = useState("");

  // Fetch stores
  const { data: storesData } = useGetStoresQuery();
  const stores = storesData?.stores || [];

  // Fetch categories for selected store
  const { data: categoriesData } = useGetCategoriesQuery(
    formData.store ? { store: formData.store } : undefined,
    { skip: !formData.store },
  );
  const categories = categoriesData?.categories || [];

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingResult, setPricingResult] = useState<{
    price: number | null;
    explanation: string;
  }>({ price: null, explanation: "" });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  // Subscription: ecommerce limit is by product count (backend enforces)
  const { data: subData } = useGetMySubscriptionQuery("ecommerceSeller");
  const { data: allProductsData } = useGetProductsQuery(undefined);
  // Must match backend Product.countDocuments({ owner }) — use API count when no filter (full owner scope)
  const totalProductCount = allProductsData?.count ?? allProductsData?.products?.length ?? 0;
  const subscription = subData?.subscription;
  const maxProducts = subscription?.planId?.features?.maxListings ?? 1;
  const isProductLimitReached = maxProducts > 0 && totalProductCount >= maxProducts;
  const isFreeTier = !subscription || subscription?.planId?.name === "Basic";

  // AI hooks
  const { data: aiAvailability } = useCheckAiAvailabilityQuery();
  const [generateDescription, { isLoading: isGeneratingDesc }] =
    useGenerateProductDescriptionMutation();
  const [suggestPricing, { isLoading: isSuggestingPrice }] =
    useSuggestPricingMutation();
  const isAiAvailable = aiAvailability?.available ?? false;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Reset category when store changes
      if (name === "store" && value !== prev.store) {
        return {
          ...prev,
          [name]: value,
          category: "",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadProductImage(file).unwrap();
      if (result.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, result.url],
        }));
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateDescription = async (customPrompt: string = "") => {
    if (!formData.name) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      const selectedCategory = categories.find(
        (c) => c._id === formData.category,
      );
      const result = await generateDescription({
        name: formData.name,
        category: selectedCategory?.name || "",
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        unit: formData.unit,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        customPrompt,
      }).unwrap();

      if (result.description && result.available) {
        setFormData((prev) => ({
          ...prev,
          description: result.description || "",
        }));
        toast.success("Description generated successfully!");
      } else {
        toast.error(result.message || "Failed to generate description");
      }
    } catch (err) {
      const errorMessage =
        (err as any)?.data?.message ||
        (err as any)?.message ||
        "Failed to generate description";
      toast.error(errorMessage);
    }
  };

  const handleSuggestPricing = async () => {
    if (!formData.name) {
      toast.error("Please enter a product name first");
      return;
    }

    try {
      const selectedCategory = categories.find(
        (c) => c._id === formData.category,
      );
      const result = await suggestPricing({
        itemType: "product",
        name: formData.name,
        category: selectedCategory?.name || "",
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        unit: formData.unit,
      }).unwrap();

      if (result.suggestedPrice && result.available) {
        setFormData((prev) => ({
          ...prev,
          price: result.suggestedPrice?.toString() || prev.price,
        }));
        setPricingResult({
          price: result.suggestedPrice,
          explanation: result.explanation || "",
        });
        setIsPricingModalOpen(true);
      } else {
        toast.error(result.message || "Failed to suggest pricing");
      }
    } catch (err) {
      const errorMessage =
        (err as any)?.data?.message ||
        (err as any)?.message ||
        "Failed to suggest pricing";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isProductLimitReached) {
      setError("Product limit reached. Please upgrade your plan to add more products.");
      return;
    }
    if (
      !formData.store ||
      !formData.category ||
      !formData.name ||
      !formData.price
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await createProduct({
        store: formData.store,
        category: formData.category,
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        currency: formData.currency,
        unit: formData.unit,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        images: formData.images,
      }).unwrap();

      router.back();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      setError(errorMessage || "Failed to create product. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
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
            Add New Product
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Product limit (backend enforces; UX only here) */}
            {isProductLimitReached && (
              <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-amber-800 mb-1">
                    {isFreeTier ? "Free limit reached" : "Product limit reached"}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {isFreeTier
                      ? "You've reached your free product limit. Upgrade to grow your catalog."
                      : `You have used ${totalProductCount} of ${maxProducts} product slots. Upgrade your plan to add more products.`}
                  </p>
                </div>
                <Link href="/ecommerce/seller/subscription">
                  <Button
                    type="button"
                    className="text-white whitespace-nowrap px-6"
                    style={{ backgroundColor: "#ef864c" }}
                  >
                    Upgrade plan
                  </Button>
                </Link>
              </div>
            )}

            {/* Store Check */}
            {storesData && stores.length === 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-sm shadow-orange-100">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-orange-800 mb-1">
                    Store Required
                  </h3>
                  <p className="text-orange-600 text-sm">
                    You need to create a store before you can add products.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push("/ecommerce/seller/stores/create")}
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

            {/* Category Check */}
            {formData.store && categoriesData && categories.length === 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-sm shadow-orange-100">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-orange-800 mb-1">
                    Category Required
                  </h3>
                  <p className="text-orange-600 text-sm">
                    This store has no categories. You need to create a category
                    first.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/ecommerce/seller/categories/create?store=${formData.store}`,
                    )
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
                  Create Category Now
                </Button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Store & Category Selection */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Store & Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Store <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="store"
                    value={formData.store}
                    onChange={handleChange}
                    required
                    disabled={!!storeIdFromQuery}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={
                      !formData.store ||
                      categories.length === 0 ||
                      !!categoryIdFromQuery
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  >
                    <option value="">
                      {!formData.store
                        ? "Select a store first"
                        : categories.length === 0
                          ? "No categories available"
                          : "Select a category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Product Images
              </h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={formData.images.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-4 py-2 border-2 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: "#ef864c", borderColor: "#ef864c" }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains("disabled")) {
                        e.currentTarget.style.backgroundColor = "#ef864c20";
                        e.currentTarget.style.color = "#d9723f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains("disabled")) {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "#ef864c";
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Upload Image
                  </label>
                  <p className="text-xs text-foreground/60 mt-2">
                    Add up to 5 images
                  </p>
                </div>

                {/* Image Gallery */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-24 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "#0f4656" }}
                      >
                        {img && img.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="text-2xl"
                            style={{ color: "#ffffff" }}
                          >
                            {img || "📦"}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-2xl border border-border p-8">
              <h2
                className="text-xl font-heading font-bold mb-6"
                style={{ color: "#0f4656" }}
              >
                Product Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                    maxLength={200}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className="block text-base font-medium"
                      style={{ color: "#0f4656" }}
                    >
                      Description
                    </label>
                    {isAiAvailable && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAiModalOpen(true)}
                        disabled={isGeneratingDesc || !formData.name}
                        className="gap-2 bg-gradient-to-r from-[#ef864c] to-[#0f4656] text-white border-0 hover:scale-105 active:scale-95 transition-all font-bold h-8 text-[11px] px-4 rounded-full shadow-lg shadow-primary/10"
                      >
                        {isGeneratingDesc ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        AI Enhance
                      </Button>
                    )}
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your product in detail..."
                    rows={5}
                    maxLength={3000}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className="block text-base font-medium"
                        style={{ color: "#0f4656" }}
                      >
                        Price <span className="text-red-500">*</span>
                      </label>
                      {isAiAvailable && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSuggestPricing}
                          disabled={isSuggestingPrice || !formData.name}
                          className="gap-2 bg-gradient-to-r from-[#ef864c] to-[#0f4656] text-white border-0 hover:scale-105 active:scale-95 transition-all font-bold h-8 text-[11px] px-4 rounded-full shadow-lg shadow-primary/10"
                        >
                          {isSuggestingPrice ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          AI Suggest Price
                        </Button>
                      )}
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
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
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white transition-all"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                      onBlur={(e) => (e.target.style.borderColor = "")}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="PKR">PKR (₨)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-base font-medium mb-2"
                      style={{ color: "#0f4656" }}
                    >
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white transition-all"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                      onBlur={(e) => (e.target.style.borderColor = "")}
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="liter">Liter (L)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="meter">Meter (m)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="box">Box</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-base font-medium mb-2"
                      style={{ color: "#0f4656" }}
                    >
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                      onBlur={(e) => (e.target.style.borderColor = "")}
                    />
                  </div>
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
                disabled={isCreating || isProductLimitReached}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
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
                onClick={() => router.push("/ecommerce/seller/products")}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>

      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateDescription}
        title={formData.name}
        isLoading={isGeneratingDesc}
      />

      <AiPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        suggestedPrice={pricingResult.price}
        explanation={pricingResult.explanation}
        title={formData.name}
      />
    </div>
  );
}
