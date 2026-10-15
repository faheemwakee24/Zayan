"use client";

import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { Input } from "@/RealEstate/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  Building2,
  CheckCircle2,
  Clock,
  Layout,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { Badge } from "@/RealEstate/components/ui/badge";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/RealEstate/components/ui/tooltip";
import { Progress } from "@/RealEstate/components/ui/progress";
import { useGetMySubscriptionQuery } from "@/services/redux/api/subscriptionApi";
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
  useGetPropertiesQuery,
  useDeletePropertyMutation,
} from "@/services/redux/api/propertyApi";

type PropertyStatus = "active" | "sold" | "pending";

export interface Property {
  _id: string;
  title: string;
  location: string;
  city?: string;
  state?: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  status?: PropertyStatus;
  amenities?: string[];
  views?: number;
  inquiries?: number;
}

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatSqft = (value?: number) => {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString()}`;
};

export default function SellerProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // RTK Query hook - automatically caches and refetches
  const {
    data: propertiesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPropertiesQuery(undefined, {
    // Refetch on mount, window focus, or network reconnect
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [deleteProperty, { isLoading: isDeleting }] =
    useDeletePropertyMutation();

  // Extract properties from response (memoized to avoid unnecessary re-renders)
  const properties = useMemo(
    () => propertiesResponse?.properties || [],
    [propertiesResponse?.properties],
  );

  const { data: subData } = useGetMySubscriptionQuery("realEstateSeller");
  const subscription = subData?.subscription;
  const maxListings = subscription?.planId?.features?.maxListings || 5;
  const currentListings = properties.length;
  const isLimitReached = currentListings >= maxListings;
  const planName = subscription?.planId?.name || "Basic";

  const filtered = useMemo(() => {
    const searchValue = searchTerm.toLowerCase();
    return properties.filter((p) => {
      const titleMatch = p.title.toLowerCase().includes(searchValue);
      const locationMatch = (p.location || "")
        .toLowerCase()
        .includes(searchValue);
      const cityStateMatch = `${p.city ?? ""} ${p.state ?? ""}`
        .toLowerCase()
        .includes(searchValue);
      return titleMatch || locationMatch || cityStateMatch;
    });
  }, [properties, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: properties.length,
      active: properties.filter(
        (p) => (p.status || "active").toLowerCase() === "active",
      ).length,
      pending: properties.filter((p) => p.status?.toLowerCase() === "pending")
        .length,
      sold: properties.filter((p) => p.status?.toLowerCase() === "sold").length,
    };
  }, [properties]);

  const handleDelete = async (propertyId: string) => {
    try {
      await deleteProperty(propertyId).unwrap();
      toast({
        title: "Property deleted",
        description: "The property has been removed from your listings.",
      });
      // RTK Query will automatically refetch and update the cache
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          (error as { message?: string })?.message ||
          "Unable to delete property",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-3 lg:p-6 space-y-6 lg:space-y-10 max-w-7xl mx-auto font-sans">
        {/* Subscription Limit Banner */}
        {/* Subscription Limit Banner - Premium Design */}
        {subscription && (
          <div className="mb-10 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0f4656] to-[#ef864c] opacity-[0.08] blur-xl group-hover:opacity-[0.12] transition-opacity duration-700 rounded-[20px]" />
            <Card className="relative border-0 bg-white/80 backdrop-blur-md rounded-[20px] p-5 lg:p-6 shadow-xl shadow-[#0f4656]/5 hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Crown className="w-32 h-32 rotate-12" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
                <div className="flex items-center gap-5 lg:gap-6">
                  <div className="flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-[20px] bg-gradient-to-br from-[#0f4656] to-[#1a6b7d] flex items-center justify-center text-white shadow-2xl shadow-[#0f4656]/20 ring-4 ring-white">
                    <Crown className="w-7 h-7 lg:w-8 lg:h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg lg:text-xl font-black text-[#0f4656] tracking-tight">
                        {planName.toUpperCase()} MEMBERSHIP
                      </h3>
                      <Badge className="bg-green-500 text-white border-0 text-[10px] font-black tracking-widest px-3 py-1">
                        ACTIVE
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-[#0f4656]/40 uppercase tracking-widest">
                      Listings Portfolio:{" "}
                      <span className="text-[#0f4656]">{currentListings}</span>{" "}
                      of <span className="text-[#0f4656]">{maxListings}</span>{" "}
                      slots filled
                    </p>
                  </div>
                </div>

                <div className="flex-1 w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] lg:text-xs font-black text-[#0f4656]/30 uppercase tracking-[0.2em]">
                      Usage Velocity
                    </span>
                    <span className="text-sm font-black text-[#0f4656]">
                      {Math.round((currentListings / maxListings) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(currentListings / maxListings) * 100}
                    className="h-2.5 lg:h-3 rounded-full bg-[#0f4656]/5"
                    indicatorColor={isLimitReached ? "#ef4444" : "#ef864c"}
                  />
                  {isLimitReached && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                      Critical Capacity Reach - Action Required
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href="/real-estate/seller/subscription"
                    className="flex-1 lg:flex-none"
                  >
                    <Button
                      variant="outline"
                      className="w-full lg:w-auto border-2 border-[#0f4656]/10 text-[#0f4656] font-black rounded-[20px] h-12 lg:h-14 px-8 hover:bg-[#0f4656]/5 transition-all text-xs tracking-widest"
                    >
                      BILLING
                    </Button>
                  </Link>
                  {isLimitReached ? (
                    <Link
                      href="/real-estate/seller/subscription"
                      className="flex-1 lg:flex-none"
                    >
                      <Button className="w-full lg:w-auto bg-[#ef864c] hover:bg-[#d9723f] text-white font-black rounded-[20px] h-12 lg:h-14 px-8 shadow-xl shadow-[#ef864c]/20 transition-all hover:scale-105 active:scale-95 text-xs tracking-widest">
                        UPGRADE NOW
                      </Button>
                    </Link>
                  ) : (
                    <div className="hidden md:flex items-center gap-3 px-5 lg:px-6 py-3 lg:py-4 rounded-[20px] bg-[#0f4656]/5 border border-[#0f4656]/5">
                      <Building2 className="w-5 h-5 text-[#ef864c]" />
                      <span className="text-[10px] lg:text-xs font-black text-[#0f4656] uppercase tracking-widest whitespace-nowrap">
                        Slot Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-8">
          <div className="space-y-1 lg:space-y-2 text-center md:text-left">
            <h1 className="text-3xl lg:text-5xl font-black text-[#0f4656] tracking-tight">
              Property Portfolio
            </h1>
            <p className="text-base lg:text-lg text-[#0f4656]/50 font-medium font-bold">
              Manage and track your active real estate listings
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full md:w-auto">
                  <Link
                    href={
                      isLimitReached
                        ? "#"
                        : "/real-estate/seller/properties/add"
                    }
                    className={cn(
                      "w-full md:w-auto",
                      isLimitReached && "cursor-not-allowed",
                    )}
                    onClick={(e) => isLimitReached && e.preventDefault()}
                  >
                    <Button
                      className="w-full text-white rounded-[20px] px-6 lg:px-8 h-12 lg:h-14 font-black shadow-xl transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: isLimitReached ? "#9ca3af" : "#ef864c",
                        boxShadow: isLimitReached
                          ? "none"
                          : "0 20px 25px -5px rgb(239 134 76 / 0.2)",
                      }}
                      disabled={isLimitReached}
                    >
                      <Plus className="w-5 h-5" />
                      ADD NEW PROPERTY
                    </Button>
                  </Link>
                </div>
              </TooltipTrigger>
              {isLimitReached && (
                <TooltipContent className="bg-[#0f4656] text-white border-0 rounded-[20px] p-3 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ef864c]" />
                    <p className="text-sm font-bold">
                      Upgrade plan or modify existing - limit exceeded
                    </p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {[
            {
              label: "TOTAL LISTINGS",
              value: stats.total,
              icon: Building2,
              color: "#0f4656",
            },
            {
              label: "ACTIVE READY",
              value: stats.active,
              icon: CheckCircle2,
              color: "#22c55e",
            },
            {
              label: "PENDING DEALS",
              value: stats.pending,
              icon: Clock,
              color: "#ef864c",
            },
            {
              label: "SOLD ASSETS",
              value: stats.sold,
              icon: Layout,
              color: "#94a3b8",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="p-3 lg:p-6 border-0 shadow-xl bg-white rounded-[20px] group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div
                  className="p-2.5 lg:p-3 rounded-[20px] shadow-inner"
                  style={{
                    backgroundColor: `${stat.color}10`,
                    color: stat.color,
                  }}
                >
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <p className="text-[9px] lg:text-[10px] font-black tracking-widest text-[#0f4656]/40 uppercase">
                    {stat.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-black text-[#0f4656]">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search & Action Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <Card className="flex-1 w-full p-2 border-0 shadow-xl bg-white rounded-[20px] flex items-center gap-2 group focus-within:ring-2 ring-[#ef864c]/20 transition-all">
            <div className="p-3 rounded-[20px] bg-[#0f4656]/5 text-[#0f4656]/40 group-focus-within:text-[#ef864c] transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <Input
              placeholder="Search by title, city, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 focus-visible:ring-0 text-base lg:text-lg font-bold text-[#0f4656] placeholder:text-[#0f4656]/20 h-10 lg:h-12"
            />
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden border-0 shadow-lg bg-white rounded-[20px] flex flex-col animate-pulse"
              >
                <div className="h-48 lg:h-64 bg-[#0f4656]/5" />
                <div className="p-6 lg:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-[#0f4656]/10 rounded-full w-3/4" />
                    <div className="h-4 bg-[#0f4656]/5 rounded-full w-1/2" />
                  </div>
                  <div className="h-8 bg-[#0f4656]/10 rounded-[20px] w-1/3" />
                  <div className="flex gap-4 pt-4">
                    <div className="h-10 bg-[#0f4656]/5 rounded-[20px] flex-1" />
                    <div className="h-10 bg-[#0f4656]/5 rounded-[20px] flex-1" />
                    <div className="h-10 bg-[#0f4656]/5 rounded-[20px] flex-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 mb-6">
            <p className="text-sm text-red-700">
              {(error as { message?: string })?.message ||
                "Failed to load properties"}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 pb-20">
            {filtered.map((property) => (
              <Card
                key={property._id}
                className="group overflow-hidden border-0 shadow-xl bg-white rounded-[20px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col relative"
              >
                {/* Status Badge
                <div className=" top-4 lg:top-6 right-4 lg:right-6 z-1">
                  <Badge
                    className={cn(
                      "px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[9px] lg:text-[10px] font-black tracking-widest uppercase border-0 shadow-lg backdrop-blur-md",
                      (property.status || "active").toLowerCase() === "active"
                        ? "bg-green-500/90 text-white"
                        : property.status?.toLowerCase() === "pending"
                          ? "bg-[#ef864c]/90 text-white"
                          : "bg-[#0f4656]/90 text-white",
                    )}
                  >
                    {property.status || "Active"}
                  </Badge>
                </div> */}

                {/* Property Image */}
                <div className="relative h-40 lg:h-52 overflow-hidden">
                  <Image
                    src={
                      property.images?.[0] ??
                      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop"
                    }
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Card Content */}
                <div className="p-4 lg:p-6 flex-1 flex flex-col">
                  <div className="space-y-1 mb-1.5 lg:mb-3">
                    <h3 className="text-xl lg:text-2xl font-black text-[#0f4656] line-clamp-1 group-hover:text-[#ef864c] transition-colors leading-tight">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] lg:text-sm font-bold text-[#0f4656]/40 uppercase tracking-tight">
                      <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ef864c]" />
                      <span className="truncate">
                        {property.location ||
                          [property.city, property.state]
                            .filter(Boolean)
                            .join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2.5 lg:mb-4.5">
                    <span className="text-2xl lg:text-3xl font-black text-[#0f4656]">
                      {formatCurrency(property.price)}
                    </span>
                    <span className="text-[10px] lg:text-xs font-bold text-[#0f4656]/30 uppercase tracking-widest">
                      Market Value
                    </span>
                  </div>

                  {/* Core Amenities */}
                  <div className="grid grid-cols-3 gap-3 lg:gap-4 py-2 lg:py-4 border-y border-[#0f4656]/5 mb-3 lg:mb-4.5">
                    <div className="flex flex-col items-center gap-1 border-r border-[#0f4656]/5 last:border-0">
                      <Bed className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ef864c]" />
                      <span className="text-[9px] lg:text-[10px] font-black text-[#0f4656]">
                        {property.beds} BEDS
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-r border-[#0f4656]/5 last:border-0">
                      <Bath className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ef864c]" />
                      <span className="text-[9px] lg:text-[10px] font-black text-[#0f4656]">
                        {property.baths} BATHS
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Square className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ef864c]" />
                      <span className="text-[9px] lg:text-[10px] font-black text-[#0f4656]">
                        {formatSqft(property.sqft)} FT²
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Action Controls */}
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Link
                      href={`/real-estate/seller/properties/${property._id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-[#0f4656]/10 text-[#0f4656] font-black rounded-[20px] h-9 lg:h-10 hover:bg-[#0f4656]/5 transition-colors group/btn text-[10px] lg:text-xs"
                      >
                        <Eye className="w-3 h-3 lg:w-3.5 h-3.5 mr-1 lg:mr-1.5 transition-transform group-hover/btn:scale-110" />
                        VIEW
                      </Button>
                    </Link>
                    <Link
                      href={`/real-estate/seller/properties/${property._id}/edit`}
                      className="p-0"
                    >
                      <Button className="bg-[#0f4656]/5 hover:bg-[#0f4656] text-[#0f4656] hover:text-white rounded-[20px] w-9 h-9 lg:w-10 lg:h-10 p-0 transition-all shadow-none">
                        <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:text-white hover:bg-red-500 rounded-[20px] w-9 h-9 lg:w-10 lg:h-10 p-0 transition-all"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[20px] p-6 lg:p-10 border-0 shadow-2xl bg-white max-w-lg">
                        <AlertDialogHeader className="space-y-3 lg:space-y-4">
                          <div className="w-12 h-12 lg:w-16 h-16 bg-red-50 rounded-[20px] flex items-center justify-center text-red-500 mb-1 lg:mb-2">
                            <Trash2 className="w-6 h-6 lg:w-8 lg:h-8" />
                          </div>
                          <AlertDialogTitle className="text-2xl lg:text-3xl font-black text-[#0f4656]">
                            Delete listing?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base lg:text-lg font-medium text-[#0f4656]/60 leading-relaxed">
                            This action cannot be undone. This will permanently
                            remove{" "}
                            <span className="text-[#0f4656] font-black">
                              &quot;{property.title}&quot;
                            </span>{" "}
                            from your portfolio and all marketplace indices.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 lg:mt-10 gap-3 lg:gap-4">
                          <AlertDialogCancel className="h-12 lg:h-14 rounded-[20px] px-6 lg:px-8 font-black border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5">
                            KEEP LISTING
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 text-white hover:bg-red-600 h-12 lg:h-14 rounded-[20px] px-8 lg:px-10 font-black shadow-xl shadow-red-500/20"
                            onClick={() => handleDelete(property._id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "DELETING..." : "DELETE"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filtered.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-20 border-0 shadow-xl bg-white rounded-[20px] text-center space-y-6">
            <div className="w-24 h-24 bg-[#0f4656]/5 rounded-[20px] flex items-center justify-center text-[#0f4656]/20">
              <Building2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#0f4656]">
                No Properties Found
              </h2>
              <p className="text-lg font-medium text-[#0f4656]/40 max-w-md mx-auto">
                {searchTerm
                  ? `No results match your search "${searchTerm}". Try a different keyword.`
                  : "Your portfolio is currently empty. Start by adding your first luxury listing."}
              </p>
            </div>
            <Link href="/real-estate/seller/properties/add">
              <Button className="bg-[#ef864c] hover:bg-[#d9723f] text-white rounded-[20px] px-10 h-14 font-black shadow-xl shadow-[#ef864c]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                CREATE FIRST LISTING
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
