"use client";
import { DescriptionWithSeeMore } from "@/components/DescriptionWithSeeMore";
import { Badge } from "@/RealEstate/components/ui/badge";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/RealEstate/components/ui/alert-dialog";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Heart,
  MessageSquare,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Loader2,
  ExternalLink,
  Calendar,
  Building2,
  CheckCircle2,
  Layout,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  useGetPropertyByIdQuery,
  useDeletePropertyMutation,
} from "@/services/redux/api/propertyApi";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SellerPropertyDetailProps {
  propertyId: string;
}

export default function SellerPropertyDetail({
  propertyId,
}: SellerPropertyDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetPropertyByIdQuery(propertyId, {
    skip: !propertyId,
  });
  const [deleteProperty, { isLoading: isDeleting }] =
    useDeletePropertyMutation();

  const property = data?.property;
  const missingPropertyId = !propertyId;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const mainImage =
    property?.images && property.images.length > 0
      ? property.images[selectedImageIndex] || property.images[0]
      : "";

  const handleDelete = async () => {
    try {
      await deleteProperty(propertyId).unwrap();
      router.push("/real-estate/seller/properties");
    } catch (error) {
      console.error("Failed to delete property:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  if (missingPropertyId) {
    return (
      <DashboardLayout>
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md text-center rounded-[32px] border-0 shadow-2xl">
            <h2 className="text-2xl font-black text-[#0f4656] mb-2">
              Invalid Asset
            </h2>
            <p className="text-[#0f4656]/50 font-bold mb-6">
              A valid property ID is required.
            </p>
            <Button
              onClick={() => router.push("/real-estate/seller/properties")}
              className="bg-[#ef864c] hover:bg-[#d9723f] text-white rounded-xl h-12 px-8 font-black"
            >
              RETURN TO PORTFOLIO
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#ef864c]" />
          <p className="font-black text-[#0f4656]/20 uppercase tracking-[0.2em] text-xs">
            Synchronizing Asset Data...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout>
        <div className="p-4 flex flex-col gap-6 max-w-7xl mx-auto">
          <Link
            href="/real-estate/seller/properties"
            className="inline-flex items-center gap-2 text-sm font-black text-[#ef864c] uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <Card className="p-10 text-center rounded-[40px] border-0 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-[#0f4656] mb-4">
              Asset Not Found
            </h2>
            <p className="text-[#0f4656]/50 font-bold mb-8 max-w-md mx-auto">
              {error &&
              "data" in error &&
              typeof error.data === "object" &&
              error.data !== null &&
              "message" in error.data
                ? (error.data as { message: string }).message
                : "This listing has been removed or is no longer accessible."}
            </p>
            <Button
              onClick={() => router.push("/real-estate/seller/properties")}
              className="bg-[#0f4656] text-white rounded-2xl h-14 px-10 font-black"
            >
              EXIT TO DASHBOARD
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const locationDisplay =
    property.city && property.state
      ? `${property.city}, ${property.state}`
      : property.location;

  return (
    <DashboardLayout>
      <div className="p-3 lg:p-8 space-y-4 lg:space-y-8 max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="space-y-3 lg:space-y-6">
          <Link
            href="/real-estate/seller/properties"
            className="inline-flex items-center gap-2 text-[10px] lg:text-sm font-black text-[#ef864c] hover:text-[#d9723f] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            Portfolio List
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-8">
            <div className="space-y-1 lg:space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[#ef864c] font-black text-[9px] lg:text-sm uppercase tracking-[0.2em]">
                <Layout className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Asset Management
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-[#0f4656] tracking-tight leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs lg:text-base font-bold text-[#0f4656]/50">
                <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ef864c]" />
                {locationDisplay}
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-2 lg:gap-3">
              <Button
                variant="outline"
                className="flex-1 md:flex-none border-2 border-[#ef864c]/20 rounded-xl lg:rounded-2xl px-4 lg:px-6 h-10 lg:h-12 font-black text-[#ef864c] hover:bg-[#ef864c]/5 hover:border-[#ef864c]/40 transition-all text-[10px] lg:text-sm uppercase tracking-wider"
                onClick={() =>
                  router.push(
                    `/real-estate/seller/properties/${propertyId}/edit`,
                  )
                }
              >
                <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
                Edit Asset
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl lg:rounded-2xl px-4 lg:px-6 h-10 lg:h-12 font-black text-[10px] lg:text-sm uppercase tracking-wider"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl lg:rounded-[40px] p-6 lg:p-10 border-0 shadow-2xl bg-white max-w-lg">
                  <AlertDialogHeader className="space-y-3 lg:space-y-4">
                    <div className="w-12 h-12 lg:w-16 h-16 bg-red-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-red-500 mb-1 lg:mb-2">
                      <Trash2 className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <AlertDialogTitle className="text-2xl lg:text-3xl font-black text-[#0f4656]">
                      Delete asset?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base lg:text-lg font-medium text-[#0f4656]/60 leading-relaxed text-center md:text-left">
                      This will permanently remove{" "}
                      <span className="text-[#0f4656] font-black">
                        &quot;{property.title}&quot;
                      </span>{" "}
                      from your portfolio and all marketplace indices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-8 lg:mt-10 gap-3 lg:gap-4 flex-col sm:flex-row">
                    <AlertDialogCancel className="h-12 lg:h-14 rounded-xl lg:rounded-2xl px-6 lg:px-8 font-black border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5">
                      KEEP LISTING
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white hover:bg-red-600 h-12 lg:h-14 rounded-xl lg:rounded-2xl px-8 lg:px-10 font-black shadow-xl shadow-red-500/20"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "DELETING..." : "DELETE PERMANENTLY"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left - Media & Primary Details */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="space-y-3 lg:space-y-4">
              <Card className="overflow-hidden border-0 shadow-2xl bg-white rounded-3xl lg:rounded-[40px] relative group">
                <div className="relative h-64 md:h-96 lg:h-[480px] overflow-hidden bg-[#0f4656]/5">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt="Property Preview"
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#0f4656]/20">
                      <Building2 className="w-16 h-16 mb-2" />
                      <p className="font-black uppercase tracking-widest text-[10px]">
                        No visuals available
                      </p>
                    </div>
                  )}
                  <div className="absolute top-4 lg:top-6 left-4 lg:left-6">
                    <Badge
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-0 shadow-lg backdrop-blur-md",
                        (property.status || "active").toLowerCase() === "active"
                          ? "bg-green-500/90 text-white"
                          : "bg-[#ef864c]/90 text-white",
                      )}
                    >
                      {property.status || "Active"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Card>

              {/* Gallery Thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 lg:w-24 h-16 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden border-4 transition-all duration-300 relative",
                        selectedImageIndex === index
                          ? "border-[#ef864c] scale-95 shadow-lg"
                          : "border-transparent opacity-60 hover:opacity-100 hover:scale-105",
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Asset Core Details */}
            <Card className="p-5 lg:p-10 border-0 shadow-xl bg-white rounded-3xl lg:rounded-[48px] relative overflow-hidden">
              <div className="space-y-6 lg:space-y-10">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <span className="text-[10px] lg:text-sm font-black text-[#ef864c] uppercase tracking-[0.3em]">
                    Market Valuation
                  </span>
                  <p className="text-3xl lg:text-6xl font-black text-[#0f4656] tracking-tight">
                    {formatPrice(property.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 py-8 lg:py-12 border-y border-[#0f4656]/5">
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2.5 lg:gap-3">
                      <Bed className="w-5 h-5 lg:w-7 lg:h-7 text-[#ef864c]" />
                      <span className="text-xl lg:text-3xl font-black text-[#0f4656]">
                        {property.beds}
                      </span>
                    </div>
                    <p className="text-[9px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Total Bedrooms
                    </p>
                  </div>
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2.5 lg:gap-3">
                      <Bath className="w-5 h-5 lg:w-7 lg:h-7 text-[#ef864c]" />
                      <span className="text-xl lg:text-3xl font-black text-[#0f4656]">
                        {property.baths}
                      </span>
                    </div>
                    <p className="text-[9px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Total Bathrooms
                    </p>
                  </div>
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2.5 lg:gap-3">
                      <Square className="w-5 h-5 lg:w-7 lg:h-7 text-[#ef864c]" />
                      <span className="text-xl lg:text-3xl font-black text-[#0f4656]">
                        {formatNumber(property.sqft ?? 0)}
                      </span>
                    </div>
                    <p className="text-[9px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Square Footage
                    </p>
                  </div>
                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex items-center gap-2.5 lg:gap-3">
                      <Calendar className="w-5 h-5 lg:w-7 lg:h-7 text-[#ef864c]" />
                      <span className="text-xl lg:text-3xl font-black text-[#0f4656]">
                        {property.yearBuilt || "N/A"}
                      </span>
                    </div>
                    <p className="text-[9px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Year Built
                    </p>
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <h3 className="text-lg lg:text-2xl font-black text-[#0f4656] flex items-center gap-3  ">
                    <div className="h-0.5 w-8 lg:w-12 bg-[#ef864c]" /> Detail
                    Analysis
                  </h3>
                  <DescriptionWithSeeMore
                    description={property.description || ""}
                    textClassName="text-sm lg:text-lg text-[#0f4656]/60 leading-relaxed font-bold"
                  />
                </div>
              </div>
            </Card>

            {/* Exclusive Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="p-5 lg:p-8 border-0 shadow-xl bg-white rounded-3xl lg:rounded-[40px]">
                <h3 className="text-lg lg:text-xl font-black text-[#0f4656] mb-6 flex items-center gap-2 tracking-tight">
                  <Sparkles className="w-5 h-5 text-[#ef864c]" />
                  Asset Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center text-[10px] lg:text-xs font-black uppercase tracking-widest border border-[#0f4656]/5 bg-[#0f4656]/[0.02] text-[#0f4656]/60 hover:bg-[#ef864c]/10 hover:text-[#ef864c] hover:border-[#ef864c]/20 transition-all duration-300"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right - Performance & Location Tracking */}
          <div className="space-y-4 lg:space-y-6">
            <Card className="p-5 lg:p-8 border-0 shadow-xl bg-white rounded-3xl lg:rounded-[40px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef864c]/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
              <h3 className="text-lg lg:text-xl font-black text-[#0f4656] mb-6 flex items-center gap-2 relative z-10">
                <TrendingUp className="w-5 h-5 text-[#ef864c]" />
                Analytics Feed
              </h3>

              <div className="grid grid-cols-2 gap-3 lg:gap-4 relative z-10">
                <div className="p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-[#0f4656]/5 border border-[#0f4656]/5 flex flex-col justify-between h-28 lg:h-32 transition-all hover:bg-white hover:shadow-lg hover:scale-[1.02]">
                  <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-[#ef864c]" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Total Views
                    </p>
                    <p className="text-xl lg:text-2xl font-black text-[#0f4656]">
                      {formatNumber(property.views ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-[#0f4656]/5 border border-[#0f4656]/5 flex flex-col justify-between h-28 lg:h-32 transition-all hover:bg-white hover:shadow-lg hover:scale-[1.02]">
                  <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-[#ef864c]" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Inquiries
                    </p>
                    <p className="text-xl lg:text-2xl font-black text-[#0f4656]">
                      {formatNumber(property.inquiries ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-[#0f4656]/5 border border-[#0f4656]/5 flex flex-col justify-between h-28 lg:h-32 transition-all hover:bg-white hover:shadow-lg hover:scale-[1.02]">
                  <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-[#ef864c]" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Saves
                    </p>
                    <p className="text-xl lg:text-2xl font-black text-[#0f4656]">
                      0
                    </p>
                  </div>
                </div>
                <div className="p-4 lg:p-5 rounded-2xl lg:rounded-3xl bg-[#0f4656]/5 border border-[#0f4656]/5 flex flex-col justify-between h-28 lg:h-32 transition-all hover:bg-white hover:shadow-lg hover:scale-[1.02]">
                  <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-[#ef864c]" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Hot Rank
                    </p>
                    <p className="text-xl lg:text-2xl font-black text-[#0f4656]">
                      TOP 5%
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 lg:p-8 border-0 shadow-xl bg-white rounded-3xl lg:rounded-[40px] overflow-hidden">
              <h3 className="text-lg lg:text-xl font-black text-[#0f4656] mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#ef864c]" /> Mapping
              </h3>
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-[#0f4656]/5">
                <iframe
                  title="Asset Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(locationDisplay || "")}&output=embed`}
                  className="w-full h-40 lg:h-52 grayscale-[0.6] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0f4656] to-transparent text-white">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-[10px] font-black text-white hover:text-[#ef864c] uppercase tracking-tighter"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationDisplay || "")}`,
                        "_blank",
                      )
                    }
                  >
                    Open Google Maps <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-5 lg:p-8 border-0 shadow-xl bg-white rounded-3xl lg:rounded-[40px]">
              <h3 className="text-lg lg:text-xl font-black text-[#0f4656] mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#ef864c]" /> Power Actions
              </h3>
              <div className="space-y-2 lg:space-y-3">
                {[
                  { label: "Public Storefront", icon: Eye, link: "#" },
                  { label: "Lead Management", icon: MessageSquare, link: "#" },
                  { label: "Buyer Engagement", icon: Heart, link: "#" },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full h-11 lg:h-12 justify-between border-[#0f4656]/10 hover:bg-[#0f4656]/5 text-[#0f4656] font-black rounded-xl text-xs lg:text-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-[#ef864c]" />{" "}
                      {action.label}
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
