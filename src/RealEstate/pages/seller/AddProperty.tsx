"use client";

import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { Input } from "@/RealEstate/components/ui/input";
import { Label } from "@/RealEstate/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/RealEstate/components/ui/select";
import { Textarea } from "@/RealEstate/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Loader2,
  Sparkles,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Tag,
  FileText,
  MapPin,
  Building2,
  Map,
  Home,
  AlignLeft,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  useCreatePropertyMutation,
  useUploadPropertyImageMutation,
  type PropertyPayload,
  useGetPropertyByIdQuery,
  useUpdatePropertyMutation,
} from "@/services/redux/api/propertyApi";
import {
  useGeneratePropertyDescriptionMutation,
  useSuggestPricingMutation,
  useCheckAiAvailabilityQuery,
} from "@/services/redux/api/aiApi";
import { AiPromptModal } from "@/components/ai/AiPromptModal";
import { AiPricingModal } from "@/components/ai/AiPricingModal";
import { toast as sonnerToast } from "sonner";

interface SellerAddPropertyProps {
  propertyId?: string;
}

type UploadedImage = { file?: File; preview: string; remoteUrl?: string };

export default function AddProperty({
  propertyId,
}: SellerAddPropertyProps = {}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    city: "",
    state: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    yearBuilt: "",
    propertyType: "",
    lat: "",
    lng: "",
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState("");

  // Address autocomplete state
  interface AddressSuggestion {
    display_name?: string;
    name?: string;
    lat?: string;
    lon?: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      region?: string;
    };
  }
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const [createProperty, { isLoading: isCreatingProperty }] =
    useCreatePropertyMutation();
  const [uploadPropertyImage] = useUploadPropertyImageMutation();
  const [updateProperty, { isLoading: isUpdatingProperty }] =
    useUpdatePropertyMutation();

  // AI hooks
  const { data: aiAvailability } = useCheckAiAvailabilityQuery();
  const [generateDescription, { isLoading: isGeneratingDesc }] =
    useGeneratePropertyDescriptionMutation();
  const [suggestPricing, { isLoading: isSuggestingPrice }] =
    useSuggestPricingMutation();
  const isAiAvailable = aiAvailability?.available ?? false;

  const isEditMode = Boolean(propertyId);
  const {
    data: propertyDetail,
    isLoading: isPropertyLoading,
    error: propertyError,
  } = useGetPropertyByIdQuery(propertyId ?? "", {
    skip: !isEditMode,
  });
  const propertyData = propertyDetail?.property;
  const propertyErrorMessage = (() => {
    if (!propertyError) return "Failed to load property details.";
    if ("status" in propertyError) {
      const data = propertyError.data as { message?: string } | undefined;
      return data?.message ?? "Failed to load property details.";
    }
    if ("message" in propertyError && propertyError.message) {
      return propertyError.message as string;
    }
    return "Failed to load property details.";
  })();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingResult, setPricingResult] = useState<{
    price: number | null;
    explanation: string;
  }>({ price: null, explanation: "" });
  const isProcessing =
    isSubmitting ||
    isUploadingImages ||
    isCreatingProperty ||
    isUpdatingProperty;

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (!propertyData) return;

    console.log(
      propertyData?.propertyType,
      "propertyTypepropertyTypepropertyType",
    );
    setPropertyType(propertyData?.propertyType ?? "");
    setFormData({
      title: propertyData.title ?? "",
      description: propertyData.description ?? "",
      location: propertyData.location ?? "",
      city: propertyData.city ?? "",
      state: propertyData.state ?? "",
      price: propertyData.price != null ? String(propertyData.price) : "",
      beds: propertyData.beds != null ? String(propertyData.beds) : "",
      baths: propertyData.baths != null ? String(propertyData.baths) : "",
      sqft: propertyData.sqft != null ? String(propertyData.sqft) : "",
      yearBuilt:
        propertyData.yearBuilt != null ? String(propertyData.yearBuilt) : "",
      propertyType: propertyData?.propertyType ?? "",
      lat: (propertyData as any).lat ? String((propertyData as any).lat) : "",
      lng: (propertyData as any).lng ? String((propertyData as any).lng) : "",
    });

    setAmenities(propertyData.amenities ?? []);
    setImageUrls(propertyData.images ?? []);
    setImages(
      (propertyData.images ?? []).map((url) => ({
        preview: url,
        remoteUrl: url,
      })),
    );
  }, [propertyData]);

  // Cleanup blob URLs when images change
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.file && image.preview.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Now we can have conditional returns after all hooks
  if (isEditMode && isPropertyLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "#ef864c" }}
            />
            <p className="text-foreground/60">Loading property details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isEditMode && propertyError) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 space-y-4 max-w-[720px]">
          <Link
            href="/real-estate/seller/properties"
            className="inline-flex items-center gap-2 font-semibold"
            style={{ color: "#ef864c" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-2" style={{ color: "#0f4656" }}>
              Unable to load property
            </h2>
            <p className="text-foreground/70 mb-4">{propertyErrorMessage}</p>
            <Button
              onClick={() => router.push("/real-estate/seller/properties")}
              className="text-white"
              style={{ backgroundColor: "#ef864c" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d9723f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ef864c")
              }
            >
              Go Back
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch address suggestions from Nominatim API
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      );
      const data = await res.json();

      if (data && Array.isArray(data)) {
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced function to fetch suggestions
  const debouncedFetchSuggestions = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(query);
    }, 300); // 300ms delay
  };

  // Handle address input change with autocomplete
  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange(e);
    debouncedFetchSuggestions(value);
  };

  // Geocode function to convert address to coordinates
  const geocode = async (address: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      );
      const data = await res.json();

      if (data && data.length > 0) {
        return {
          address,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    const fullAddress = suggestion.display_name || suggestion.name || "";
    const cityValue =
      suggestion.address?.city ||
      suggestion.address?.town ||
      suggestion.address?.village ||
      "";
    const stateValue =
      suggestion.address?.state || suggestion.address?.region || "";

    // Auto-geocode the selected address
    setIsGeocoding(true);
    try {
      // Use coordinates from suggestion if available, otherwise geocode
      let lat: number | undefined;
      let lng: number | undefined;

      if (suggestion.lat && suggestion.lon) {
        lat = parseFloat(suggestion.lat);
        lng = parseFloat(suggestion.lon);
      } else {
        // Fallback to geocoding if coordinates not in suggestion
        const result = await geocode(fullAddress);
        if (result) {
          lat = result.lat;
          lng = result.lng;
        }
      }

      // Update the location input and coordinates
      setFormData((prev) => ({
        ...prev,
        location: fullAddress,
        city: cityValue || prev.city,
        state: stateValue || prev.state,
        lat: lat ? String(lat) : prev.lat,
        lng: lng ? String(lng) : prev.lng,
      }));

      if (lat && lng) {
        toast({
          title: "Location coordinates saved",
          description: "Address coordinates have been automatically saved.",
        });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      // Still update the address even if geocoding fails
      setFormData((prev) => ({
        ...prev,
        location: fullAddress,
        city: cityValue || prev.city,
        state: stateValue || prev.state,
      }));
    } finally {
      setIsGeocoding(false);
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  // Handle Enter key press
  const handleLocationKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If suggestions are shown and there's a first suggestion, select it
      if (showSuggestions && addressSuggestions.length > 0) {
        await handleSuggestionSelect(addressSuggestions[0]);
        return;
      }

      // Otherwise, geocode the current address
      if (formData.location && formData.location.trim().length > 0) {
        setIsGeocoding(true);
        try {
          const result = await geocode(formData.location);
          if (result) {
            setFormData((prev) => ({
              ...prev,
              lat: String(result.lat),
              lng: String(result.lng),
            }));
            toast({
              title: "Location coordinates saved",
              description: "Address coordinates have been automatically saved.",
            });
            setShowSuggestions(false);
          } else {
            toast({
              title: "Geocoding failed",
              description:
                "Could not find coordinates for this address. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast({
            title: "Geocoding failed",
            description:
              "Could not find coordinates for this address. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGeocoding(false);
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImageToR2 = async (file: File) => {
    const result = await uploadPropertyImage(file).unwrap();
    if (!result?.url) {
      throw new Error("Upload response missing image URL");
    }
    return result.url;
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const mappedFiles: UploadedImage[] = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...mappedFiles]);
    // Allow selecting the same file again
    e.target.value = "";

    setIsUploadingImages(true);
    setErrorMessage(null);

    try {
      for (const fileInfo of mappedFiles) {
        if (!fileInfo.file) {
          continue;
        }
        try {
          const uploadedUrl = await uploadImageToR2(fileInfo.file);
          setImages((prev) =>
            prev.map((image) =>
              image.preview === fileInfo.preview
                ? { ...image, remoteUrl: uploadedUrl }
                : image,
            ),
          );
          setImageUrls((prev) => [...prev, uploadedUrl]);
        } catch (uploadError) {
          console.error(uploadError);
          setErrorMessage(
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload an image",
          );
        }
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    let removedUrl: string | undefined;
    setImages((prev) => {
      const removed = prev[index];
      if (removed) {
        if (removed.file && removed.preview.startsWith("blob:")) {
          URL.revokeObjectURL(removed.preview);
        }
        removedUrl = removed.remoteUrl;
      }
      return prev.filter((_, i) => i !== index);
    });

    if (removedUrl) {
      setImageUrls((prev) => prev.filter((url) => url !== removedUrl));
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities((prev) => [...prev, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDescription = async (customPrompt: string = "") => {
    if (!formData.title) {
      sonnerToast.error("Please enter a property title first");
      return;
    }

    try {
      const result = await generateDescription({
        title: formData.title,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        propertyType: formData.propertyType || propertyType,
        price: formData.price ? Number(formData.price) : undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        baths: formData.baths ? Number(formData.baths) : undefined,
        sqft: formData.sqft ? Number(formData.sqft) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        amenities: amenities || [],
        customPrompt,
      }).unwrap();

      console.log(result, "resultresultresultresult");
      if (result.description && result.available) {
        setFormData((prev) => ({
          ...prev,
          description: result.description || "",
        }));
        sonnerToast.success("Description generated successfully!");
      } else {
        sonnerToast.error(result.message || "Failed to generate description");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to generate description";
      sonnerToast.error(errorMessage);
    }
  };

  const handleSuggestPricing = async () => {
    if (!formData.title) {
      sonnerToast.error("Please enter a property title first");
      return;
    }

    try {
      const result = await suggestPricing({
        itemType: "property",
        title: formData.title,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        propertyType: formData.propertyType || propertyType,
        price: formData.price ? Number(formData.price) : undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        baths: formData.baths ? Number(formData.baths) : undefined,
        sqft: formData.sqft ? Number(formData.sqft) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        amenities: amenities || [],
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
        sonnerToast.error(result.message || "Failed to suggest pricing");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to suggest pricing";
      sonnerToast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isUploadingImages) {
      setErrorMessage("Please wait for all images to finish uploading.");
      return;
    }

    if (!imageUrls.length) {
      setErrorMessage("Please upload at least one property image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: PropertyPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        price: Number(formData.price),
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        sqft: Number(formData.sqft),
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        propertyType: formData.propertyType || propertyType,
        amenities,
        images: imageUrls,
      };

      if (isEditMode && propertyId) {
        await updateProperty({ id: propertyId, payload }).unwrap();
        toast({
          title: "Property updated successfully",
          description: "Your listing changes are now live.",
        });
      } else {
        await createProperty(payload).unwrap();
        toast({
          title: "Property added successfully",
          description: "Your listing is now live.",
        });
      }
      // RTK Query will automatically refetch the properties list due to invalidatesTags
      router.push("/real-estate/seller/properties");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "add"} property`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-8 max-w-[1320px]">
        {/* Back Button */}
        <Link
          href="/real-estate/seller/properties"
          className="inline-flex items-center gap-2 font-semibold"
          style={{ color: "#ef864c" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0f4656" }}>
            {isEditMode ? "Edit Property" : "Add New Property"}
          </h1>
          <p className="text-foreground/60">
            {isEditMode
              ? "Update the details below to refresh your listing"
              : "Fill in the details below to list your property"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          {/* Basic Information */}
          <Card className="p-6 border-2 border-primary/5 bg-white relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#ef864c]/20 to-[#0f4656]/20">
                <FileText className="w-5 h-5 text-[#ef864c]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0f4656]">
                  Basic Information
                </h2>
                <p className="text-xs text-foreground/40 font-medium">
                  Core property identity & location
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Title Field */}
              <div className="md:col-span-12 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Tag className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="title"
                    className="font-bold text-[#0f4656] text-sm uppercase tracking-wide"
                  >
                    Listing Title *
                  </Label>
                </div>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Ultra Modern Villa with Panoramic Views"
                  required
                  maxLength={200}
                  className="h-14 bg-primary/5 border-0 focus-visible:ring-2 focus-visible:ring-[#ef864c]/30 text-lg font-semibold text-[#0f4656] placeholder:text-[#0f4656]/30"
                />
              </div>

              {/* Description Field */}
              <div className="md:col-span-12 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-[#ef864c]" />
                    <Label
                      htmlFor="description"
                      className="font-bold text-[#0f4656] text-sm uppercase tracking-wide"
                    >
                      Description *
                    </Label>
                  </div>
                  {isAiAvailable && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAiModalOpen(true)}
                      disabled={isGeneratingDesc || !formData.title}
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
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what makes this property unique..."
                  maxLength={5000}
                  className="min-h-[180px] bg-primary/5 border-0 focus-visible:ring-2 focus-visible:ring-[#ef864c]/30 text-base leading-relaxed text-[#0f4656]/80 p-4"
                  required
                />
              </div>

              {/* Address Field */}
              <div className="md:col-span-6 space-y-3 relative">
                <div className="flex items-center gap-2 px-1">
                  <MapPin className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="location"
                    className="font-bold text-[#0f4656] text-sm uppercase tracking-wide"
                  >
                    Exact Address *
                  </Label>
                </div>
                <div className="relative group">
                  <Input
                    ref={addressInputRef}
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleLocationChange}
                    onKeyDown={handleLocationKeyDown}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Search for an address..."
                    required
                    maxLength={300}
                    className="h-13 bg-primary/5 border-0 focus-visible:ring-2 focus-visible:ring-[#ef864c]/30 group-hover:bg-primary/10 transition-colors"
                    disabled={isGeocoding}
                  />
                  {isGeocoding && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ef864c]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 bg-white border-2 border-primary/10 rounded-2xl shadow-2xl z-[50] mt-3 max-h-[300px] overflow-hidden overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300"
                    >
                      {isLoadingSuggestions ? (
                        <div className="p-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#ef864c]/40" />
                          <p className="mt-2 text-[10px] uppercase tracking-widest text-foreground/30 font-bold">
                            Scanning Globe
                          </p>
                        </div>
                      ) : (
                        addressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="p-5 cursor-pointer hover:bg-primary/5 transition-all border-b border-primary/5 last:border-0 group/item"
                          >
                            <div className="font-bold text-[14px] text-[#0f4656] group-hover/item:text-[#ef864c]">
                              {suggestion.name ||
                                suggestion.display_name?.split(",")[0]}
                            </div>
                            <div className="text-[11px] text-foreground/40 mt-1.5 font-medium line-clamp-1">
                              {suggestion.display_name}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* City Field */}
              <div className="md:col-span-3 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Building2 className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="city"
                    className="font-bold text-[#0f4656] text-sm uppercase tracking-wide"
                  >
                    City *
                  </Label>
                </div>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Dubai"
                  required
                  maxLength={100}
                  className="h-13 bg-primary/5 border-0 focus-visible:ring-2 focus-visible:ring-[#ef864c]/30"
                />
              </div>

              {/* State Field */}
              <div className="md:col-span-3 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Map className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="state"
                    className="font-bold text-[#0f4656] text-sm uppercase tracking-wide"
                  >
                    State *
                  </Label>
                </div>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Dubai"
                  required
                  maxLength={100}
                  className="h-13 bg-primary/5 border-0 focus-visible:ring-2 focus-visible:ring-[#ef864c]/30"
                />
              </div>

              {/* Property Type Field */}
              <div className="md:col-span-12 space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                  <Home className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="propertyType"
                    className="font-bold text-[#0f4656] text-sm uppercase tracking-wide"
                  >
                    Type of Property *
                  </Label>
                </div>
                <Select
                  key={propertyData?._id || "new-property"}
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    handleSelectChange("propertyType", value)
                  }
                >
                  <SelectTrigger className="h-14 bg-primary/5 border-0 focus:ring-2 focus:ring-[#ef864c]/30 rounded-xl px-5 text-base font-semibold text-[#0f4656]">
                    <SelectValue
                      placeholder={propertyType || "Select Item Type"}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-primary/5 shadow-2xl p-2">
                    <SelectItem
                      value="house"
                      className="rounded-xl p-3 font-medium"
                    >
                      House
                    </SelectItem>
                    <SelectItem
                      value="apartment"
                      className="rounded-xl p-3 font-medium"
                    >
                      Apartment
                    </SelectItem>
                    <SelectItem
                      value="condo"
                      className="rounded-xl p-3 font-medium"
                    >
                      Condo
                    </SelectItem>
                    <SelectItem
                      value="townhouse"
                      className="rounded-xl p-3 font-medium"
                    >
                      Townhouse
                    </SelectItem>
                    <SelectItem
                      value="villa"
                      className="rounded-xl p-3 font-medium"
                    >
                      Villa
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="rounded-xl p-3 font-medium"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Property Details */}
          <Card className="p-6 overflow-hidden border-2 border-primary/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-[#ef864c]/10">
                <Plus className="w-5 h-5 text-[#ef864c]" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#0f4656" }}>
                Property Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Field */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-primary/5 to-transparent p-5 rounded-2xl border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#ef864c]" />
                      <Label
                        htmlFor="price"
                        className="text-[#0f4656] font-bold text-base"
                      >
                        Asking Price *
                      </Label>
                    </div>
                    {isAiAvailable && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestPricing}
                        disabled={isSuggestingPrice || !formData.title}
                        className="gap-2 bg-gradient-to-r from-[#ef864c] to-[#0f4656] text-white border-0 hover:shadow-md transition-all font-semibold h-9"
                      >
                        {isSuggestingPrice ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            AI Suggest Price
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#0f4656]/40">
                      $
                    </span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="4,500,000"
                      required
                      className="h-14 pl-10 text-2xl font-bold text-[#0f4656] bg-white border-primary/10 focus-visible:ring-[#ef864c]"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="group space-y-3 p-4 rounded-xl border border-primary/5 bg-primary/5 hover:bg-white hover:border-[#ef864c/30] hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 text-[#0f4656]/60">
                  <Bed className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="beds"
                    className="font-semibold uppercase text-[10px] tracking-wider"
                  >
                    Bedrooms
                  </Label>
                </div>
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  value={formData.beds}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                  className="bg-transparent border-0 border-b-2 border-primary/10 focus-visible:ring-0 focus-visible:border-[#ef864c] rounded-none px-0 text-lg font-bold"
                />
              </div>

              {/* Bathrooms */}
              <div className="group space-y-3 p-4 rounded-xl border border-primary/5 bg-primary/5 hover:bg-white hover:border-[#ef864c/30] hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 text-[#0f4656]/60">
                  <Bath className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="baths"
                    className="font-semibold uppercase text-[10px] tracking-wider"
                  >
                    Bathrooms
                  </Label>
                </div>
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  value={formData.baths}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                  className="bg-transparent border-0 border-b-2 border-primary/10 focus-visible:ring-0 focus-visible:border-[#ef864c] rounded-none px-0 text-lg font-bold"
                />
              </div>

              {/* Sqft */}
              <div className="group space-y-3 p-4 rounded-xl border border-primary/5 bg-primary/5 hover:bg-white hover:border-[#ef864c/30] hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 text-[#0f4656]/60">
                  <Maximize className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="sqft"
                    className="font-semibold uppercase text-[10px] tracking-wider"
                  >
                    Square Feet
                  </Label>
                </div>
                <Input
                  id="sqft"
                  name="sqft"
                  type="number"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                  className="bg-transparent border-0 border-b-2 border-primary/10 focus-visible:ring-0 focus-visible:border-[#ef864c] rounded-none px-0 text-lg font-bold"
                />
              </div>

              {/* Year Built */}
              <div className="group space-y-3 p-4 rounded-xl border border-primary/5 bg-primary/5 hover:bg-white hover:border-[#ef864c/30] hover:shadow-sm transition-all lg:col-span-3">
                <div className="flex items-center gap-2 text-[#0f4656]/60">
                  <Calendar className="w-4 h-4 text-[#ef864c]" />
                  <Label
                    htmlFor="yearBuilt"
                    className="font-semibold uppercase text-[10px] tracking-wider"
                  >
                    Year Built (Optional)
                  </Label>
                </div>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  placeholder="e.g. 2020"
                  className="bg-transparent border-0 border-b-2 border-primary/10 focus-visible:ring-0 focus-visible:border-[#ef864c] rounded-none px-0 text-lg font-bold"
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6" style={{ color: "#0f4656" }}>
              Property Images
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                <Label
                  htmlFor="images"
                  className=" cursor-pointer text-sm text-foreground/70"
                >
                  <Upload
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: "#ef864c80" }}
                  />
                  Click to upload or drag and drop
                </Label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {isUploadingImages && (
                <p className="text-sm text-foreground/60">
                  Uploading images, please wait...
                </p>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={`${image.remoteUrl ?? image.preview}-${index}`}
                      className="relative group rounded-lg overflow-hidden border border-border/60 bg-foreground/5"
                    >
                      <div className="relative w-full h-32">
                        <Image
                          src={image.preview}
                          alt={
                            image.file?.name ?? `Property image ${index + 1}`
                          }
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="px-3 py-2 border-t border-border bg-white/80 text-xs text-foreground flex items-center justify-between gap-2 truncate">
                        <span className="truncate">
                          {image.file?.name ??
                            image.remoteUrl ??
                            `Image ${index + 1}`}
                        </span>
                        <span
                          className={`whitespace-nowrap ${
                            image.remoteUrl
                              ? "text-emerald-600"
                              : "text-orange-500"
                          }`}
                        >
                          {image.remoteUrl ? "Uploaded" : "Pending"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 text-white flex items-center justify-center shadow-lg shadow-destructive/30 transition hover:bg-destructive"
                        aria-label={`Remove ${
                          image.file?.name ?? `image ${index + 1}`
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Amenities */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6" style={{ color: "#0f4656" }}>
              Amenities
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add an amenity (e.g., Gym, Pool, Parking)"
                  maxLength={80}
                  className="border-border"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addAmenity}
                  variant="outline"
                  className="border-2"
                  style={{ color: "#ef864c", borderColor: "#ef864c" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef864c20";
                    e.currentTarget.style.color = "#d9723f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "#ef864c";
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="rounded-full px-4 py-2 flex items-center gap-2 text-sm"
                      style={{ backgroundColor: "#ef864c20" }}
                    >
                      <span style={{ color: "#0f4656" }}>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="transition-colors"
                        style={{ color: "#ef864c" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#d9723f")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#ef864c")
                        }
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/real-estate/seller/properties" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: "#ef864c" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d9723f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ef864c")
              }
              disabled={isProcessing}
            >
              {isProcessing
                ? "Saving..."
                : isEditMode
                  ? "Update Property"
                  : "Add Property"}
            </Button>
          </div>
        </form>
      </div>

      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateDescription}
        title={formData.title}
        isLoading={isGeneratingDesc}
      />

      <AiPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        suggestedPrice={pricingResult.price}
        explanation={pricingResult.explanation}
        title={formData.title}
      />
    </DashboardLayout>
  );
}
