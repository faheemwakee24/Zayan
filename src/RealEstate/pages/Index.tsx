"use client";

import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import { Button } from "@/RealEstate/components/ui/button";
import { Card } from "@/RealEstate/components/ui/card";
import { Input } from "@/RealEstate/components/ui/input";
import {
  Star,
  MapPin,
  Bed,
  Bath,
  Square,
  ChevronRight,
  Users,
  TrendingUp,
  MessageSquare,
  Shield,
  Clock,
  Home,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Award,
  BadgeCheck,
  Calendar,
  User,
  Instagram,
  Send,
  Twitter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  useGetBuyerPropertiesQuery,
  useGetTopSellersQuery,
} from "@/services/redux/api/propertyApi";
import { useGetBlogsQuery } from "@/services/redux/api/blogApi";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/routeProtection";
import { TrendingItems, RecentlyViewed } from "@/components/marketplace";

export default function Index() {
  const router = useRouter();
  const [isVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    properties: 0,
    users: 0,
    sold: 0,
  });
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Search and filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Pending search term
  const [filters, setFilters] = useState({
    // Pending filters (what user is editing)
    city: "",
    state: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
  });

  // Applied filters (used for filtering)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    city: "",
    state: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
  });

  // Check authentication state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticatedUser(isAuthenticated());
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
        }
      });
    }, observerOptions);

    const refs = sectionRefs.current;
    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // Animated stats counter
  useEffect(() => {
    const targets = { properties: 50000, users: 100000, sold: 2000 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        properties: Math.floor(targets.properties * easeOutQuart),
        users: Math.floor(targets.users * easeOutQuart),
        sold: Math.floor(targets.sold * easeOutQuart * 10) / 10,
      });

      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const topCities = [
    {
      name: "New York City",
      properties: "12,450",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      name: "Los Angeles",
      properties: "8,920",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
    {
      name: "Miami",
      properties: "6,230",
      image:
        "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&h=300&fit=crop",
    },
    {
      name: "Chicago",
      properties: "5,680",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "List Your Property",
      description:
        "Create a comprehensive listing with photos, details, and pricing information.",
      icon: Home,
    },
    {
      step: "2",
      title: "Browse & Search",
      description:
        "Use advanced filters to find properties matching your criteria and location.",
      icon: Building2,
    },
    {
      step: "3",
      title: "Connect with Agents",
      description:
        "Message sellers or buyers directly through our secure messaging platform.",
      icon: MessageSquare,
    },
  ];

  const whyChooseUs = [
    {
      title: "Verified Listings",
      description: "All properties are verified and authenticated by our team.",
      icon: Shield,
    },
    {
      title: "Fast Process",
      description: "Our streamlined process gets your property sold faster.",
      icon: TrendingUp,
    },
    {
      title: "24/7 Support",
      description: "Our dedicated support team is always available to help.",
      icon: Clock,
    },
    {
      title: "Professional Network",
      description: "Connect with top agents and investors in your area.",
      icon: Users,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Property Buyer",
      text: "Found my dream home through RealeState in just 3 weeks! The platform is so easy to use and the agents are incredibly helpful.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Real Estate Agent",
      text: "The best platform I've used for listing properties. My clients love the modern interface and detailed property analytics.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Property Seller",
      text: "Sold my apartment faster than expected. The tools and support provided by RealeState made the entire process smooth.",
      rating: 5,
    },
  ];

  // Fetch properties for hero section and featured properties
  const { data: propertiesData, isLoading: propertiesLoading } =
    useGetBuyerPropertiesQuery({
      sortBy: "views",
      order: "desc",
    });
  const heroProperty = propertiesData?.properties?.[0];
  const allProperties = propertiesData?.properties || [];

  // Fetch top sellers (first 3 high rating)
  const { data: topSellersData, isLoading: topSellersLoading } =
    useGetTopSellersQuery({
      role: "realEstateSeller",
      limit: 3,
    });
  const topSellers = topSellersData?.sellers || [];

  // Fetch latest blogs - only Real Estate blogs
  const { data: blogsData, isLoading: isBlogsLoading } = useGetBlogsQuery({
    page: 1,
    limit: 3,
    type: "real-estate", // Filter only Real Estate blogs
  });

  // Filter properties locally based on applied search and filters
  const featuredProperties = useMemo(() => {
    let filtered = [...allProperties];

    // Apply search term filter
    if (appliedSearchTerm) {
      const searchLower = appliedSearchTerm.toLowerCase();
      filtered = filtered.filter((property) => {
        const title = (property.title || "").toLowerCase();
        const description = (property.description || "").toLowerCase();
        const city = (property.city || "").toLowerCase();
        const state = (property.state || "").toLowerCase();
        const location = (property.location || "").toLowerCase();

        return (
          title.includes(searchLower) ||
          description.includes(searchLower) ||
          city.includes(searchLower) ||
          state.includes(searchLower) ||
          location.includes(searchLower)
        );
      });
    }

    // Apply location filters
    if (appliedFilters.city) {
      filtered = filtered.filter((property) =>
        (property.city || "")
          .toLowerCase()
          .includes(appliedFilters.city.toLowerCase()),
      );
    }

    if (appliedFilters.state) {
      filtered = filtered.filter(
        (property) =>
          (property.state || "").toUpperCase() ===
          appliedFilters.state.toUpperCase(),
      );
    }

    // Apply price filters
    if (appliedFilters.minPrice) {
      const minPrice = parseInt(appliedFilters.minPrice);
      filtered = filtered.filter(
        (property) => (property.price || 0) >= minPrice,
      );
    }

    if (appliedFilters.maxPrice) {
      const maxPrice = parseInt(appliedFilters.maxPrice);
      filtered = filtered.filter(
        (property) => (property.price || 0) <= maxPrice,
      );
    }

    // Apply beds filter
    if (appliedFilters.beds) {
      const beds = parseInt(appliedFilters.beds);
      filtered = filtered.filter((property) => (property.beds || 0) >= beds);
    }

    // Apply baths filter
    if (appliedFilters.baths) {
      const baths = parseInt(appliedFilters.baths);
      filtered = filtered.filter((property) => (property.baths || 0) >= baths);
    }

    return filtered;
  }, [allProperties, appliedSearchTerm, appliedFilters]);

  // Handle search - apply pending filters
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilters(filters);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      city: "",
      state: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
    });
    setAppliedSearchTerm("");
    setAppliedFilters({
      city: "",
      state: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
    });
  };

  return (
    <LandingLayout>
      {/* Hero Section - Redesigned to match image */}
      <section
        className="relative min-h-screen overflow-hidden flex items-center"
        style={{ backgroundColor: "#0f4656" }}
      >
        <div className="relative container mx-auto px-4 py-8 md:py-16 w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left - Tagline, Description, Follow Us & Introduction Card */}
            <div
              ref={(el) => {
                sectionRefs.current[0] = el;
              }}
              className="lg:col-span-7 space-y-8 flex flex-col justify-center"
            >
              {/* Main Tagline */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  <span className="block mb-2">Find Your Perfect Home</span>
                  <span className="block mb-2 text-[#ef864c]">or Sell</span>
                  <span className="block text-[#ef864c]">with Confidence</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Whether you&apos;re looking to buy your dream home or sell
                  your property, we&apos;re here to help. Connect with top real
                  estate professionals, explore thousands of verified listings,
                  and make your property goals a reality.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-1 bg-[#ef864c] hover:bg-[#d9723f] text-white rounded-lg py-3 px-6 sm:py-6 sm:px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => {
                    if (isAuthenticatedUser) {
                      router.push("/real-estate/buyer/properties");
                    } else {
                      router.push("/signup");
                    }
                  }}
                >
                  <Search className="w-5 h-5" />
                  Explore Properties
                </Button>
                <Button
                  className="flex-1 bg-white hover:bg-white/90 text-[#0f4656] border-2 border-white rounded-lg py-3 px-6 sm:py-6 sm:px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => {
                    if (isAuthenticatedUser) {
                      router.push("/real-estate/seller/properties/add");
                    } else {
                      router.push("/signup");
                    }
                  }}
                >
                  <Building2 className="w-5 h-5" />
                  List Your Property
                </Button>
              </div>

              {/* Introduction Card */}
              <Card className="bg-[#0f4656] border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-white text-xl font-semibold mb-4">
                  About Us
                </h3>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  Your Premier Real Estate Marketplace
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Join thousands of buyers and sellers who trust our platform
                  for all their real estate needs. We provide comprehensive
                  tools and support for both property seekers and sellers.
                </p>
              </Card>
            </div>

            {/* Right - Property Showcase Card */}
            <div
              ref={(el) => {
                sectionRefs.current[1] = el;
              }}
              className="lg:col-span-5"
            >
              {heroProperty && !propertiesLoading ? (
                <Link
                  href={`/real-estate/buyer/properties/${heroProperty._id || heroProperty.id}`}
                >
                  <Card className="bg-[#c7c7c7]/90 hover:bg-[#c7c7c7] transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group">
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={
                          heroProperty.images?.[0] ||
                          heroProperty.image ||
                          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                        }
                        alt={heroProperty.title || "Property"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-black mb-3">
                        {heroProperty.title || "Seaside Serenity Villa"}
                      </h3>
                      <p className="text-black/80 text-sm mb-4 line-clamp-2">
                        A stunning 4-bedroom, 3-bathroom villa in a peaceful
                        suburban neighborhood...{" "}
                        <span className="text-[#ef864c] font-semibold cursor-pointer hover:underline">
                          Read More
                        </span>
                      </p>
                      <div className="flex items-center gap-6 mb-6 text-black/70 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-5 h-5" />
                          <span>{heroProperty.beds || 4}-Bedroom</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-5 h-5" />
                          <span>{heroProperty.baths || 3}-Bathroom</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Home className="w-5 h-5" />
                          <span>Villa</span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-[#ef864c] hover:bg-[#ef864c]/90 text-white rounded-lg py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(
                            `/real-estate/buyer/properties/${heroProperty._id || heroProperty.id}`,
                          );
                        }}
                      >
                        View Property Details
                      </Button>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="bg-[#c7c7c7]/90 hover:bg-[#c7c7c7] transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group">
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                      alt="Property"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-black mb-3">
                      Seaside Serenity Villa
                    </h3>
                    <p className="text-black/80 text-sm mb-4 line-clamp-2">
                      A stunning 4-bedroom, 3-bathroom villa in a peaceful
                      suburban neighborhood...{" "}
                      <span className="text-[#ef864c] font-semibold cursor-pointer hover:underline">
                        Read More
                      </span>
                    </p>
                    <div className="flex items-center gap-6 mb-6 text-black/70 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-5 h-5" />
                        <span>4-Bedroom</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-5 h-5" />
                        <span>3-Bathroom</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Home className="w-5 h-5" />
                        <span>Villa</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#ef864c] hover:bg-[#ef864c]/90 text-white rounded-lg py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() =>
                        router.push("/real-estate/buyer/properties")
                      }
                    >
                      View Property Details
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Properties Section */}
      <section
        ref={(el) => {
          sectionRefs.current[2] = el;
        }}
        className="py-24 bg-gradient-to-b from-white to-background/50 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                Premium Listings
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Featured Properties
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto">
              Handpicked premium listings for our discerning buyers
            </p>
          </div>

          {/* Search Container */}
          <Card className="mb-12 p-6 bg-white shadow-lg border-2 border-border/50">
            <div className="space-y-4">
              {/* Search Bar Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <Input
                    placeholder="Search by property name, location, or features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-12 pr-4 py-3 text-base border-border focus:ring-2 focus:ring-primary h-12"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-12 px-8 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: "#ef864c" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d9723f")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef864c")
                  }
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filters Row */}
              {showFilters && (
                <div className="pt-4 border-t border-border/50 space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Location - City */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        City
                      </label>
                      <Input
                        placeholder="Enter city"
                        value={filters.city}
                        onChange={(e) =>
                          handleFilterChange("city", e.target.value)
                        }
                        className="h-10"
                      />
                    </div>

                    {/* Location - State */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        State
                      </label>
                      <select
                        value={filters.state}
                        onChange={(e) =>
                          handleFilterChange("state", e.target.value)
                        }
                        className="w-full h-10 px-3 py-2 border border-border rounded-lg bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">All States</option>
                        <option value="NY">New York</option>
                        <option value="FL">Florida</option>
                        <option value="CA">California</option>
                        <option value="MA">Massachusetts</option>
                        <option value="CO">Colorado</option>
                        <option value="TX">Texas</option>
                        <option value="WA">Washington</option>
                      </select>
                    </div>

                    {/* Price Range - Min */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Min Price
                      </label>
                      <Input
                        type="number"
                        placeholder="Min price"
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        className="h-10"
                      />
                    </div>

                    {/* Price Range - Max */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Max Price
                      </label>
                      <Input
                        type="number"
                        placeholder="Max price"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bedrooms */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Bedrooms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() =>
                              handleFilterChange(
                                "beds",
                                num === 0 ? "" : num.toString(),
                              )
                            }
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                              filters.beds === (num === 0 ? "" : num.toString())
                                ? "text-white shadow-md"
                                : "bg-foreground/5 hover:bg-foreground/10 text-foreground",
                            )}
                            style={
                              filters.beds === (num === 0 ? "" : num.toString())
                                ? { backgroundColor: "#ef864c" }
                                : {}
                            }
                          >
                            {num === 0 ? "Any" : `${num}+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Bathrooms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            onClick={() =>
                              handleFilterChange(
                                "baths",
                                num === 0 ? "" : num.toString(),
                              )
                            }
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                              filters.baths ===
                                (num === 0 ? "" : num.toString())
                                ? "text-white shadow-md"
                                : "bg-foreground/5 hover:bg-foreground/10 text-foreground",
                            )}
                            style={
                              filters.baths ===
                              (num === 0 ? "" : num.toString())
                                ? { backgroundColor: "#ef864c" }
                                : {}
                            }
                          >
                            {num === 0 ? "Any" : `${num}+`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="border-border text-foreground hover:bg-foreground/5"
                    >
                      Reset Filters
                    </Button>
                    <Button
                      onClick={handleSearch}
                      className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{ backgroundColor: "#ef864c" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#d9723f")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ef864c")
                      }
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {propertiesLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-72 overflow-hidden bg-foreground/5 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-foreground/10 rounded animate-pulse" />
                    <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                    <div className="h-8 bg-foreground/10 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => {
                const mainImage =
                  property.images?.[0] ||
                  property.image ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop";
                const propertyId = property._id || property.id;
                const propertyLocation =
                  property.location ||
                  `${property.city || ""}${property.city && property.state ? ", " : ""}${property.state || ""}`.trim() ||
                  "Location not specified";

                return (
                  <Link
                    key={propertyId}
                    href={`/real-estate/buyer/properties/${propertyId}`}
                    className="group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group h-full flex flex-col border-2 border-transparent hover:border-primary/20 hover:-translate-y-2 bg-white">
                      <div className="relative h-72 overflow-hidden bg-foreground/5">
                        <Image
                          src={mainImage}
                          alt={property.title || "Property"}
                          fill
                          className="object-cover group-hover:scale-125 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {property.status && (
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-primary shadow-lg group-hover:scale-110 transition-transform duration-300 capitalize">
                            {property.status}
                          </div>
                        )}
                        {property.isFeatured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-accent to-accent/80 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg animate-pulse group-hover:animate-none">
                            <Star className="w-4 h-4 fill-white" />
                            Featured
                          </div>
                        )}

                        {/* View indicator on hover */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full text-sm font-semibold text-primary shadow-xl flex items-center gap-2">
                            View Details
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col bg-white">
                        <h3
                          className="text-xl font-bold mb-2 transition-colors duration-300 line-clamp-2"
                          style={{ color: "#0f4656" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#ef864c")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#0f4656")
                          }
                        >
                          {property.title || "Property"}
                        </h3>
                        <p className="text-foreground/60 text-sm mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                          <span>{propertyLocation?.slice(0, 40)}</span>
                        </p>

                        <p
                          className="text-3xl md:text-4xl font-bold mb-4"
                          style={{ color: "#ef864c" }}
                        >
                          ${property.price?.toLocaleString() || "0"}
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border/50 text-sm text-foreground/60">
                          <div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-secondary/5 group-hover:bg-secondary/10 transition-colors">
                            <Bed className="w-4 h-4 text-secondary flex-shrink-0" />
                            <span>{property.beds || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-secondary/5 group-hover:bg-secondary/10 transition-colors">
                            <Bath className="w-4 h-4 text-secondary flex-shrink-0" />
                            <span>{property.baths || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-center p-2 rounded-lg bg-secondary/5 group-hover:bg-secondary/10 transition-colors">
                            <Square className="w-4 h-4 text-secondary flex-shrink-0" />
                            <span>
                              {property.sqft?.toLocaleString() || "0"} sqft
                            </span>
                          </div>
                        </div>

                        <Button
                          className="w-full text-white mt-auto shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          style={{ backgroundColor: "#ef864c" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#d9723f")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ef864c")
                          }
                        >
                          View Details
                          <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No featured properties available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-16 animate-fade-in-up">
            <Link
              href="/real-estate/buyer/properties"
              className="group inline-block"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group-hover:gap-3 px-8"
              >
                Browse All Properties
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Top Cities Section */}
      <section
        ref={(el) => {
          sectionRefs.current[3] = el;
        }}
        className="py-24 bg-gradient-to-b from-background via-white to-background relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                Hot Markets
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Explore Top Cities
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto">
              Find properties in America&apos;s most desirable locations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCities.map((city, index) => (
              <Link
                key={index}
                href={`/real-estate/buyer/properties?city=${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "group relative h-80 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up border-2 border-transparent hover:border-primary/20",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-125 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-500" />

                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.3)_100%)]" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-0 group-hover:translate-y-[-10px] transition-transform duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold group-hover:text-accent transition-colors duration-300">
                      {city.name}
                    </h3>
                    <Building2 className="w-6 h-6 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <p className="text-white/90 text-lg font-semibold group-hover:text-white transition-colors">
                    {city.properties} properties
                  </p>
                  {/* Hover indicator */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-sm text-accent font-semibold">
                    Explore{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section
        ref={(el) => {
          sectionRefs.current[4] = el;
        }}
        className="py-24 bg-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-secondary/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                Simple Process
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto">
              Simple steps to buy, sell, or manage properties
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {howItWorks.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="relative group animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex flex-col items-center text-center p-8 rounded-3xl hover:bg-gradient-to-br from-primary/5 to-secondary/5 transition-all duration-500 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-primary/10">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon container */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative">
                      <IconComponent className="w-10 h-10 text-white z-10" />
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                    </div>

                    <h3
                      className="text-2xl md:text-3xl font-bold mb-3 transition-colors duration-300"
                      style={{ color: "#0f4656" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ef864c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#0f4656")
                      }
                    >
                      {item.title}
                    </h3>
                    <p className="text-foreground/60 leading-relaxed max-w-xs">
                      {item.description}
                    </p>
                  </div>

                  {/* Connector line */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-1 bg-gradient-to-r from-secondary/50 to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Why Choose Us Section */}
      <section
        ref={(el) => {
          sectionRefs.current[5] = el;
        }}
        className="py-24 text-white relative overflow-hidden"
        style={{ backgroundColor: "#0f4656" }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                Trusted Platform
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Why Choose RealeState
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              The most trusted platform for real estate transactions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs?.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/10 hover:border-white/30 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section
        ref={(el) => {
          sectionRefs.current[6] = el;
        }}
        className="py-24 bg-gradient-to-b from-white via-background/50 to-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                Client Reviews
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              What Our Users Say
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto">
              Join thousands of happy buyers and sellers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 group bg-white animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Quote icon */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-2xl text-primary">&quot;</span>
                </div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-accent text-accent group-hover:scale-110 transition-transform duration-300"
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
                <p className="text-foreground/70 mb-6 leading-relaxed text-lg group-hover:text-foreground transition-colors duration-300 relative">
                  {testimonial.text}
                </p>
                <div className="border-t border-border/50 pt-4 group-hover:border-primary/20 transition-colors duration-300">
                  <p
                    className="font-bold text-lg transition-colors duration-300"
                    style={{ color: "#0f4656" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef864c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#0f4656")
                    }
                  >
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Blog Section */}
      <section
        ref={(el) => {
          sectionRefs.current[7] = el;
        }}
        className="py-24 bg-gradient-to-b from-background to-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                Expert Insights
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold mb-4 p-2"
              style={{ color: "#0f4656" }}
            >
              Blogs & Articles
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto">
              Expert tips and real estate market trends
            </p>
          </div>

          {isBlogsLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden border border-border animate-pulse"
                >
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogsData?.blogs && blogsData.blogs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {blogsData.blogs.slice(0, 3).map((blog, index) => {
                const formatDate = (dateString: string | null) => {
                  if (!dateString) return "";
                  const date = new Date(dateString);
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                };

                const calculateReadTime = (excerpt?: string) => {
                  const text = excerpt || "";
                  if (!text) return "1 min read";
                  const words = text.split(/\s+/).length;
                  const minutes = Math.ceil(words / 200) || 1;
                  return `${minutes} min read`;
                };

                return (
                  <Link
                    key={blog._id}
                    href={`/real-estate/blog/${blog.slug}`}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col border-2 border-transparent hover:border-primary/20 hover:-translate-y-2 bg-white">
                      <div className="relative h-56 overflow-hidden bg-foreground/5">
                        {blog.featuredImage ? (
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-125 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
                            🏠
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Date badge */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {formatDate(blog.publishedAt)}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col bg-white">
                        <div className="flex items-center gap-3 text-xs text-foreground/60 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(blog.publishedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {calculateReadTime(blog.excerpt)}
                          </div>
                        </div>
                        <h3
                          className="text-xl font-bold mb-3 transition-colors duration-300 line-clamp-2"
                          style={{ color: "#0f4656" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#ef864c")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#0f4656")
                          }
                        >
                          {blog.title}
                        </h3>
                        <p className="text-foreground/60 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center text-secondary font-semibold group-hover:text-primary transition-colors duration-300 pt-4 border-t border-border/50">
                          Read More
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground/60">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Sellers Section */}
      <section
        ref={(el) => {
          sectionRefs.current[8] = el;
        }}
        className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden border-t border-border/50"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm border border-primary/20">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                Top Performers
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "#0f4656" }}
            >
              Top Sellers & Agents
            </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto">
              Connect with our most trusted and successful real estate
              professionals
            </p>
          </div>

          {topSellersLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-64 overflow-hidden bg-foreground/5 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-foreground/10 rounded animate-pulse" />
                    <div className="h-4 bg-foreground/10 rounded animate-pulse" />
                    <div className="h-8 bg-foreground/10 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : topSellers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topSellers.slice(0, 3).map((seller, index) => {
                const sellerName =
                  seller.name ||
                  `${seller.firstName || ""} ${seller.lastName || ""}`.trim() ||
                  "Unknown";
                const sellerAvatar =
                  seller.avatar || sellerName?.charAt(0) || "U";
                const sellerId = seller._id || `seller-${index}`;
                const sellerRating = Math.round(seller.rating || 0);
                const totalProperties = seller.totalProperties || 0;
                const sellerLocation =
                  seller.city && seller.state
                    ? `${seller.city}, ${seller.state}`
                    : seller.city || seller.state || "";

                return (
                  <Link
                    key={sellerId}
                    href={`/real-estate/buyer/seller-profile/${sellerId}`}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 bg-white h-full flex flex-col">
                      {/* Profile Image */}
                      <div className="relative h-64 overflow-hidden bg-foreground/5">
                        {sellerAvatar &&
                        (sellerAvatar.startsWith("http") ||
                          sellerAvatar.startsWith("https") ||
                          sellerAvatar.startsWith("data:")) ? (
                          <Image
                            src={sellerAvatar}
                            alt={sellerName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">
                              {sellerAvatar}
                            </span>
                          </div>
                        )}
                        {/* Verified Badge - Always show for top sellers */}
                        <div className="absolute top-4 right-4 bg-gradient-to-br from-primary to-secondary rounded-full p-2 shadow-lg">
                          <BadgeCheck className="w-5 h-5 text-white" />
                        </div>
                        {/* Top Seller Badge */}
                        <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <Award className="w-3 h-3" />
                          Top Seller
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      <div className="p-6 flex-1 flex flex-col bg-white">
                        {/* Name and Rating */}
                        <div className="mb-3">
                          <h3
                            className="text-xl font-bold mb-1 transition-colors"
                            style={{ color: "#0f4656" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#ef864c")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "#0f4656")
                            }
                          >
                            {sellerName}
                          </h3>
                          <p className="text-sm text-foreground/60 mb-2">
                            {seller.specialization || "Real Estate Agent"}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({
                                length: Math.min(sellerRating, 5),
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-accent text-accent"
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-primary">
                              ({seller.rating?.toFixed(1) || "0.0"})
                            </span>
                            {seller.reviews > 0 && (
                              <span className="text-xs text-foreground/60">
                                ({seller.reviews} reviews)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        {sellerLocation && (
                          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-4">
                            <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="truncate">{sellerLocation}</span>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border/50">
                          <div>
                            <p className="text-2xl font-bold text-primary mb-0.5">
                              {totalProperties}+
                            </p>
                            <p className="text-xs text-foreground/60">
                              Properties
                            </p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary mb-0.5">
                              {seller.reviews || 0}
                            </p>
                            <p className="text-xs text-foreground/60">
                              Reviews
                            </p>
                          </div>
                        </div>

                        {/* Contact Button */}
                        <Button
                          className="w-full text-white mt-auto shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          style={{ backgroundColor: "#ef864c" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#d9723f")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ef864c")
                          }
                        >
                          Contact Agent
                          <MessageSquare className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No top sellers available at the moment.</p>
            </div>
          )}

          {/* View All Button */}
          <div
            className="text-center mt-12 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link
              href="/real-estate/seller/dashboard"
              className="group inline-block"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group-hover:gap-3 px-8"
              >
                Step in to RealEstate
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section
        ref={(el) => {
          sectionRefs.current[8] = el;
        }}
        className="py-24 text-white relative overflow-hidden"
        style={{ backgroundColor: "#0f4656" }}
      >
        {/* Enhanced animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-float-slow"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl animate-pulse" />

          {/* Grid pattern overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="cta-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>

        <div className="relative container mx-auto px-4 text-center z-10 animate-fade-in-up">
          <div className="inline-block mb-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              Get Started Today
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users finding their perfect properties on
            RealeState today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/signup?role=buyer" className="group">
              <Button
                size="lg"
                className="bg-white hover:bg-white/95 w-full sm:w-auto px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300 group-hover:gap-3"
                style={{ color: "#0f4656" }}
              >
                Start Searching Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/signup?role=seller" className="group">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-white/10 w-full sm:w-auto px-8 py-6 text-lg font-semibold backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
