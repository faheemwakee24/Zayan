"use client";

import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { Input } from "@/RealEstate/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Filter,
  MessageSquare,
  Search,
  Grid3x3,
  List,
  SlidersHorizontal,
  X,
  Star,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { BuyerDashboardLayout } from "@/RealEstate/components/BuyerDashboardLayout";
import { useGetBuyerPropertiesQuery } from "@/services/redux/api/propertyApi";
import type { BuyerProperty } from "@/services/redux/api/propertyApi";
import { Loader2 } from "lucide-react";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: string | number;
  image: string;
  status: string;
  isFeatured: boolean;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verificationStatus?: "pending" | "approved" | "rejected" | null;
    isVerified?: boolean;
  };
}

type ViewMode = "grid" | "list";
type SortOption = "price-low" | "price-high" | "newest" | "oldest" | "featured";

export default function BuyerProperties() {
  const [showFilters, setShowFilters] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Applied filters (used for API query)
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    city: "",
    state: "",
    minPrice: 0,
    maxPrice: 10000000,
    beds: 0,
    baths: 0,
  });

  // Pending filters (what user is editing)
  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: "",
    city: "",
    state: "",
    minPrice: 0,
    maxPrice: 10000000,
    beds: 0,
    baths: 0,
  });

  // Build API query params from applied filters
  const queryParams = useMemo(() => {
    const params: {
      searchTerm?: string;
      city?: string;
      state?: string;
      minPrice?: number;
      maxPrice?: number;
      beds?: number;
      baths?: number;
      sortBy?: string;
      order?: "asc" | "desc";
    } = {};

    // Add filter params
    if (appliedFilters.searchTerm)
      params.searchTerm = appliedFilters.searchTerm;
    if (appliedFilters.city) params.city = appliedFilters.city;
    if (appliedFilters.state) params.state = appliedFilters.state;
    if (appliedFilters.minPrice > 0) params.minPrice = appliedFilters.minPrice;
    if (appliedFilters.maxPrice < 10000000)
      params.maxPrice = appliedFilters.maxPrice;
    if (appliedFilters.beds > 0) params.beds = appliedFilters.beds;
    if (appliedFilters.baths > 0) params.baths = appliedFilters.baths;

    // Always include sortBy and order (backend defaults if not provided, but we'll be explicit)
    switch (sortBy) {
      case "price-low":
        params.sortBy = "price";
        params.order = "asc";
        break;
      case "price-high":
        params.sortBy = "price";
        params.order = "desc";
        break;
      case "newest":
        params.sortBy = "createdAt";
        params.order = "desc";
        break;
      case "oldest":
        params.sortBy = "createdAt";
        params.order = "asc";
        break;
      case "featured":
        params.sortBy = "createdAt";
        params.order = "desc";
        break;
    }

    // Always return an object to ensure RTK Query properly handles query changes
    return params;
  }, [appliedFilters, sortBy]);

  // Sync pending filters when filter panel opens
  const handleFiltersToggle = () => {
    if (!filtersExpanded) {
      setPendingFilters(appliedFilters);
    }
    setFiltersExpanded(!filtersExpanded);
  };

  const handleMobileFiltersToggle = () => {
    if (!showFilters) {
      setPendingFilters(appliedFilters);
    }
    setShowFilters(!showFilters);
  };

  // Fetch properties from API
  const { data, isLoading, isError, error } =
    useGetBuyerPropertiesQuery(queryParams);
  console.log(data, "data hfsdjcddksklsd");
  // Transform API data to component format
  const properties: Property[] = useMemo(() => {
    if (!data?.properties) return [];

    return data.properties.map((prop: BuyerProperty) => ({
      id: prop.id || prop._id,
      title: prop.title,
      location: prop.location || `${prop.city || ""}, ${prop.state || ""}`,
      price: prop.price,
      beds: prop.beds,
      baths: prop.baths,
      sqft:
        typeof prop.sqft === "number" ? prop.sqft.toLocaleString() : prop.sqft,
      image:
        (prop as BuyerProperty & { image?: string }).image ||
        prop.images?.[0] ||
        "",
      status: prop.status === "active" ? "For Sale" : prop.status || "For Sale",
      isFeatured: prop.isFeatured || false,
      seller: {
        name: prop.seller?.name || "Unknown Seller",
        avatar: prop.seller?.avatar || prop.seller?.name?.charAt(0) || "U",
        rating: prop.seller?.rating || 0,
        verificationStatus: prop.seller?.verificationStatus || null,
        isVerified: prop.seller?.isVerified || false,
      },
    }));
  }, [data]);

  // Sort properties (client-side for featured sorting)
  const sortedProperties = useMemo(() => {
    if (sortBy === "featured") {
      return [...properties].sort(
        (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
      );
    }
    return properties; // Backend already sorted for other cases
  }, [properties, sortBy]);

  console.log(sortedProperties, "sortedProperties hfsdjcddksklsd");

  const handleFilterChange = (key: string, value: string | number) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
    setFiltersExpanded(false);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      searchTerm: "",
      city: "",
      state: "",
      minPrice: 0,
      maxPrice: 10000000,
      beds: 0,
      baths: 0,
    };
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setFiltersExpanded(false);
    setShowFilters(false);
  };

  const activeFiltersCount = Object.entries(appliedFilters).filter(
    ([key, value]) => {
      if (key === "searchTerm" || key === "city" || key === "state") {
        return value !== "";
      }
      if (key === "minPrice") return value !== 0;
      if (key === "maxPrice") return value !== 10000000;
      if (key === "beds" || key === "baths") return value !== 0;
      return false;
    },
  ).length;

  // Loading state
  if (isLoading) {
    return (
      // <LandingLayout>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-foreground/60">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p>Loading properties...</p>
        </div>
      </div>
      // </LandingLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      // <LandingLayout>
      <div className="min-h-screen bg-background">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-[20px] p-6 text-center">
            <h3 className="text-xl font-bold text-red-700 mb-2">
              Error loading properties
            </h3>
            <p className="text-red-600">
              {(error as { data?: { message?: string } })?.data?.message ||
                (error as Error)?.message ||
                "Unable to load properties. Please try again."}
            </p>
          </div>
        </div>
      </div>
      // </LandingLayout>
    );
  }

  return (
    <BuyerDashboardLayout>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <div className="space-y-6">
          {/* Header & Search Interface */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-black text-[#0f4656] tracking-tight">
                  Browse Properties
                </h1>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0f4656]/50">
                  {sortedProperties.length}{" "}
                  {sortedProperties.length === 1 ? "property" : "properties"}{" "}
                  Matrix detected
                  {activeFiltersCount > 0 && (
                    <span className="text-[#ef864c] font-black">
                      • {activeFiltersCount} ACTIVE PARAMETERS
                    </span>
                  )}
                </div>
              </div>

              {/* View Configuration */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 bg-white rounded-[20px] border border-[#0f4656]/10 p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-[20px] transition-all",
                      viewMode === "grid"
                        ? "bg-[#ef864c] text-white shadow-lg shadow-[#ef864c]/20"
                        : "text-[#0f4656]/40 hover:text-[#0f4656] hover:bg-[#0f4656]/5",
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-[20px] transition-all",
                      viewMode === "list"
                        ? "bg-[#ef864c] text-white shadow-lg shadow-[#ef864c]/20"
                        : "text-[#0f4656]/40 hover:text-[#0f4656] hover:bg-[#0f4656]/5",
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 px-4 py-2 border border-[#0f4656]/10 rounded-[20px] bg-white text-[#0f4656] text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#ef864c]/20 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Global Search Input */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0f4656]/40 group-focus-within:text-[#ef864c] transition-colors" />
              <Input
                placeholder="Search by property name, location, or features..."
                value={pendingFilters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                className="pl-12 pr-4 py-3 h-12 text-xs font-bold border-[#0f4656]/10 focus:border-[#ef864c]/30 rounded-[20px] focus:ring-0 shadow-sm transition-all"
              />
            </div>

            {/* Desktop Parameter Suite */}
            <div className="hidden md:block">
              <div
                onClick={handleFiltersToggle}
                className="w-full flex items-center justify-between p-4 bg-white rounded-[20px] border border-[#0f4656]/10 hover:border-[#ef864c]/30 transition-all group cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-[#ef864c]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#0f4656]">
                    Filters
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className="text-white rounded-[20px] px-2 py-0.5 text-[9px] font-black uppercase bg-[#ef864c] shadow-lg shadow-[#ef864c]/20">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetFilters();
                      }}
                      className="hover:bg-[#ef864c]/10 px-3 py-1 rounded-[20px] text-[9px] font-black uppercase tracking-widest text-[#ef864c] transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                  <div className="p-1 px-2 rounded-[20px] bg-[#0f4656]/5 text-[#0f4656]/40 group-hover:text-[#ef864c] transition-colors">
                    {filtersExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Module Detail */}
              {filtersExpanded && (
                <div className="mt-4 p-8 bg-white rounded-[20px] border border-[#0f4656]/10 shadow-xl space-y-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Location Sector */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                        Domain Sector
                      </label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Search City"
                          value={pendingFilters.city}
                          onChange={(e) =>
                            handleFilterChange("city", e.target.value)
                          }
                          className="h-10 text-[11px] font-bold bg-[#0f4656]/5 border-0 rounded-[20px] px-4"
                        />
                        <select
                          value={pendingFilters.state}
                          onChange={(e) =>
                            handleFilterChange("state", e.target.value)
                          }
                          className="w-full h-10 px-4 py-2 bg-[#0f4656]/5 border-0 rounded-[20px] text-[#0f4656] text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                        >
                          <option value="">All States</option>
                          <option value="NY">New York</option>
                          <option value="FL">Florida</option>
                          <option value="CA">California</option>
                        </select>
                      </div>
                    </div>

                    {/* Financial Range */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                        Capital Bracket
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Minimum"
                          value={pendingFilters.minPrice || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "minPrice",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="h-10 text-[11px] font-bold bg-[#0f4656]/5 border-0 rounded-[20px] px-4"
                        />
                        <Input
                          type="number"
                          placeholder="Maximum"
                          value={
                            pendingFilters.maxPrice === 10000000
                              ? ""
                              : pendingFilters.maxPrice
                          }
                          onChange={(e) =>
                            handleFilterChange(
                              "maxPrice",
                              parseInt(e.target.value) || 10000000,
                            )
                          }
                          className="h-10 text-[11px] font-bold bg-[#0f4656]/5 border-0 rounded-[20px] px-4"
                        />
                      </div>
                    </div>

                    {/* Accommodation Units */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                        Bed Units
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleFilterChange("beds", num)}
                            className={cn(
                              "px-3 py-2 rounded-[20px] text-[10px] font-black uppercase transition-all min-w-[38px]",
                              pendingFilters.beds === num
                                ? "bg-[#ef864c] text-white shadow-lg shadow-[#ef864c]/20"
                                : "bg-[#0f4656]/5 text-[#0f4656]/60 hover:bg-[#0f4656]/10",
                            )}
                          >
                            {num === 0 ? "Any" : `${num}+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sanitization Units */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                        Bath Units
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleFilterChange("baths", num)}
                            className={cn(
                              "px-3 py-2 rounded-[20px] text-[10px] font-black uppercase transition-all min-w-[38px]",
                              pendingFilters.baths === num
                                ? "bg-[#ef864c] text-white shadow-lg shadow-[#ef864c]/20"
                                : "bg-[#0f4656]/5 text-[#0f4656]/60 hover:bg-[#0f4656]/10",
                            )}
                          >
                            {num === 0 ? "Any" : `${num}+`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Filter Terminal Actions */}
                  <div className="flex items-center gap-3 pt-6 border-t border-[#0f4656]/5">
                    <Button
                      onClick={applyFilters}
                      className="flex-1 h-12 rounded-[20px] bg-[#0f4656] hover:bg-[#155a6d] text-white font-black uppercase tracking-widest shadow-xl shadow-[#0f4656]/20 transition-all text-xs"
                    >
                      Apply Parameters
                    </Button>
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-32 h-12 border-2 border-[#0f4656]/10 text-[#0f4656] hover:bg-[#0f4656]/5 rounded-[20px] font-black uppercase tracking-widest transition-all text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Terminal */}
          <div className="md:hidden">
            <Button
              onClick={handleMobileFiltersToggle}
              variant="outline"
              className="w-full h-12 border-2 border-[#0f4656]/10 text-[#0f4656] rounded-[20px] font-black text-xs uppercase tracking-widest shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2 text-[#ef864c]" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-white rounded-[20px] px-2 py-0.5 text-[10px] font-black bg-[#ef864c]">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Filter Matrix */}
          <div className="md:hidden">
            {showFilters && (
              <div
                className="fixed inset-0 bg-[#0f4656]/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                onClick={handleMobileFiltersToggle}
              />
            )}

            <div
              className={cn(
                "p-6 bg-white rounded-l-[20px] border-l border-[#0f4656]/10 shadow-2xl transition-all duration-500 ease-out z-50 fixed inset-y-0 right-0 w-full max-w-sm h-screen overflow-y-auto",
                !showFilters && "translate-x-full",
                showFilters && "translate-x-0",
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#0f4656] uppercase tracking-tight">
                    Filters
                  </h3>
                  <p className="text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                    Parameter Configuration
                  </p>
                </div>
                <button
                  onClick={handleMobileFiltersToggle}
                  className="p-3 bg-[#0f4656]/5 text-[#0f4656]/60 hover:text-[#ef864c] rounded-[20px] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="w-full h-11 border-2 border-[#ef864c]/20 text-[#ef864c] hover:bg-[#ef864c]/5 rounded-[20px] font-black uppercase tracking-widest text-[10px]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All {activeFiltersCount} Items
                  </Button>
                )}

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                      Location Data
                    </label>
                    <Input
                      placeholder="City"
                      value={pendingFilters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="h-12 text-xs font-bold bg-[#0f4656]/5 border-0 rounded-[20px] px-4"
                    />
                    <select
                      value={pendingFilters.state}
                      onChange={(e) =>
                        handleFilterChange("state", e.target.value)
                      }
                      className="w-full h-12 px-4 bg-[#0f4656]/5 border-0 rounded-[20px] text-[#0f4656] text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-[#ef864c]/20 appearance-none"
                    >
                      <option value="">All States</option>
                      <option value="NY">New York</option>
                      <option value="FL">Florida</option>
                      <option value="CA">California</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                      Investment Sector
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={pendingFilters.minPrice || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "minPrice",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="h-12 text-xs font-bold bg-[#0f4656]/5 border-0 rounded-[20px] px-4"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={
                          pendingFilters.maxPrice === 10000000
                            ? ""
                            : pendingFilters.maxPrice
                        }
                        onChange={(e) =>
                          handleFilterChange(
                            "maxPrice",
                            parseInt(e.target.value) || 10000000,
                          )
                        }
                        className="h-12 text-xs font-bold bg-[#0f4656]/5 border-0 rounded-[20px] px-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40 px-1">
                      Accommodations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleFilterChange("beds", num)}
                          className={cn(
                            "px-4 py-2 rounded-[20px] text-[10px] font-black uppercase transition-all min-w-[50px]",
                            pendingFilters.beds === num
                              ? "bg-[#ef864c] text-white shadow-lg shadow-[#ef864c]/20"
                              : "bg-[#0f4656]/5 text-[#0f4656]/60",
                          )}
                        >
                          {num === 0 ? "Any" : `${num}+`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={applyFilters}
                  className="w-full h-14 rounded-[20px] bg-[#0f4656] text-white font-black uppercase tracking-widest shadow-xl shadow-[#0f4656]/20 transition-all text-xs"
                >
                  Deploy Configuration
                </Button>
              </div>
            </div>
          </div>

          {/* Property Matrix: Assets Listing */}
          <div className="pt-4">
            {viewMode === "grid" ? (
              <div className="flex flex-wrap gap-6 lg:gap-8 lg:justify-start">
                {sortedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-shrink-0 flex-grow-0"
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                {sortedProperties.map((property) => (
                  <PropertyListCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {sortedProperties.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[20px] border border-[#0f4656]/10 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f4656]/5 rounded-full -mr-32 -mt-32" />
                <div className="max-w-md mx-auto relative z-10 px-6">
                  <div className="w-20 h-20 rounded-[20px] bg-[#0f4656]/5 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Search className="w-8 h-8 text-[#0f4656]/20" />
                  </div>
                  <h3 className="text-xl font-black text-[#0f4656] mb-2 uppercase tracking-tight">
                    Zero Assets Found
                  </h3>
                  <p className="text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest leading-relaxed mb-8">
                    No properties match your current protocol criteria. Adjust
                    your analysis parameters to expand the search.
                  </p>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="h-12 px-8 border-2 border-[#ef864c] text-[#ef864c] hover:bg-[#ef864c]/5 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reset All Parameters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BuyerDashboardLayout>
  );
}

// Enhanced Multi-Dimensional Property Card
function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/real-estate/buyer/properties/${property.id}`}
      className="block h-full"
    >
      <Card className="w-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col group rounded-[20px] relative">
        {/* Image Module */}
        <div className="relative h-60 overflow-hidden bg-[#000]/5">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 341px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f4656]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Luxury Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {property.isFeatured && (
              <span className="inline-flex items-center gap-1.5 bg-[#ef864c] text-white px-3 py-1.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest shadow-xl">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
            <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest text-[#0f4656] shadow-xl">
              {property.status}
            </span>
          </div>

          <button className="absolute top-4 right-4 w-9 h-9 rounded-[20px] bg-white/90 backdrop-blur shadow-xl flex items-center justify-center hover:scale-110 transition-transform text-[#ef864c]">
            <Heart className="w-4 h-4 transition-colors" />
          </button>

          {/* Pricing Architecture */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/95 backdrop-blur rounded-[20px] px-4 py-2.5 shadow-xl border border-white/20 transform group-hover:-translate-y-1 transition-transform duration-500">
              <p className="text-xl lg:text-2xl font-black text-[#0f4656] tracking-tighter">
                ${(property.price / 1000000).toFixed(4)}M
              </p>
            </div>
          </div>
        </div>

        {/* Core Asset Information */}
        <div className="p-6 flex-1 flex flex-col bg-white space-y-5">
          <div className="space-y-1.5">
            <h3 className="font-black text-base lg:text-lg text-[#0f4656] line-clamp-2 leading-tight group-hover:text-[#ef864c] transition-colors">
              {property.title}
            </h3>
            <p className="text-[#0f4656]/50 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#ef864c]" />
              {property?.location?.slice(0, 35)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#0f4656]/5">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-[#0f4656] font-black text-xs">
                <Bed className="w-3.5 h-3.5 text-[#ef864c]" />
                {property.beds}
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter text-[#0f4656]/30">
                Beds
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-[#0f4656]/5">
              <div className="flex items-center gap-1.5 text-[#0f4656] font-black text-xs">
                <Bath className="w-3.5 h-3.5 text-[#ef864c]" />
                {property.baths}
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter text-[#0f4656]/30">
                Baths
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-[#0f4656] font-black text-xs">
                <Square className="w-3.5 h-3.5 text-[#ef864c]" />
                {property.sqft}
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter text-[#0f4656]/30">
                Sqft
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[20px] overflow-hidden shadow-sm ring-2 ring-[#0f4656]/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    property.seller.avatar &&
                    property.seller.avatar.startsWith("http")
                      ? property.seller.avatar
                      : "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                        property.seller.name
                  }
                  alt={property.seller.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-black text-[#0f4656] truncate uppercase tracking-tight">
                    {property.seller.name}
                  </p>
                  {property.seller.verificationStatus === "approved" && (
                    <span
                      className="inline-flex items-center"
                      title="Verified User"
                    >
                      <svg
                        className="w-6 h-6 text-blue-500 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-[#ef864c]">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {property.seller.rating.toFixed(1)}
                </div>
              </div>
            </div>
            <Button className="h-10 px-4 text-white bg-[#ef864c] hover:bg-[#d9723f] rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#ef864c]/20 transition-all flex-shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Cinematic List View Card Module
function PropertyListCard({ property }: { property: Property }) {
  return (
    <Link href={`/real-estate/buyer/properties/${property.id}`}>
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[20px] group relative bg-white">
        <div className="flex flex-col md:flex-row">
          {/* Visual Asset Module */}
          <div className="relative w-full md:w-96 h-64 md:h-80 overflow-hidden bg-[#0f4656]/5 flex-shrink-0">
            <Image
              src={property.image}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 384px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f4656]/40 via-transparent to-transparent group-hover:opacity-60 transition-opacity" />

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {property.isFeatured && (
                <span className="inline-flex items-center gap-1.5 bg-[#ef864c] text-white px-3 py-1.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest shadow-xl">
                  <Star className="w-3 h-3 fill-current" />
                  Featured Priority
                </span>
              )}
              <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-[20px] text-[9px] font-black uppercase tracking-widest text-[#0f4656] shadow-xl">
                {property.status}
              </span>
            </div>
          </div>

          {/* Intelligence & Metadata Module */}
          <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-xl lg:text-2xl font-black text-[#0f4656] tracking-tight group-hover:text-[#ef864c] transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-[#0f4656]/40 text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#ef864c]" />
                    {property.location}
                  </p>
                </div>
                <div className="bg-[#0f4656]/5 p-4 rounded-[20px] border border-[#0f4656]/5">
                  <p className="text-2xl lg:text-3xl font-black text-[#0f4656] tracking-tighter">
                    ${(property.price / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 py-6 border-y border-[#0f4656]/5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5 text-[#0f4656] font-black text-sm uppercase">
                    <Bed className="w-4 h-4 text-[#ef864c]" />
                    {property.beds}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#0f4656]/30 px-6">
                    Available Beds
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-x border-[#0f4656]/10 px-6">
                  <div className="flex items-center gap-2.5 text-[#0f4656] font-black text-sm uppercase">
                    <Bath className="w-4 h-4 text-[#ef864c]" />
                    {property.baths}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#0f4656]/30">
                    Full Baths
                  </span>
                </div>
                <div className="flex flex-col gap-1 px-6">
                  <div className="flex items-center gap-2.5 text-[#0f4656] font-black text-sm uppercase">
                    <Square className="w-4 h-4 text-[#ef864c]" />
                    {property.sqft}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#0f4656]/30">
                    Spatial Area
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] overflow-hidden shadow-md ring-4 ring-[#0f4656]/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        property.seller.avatar &&
                        property.seller.avatar.startsWith("http")
                          ? property.seller.avatar
                          : "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                            property.seller.name
                      }
                      alt={property.seller.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-[#0f4656] text-sm uppercase tracking-tight">
                        {property.seller.name}
                      </p>
                      <div className="bg-[#ef864c]/10 text-[#ef864c] px-2 py-0.5 rounded-[20px] text-[8px] font-black uppercase">
                        Verified Agent
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-[#ef864c] mt-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      {property.seller.rating.toFixed(1)} Rating Profile
                    </div>
                  </div>
                </div>
                <Button className="h-12 px-10 text-white bg-[#ef864c] hover:bg-[#d9723f] rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#ef864c]/20 transition-all flex items-center gap-3">
                  <MessageSquare className="w-4 h-4" />
                  Initiate Communication
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
