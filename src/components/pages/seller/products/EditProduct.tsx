"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Loader2, Sparkles } from "lucide-react";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/services/redux/api/productApi";
import { useGetStoresQuery } from "@/services/redux/api/storeApi";
import { useGetCategoriesQuery } from "@/services/redux/api/categoryApi";
import {
  useGenerateProductDescriptionMutation,
  useSuggestPricingMutation,
  useCheckAiAvailabilityQuery,
} from "@/services/redux/api/aiApi";
import { AiPromptModal } from "@/components/ai/AiPromptModal";
import { AiPricingModal } from "@/components/ai/AiPricingModal";
import { toast } from "sonner";

export default function EditProduct() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useGetProductByIdQuery(id || "", {
    skip: !id,
  });

  const product = productData?.product;

  const [formData, setFormData] = useState({
    store: "",
    category: "",
    name: "",
    description: "",
    price: "",
    currency: "USD",
    unit: "piece",
    stock: "",
    images: [] as string[],
    status: "active" as "active" | "inactive" | "out_of_stock",
  });

  const [error, setError] = useState("");

  // Fetch stores
  const { data: storesData } = useGetStoresQuery();
  const stores = storesData?.stores || [];

  // Fetch categories for the product's store
  const { data: categoriesData } = useGetCategoriesQuery(
    formData.store ? { store: formData.store } : undefined,
    { skip: !formData.store },
  );
  const categories = categoriesData?.categories || [];

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  // AI hooks
  const { data: aiAvailability } = useCheckAiAvailabilityQuery();
  const [generateDescription, { isLoading: isGeneratingDesc }] =
    useGenerateProductDescriptionMutation();
  const [suggestPricing, { isLoading: isSuggestingPrice }] =
    useSuggestPricingMutation();
  const isAiAvailable = aiAvailability?.available ?? false;

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingResult, setPricingResult] = useState<{
    price: number | null;
    explanation: string;
  }>({ price: null, explanation: "" });
  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        store:
          typeof product.store === "object" ? product.store._id : product.store,
        category:
          typeof product.category === "object"
            ? product.category._id
            : product.category,
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        currency: product.currency || "USD",
        unit: product.unit || "piece",
        stock: product.stock?.toString() || "",
        images: product.images || [],
        status: product.status || "active",
      });
    }
  }, [product]);

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
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Failed to generate description";
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
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "Failed to suggest pricing";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.store ||
      !formData.category ||
      !formData.name ||
      !formData.price
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!id) return;

    try {
      await updateProduct({
        id,
        payload: {
          store: formData.store,
          category: formData.category,
          name: formData.name,
          description: formData.description || "",
          price: parseFloat(formData.price),
          currency: formData.currency,
          unit: formData.unit,
          stock: formData.stock ? parseInt(formData.stock) : 0,
          images: formData.images,
          status: formData.status,
        },
      }).unwrap();

      router.push(`/ecommerce/seller/products/${id}`);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "data" in err
          ? (err.data as { message?: string })?.message
          : undefined;
      setError(errorMessage || "Failed to update product. Please try again.");
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#ef864c" }}
        />
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
            style={{ backgroundColor: "#ef864c" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d9723f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef864c")
            }
            onClick={() => router.push("/ecommerce/seller/products")}
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl  px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start flex-col gap-4 mb-8">
          <button
            onClick={() => router.push(`/ecommerce/seller/products/${id}`)}
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
            Edit Product
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                    disabled={true}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-gray-100 cursor-not-allowed transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
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
                    disabled={!formData.store || categories.length === 0}
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

                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 bg-white transition-all"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#ef864c")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
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
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
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
                onClick={() => router.push(`/ecommerce/seller/products/${id}`)}
                disabled={isUpdating}
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
