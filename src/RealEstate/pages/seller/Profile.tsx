"use client";

import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { Badge } from "@/RealEstate/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  Languages,
  User,
  Loader2,
  ExternalLink,
  ChevronRight,
  Star,
} from "lucide-react";
import { useGetSellerProfileQuery } from "@/services/redux/api/propertyApi";
import { cn } from "@/lib/utils";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop";

export default function SellerProfile() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } =
    useGetSellerProfileQuery("realestate_seller");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3 text-foreground/60">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "#ef864c" }}
            />
            <p>Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data?.profile) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8 max-w-2xl space-y-4">
          <Card className="p-6 rounded-[20px]">
            <h2 className="text-xl font-bold mb-2" style={{ color: "#0f4656" }}>
              Unable to load profile
            </h2>
            <p className="text-foreground/70 mb-4">
              Something went wrong while fetching your profile. Please try
              again.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Link href="/real-estate/seller/properties">
                <Button
                  className="text-white"
                  style={{ backgroundColor: "#ef864c" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#d9723f")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef864c")
                  }
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const profile = data.profile;
  const fullName =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    "Your Name";
  const specialization = profile.specialization || "Specialization not set";
  const bio =
    profile.bio ||
    "Add a professional bio to tell buyers more about your expertise and experience.";
  const agency = profile.agency || "Add your agency";
  const cityState =
    [profile.city, profile.state].filter(Boolean).join(", ") ||
    "Location not set";
  const languages = profile.languages?.length ? profile.languages : [];
  const certifications =
    profile.certifications || "Add your certifications and credentials.";
  const rating = profile.rating?.toFixed(1) ?? "0.0";
  const avatar = profile.avatar || DEFAULT_AVATAR;

  return (
    <DashboardLayout>
      <div className="p-3 lg:p-8 space-y-6 lg:space-y-10 max-w-[1400px] mx-auto font-sans">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 lg:space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#ef864c] font-black text-[9px] lg:text-xs uppercase tracking-[0.2em]">
              <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Professional Identity
            </div>
            <h1 className="text-xl lg:text-3xl font-black text-[#0f4656] tracking-tight leading-tight">
              My Profile
            </h1>
          </div>
          <Link href="/real-estate/seller/profile/edit">
            <Button className="w-full md:w-auto h-11 lg:h-12 px-6 rounded-[20px] bg-[#0f4656] hover:bg-[#155a6d] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#0f4656]/20 transition-all flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Modify Profile
            </Button>
          </Link>
        </div>

        {/* Elite Profile Overview Card */}
        <Card className="border-0 shadow-xl bg-white rounded-[20px] overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef864c]/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000" />

          <div className="p-5 lg:p-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-center">
              {/* Avatar Module */}
              <div className="flex flex-col items-center lg:items-start gap-4 flex-shrink-0">
                <div className="relative group/avatar">
                  <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-[20px] overflow-hidden border-4 border-white shadow-xl transition-transform duration-500 bg-[#0f4656]/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#ef864c] to-[#d9723f] p-2 lg:p-3 rounded-[20px] shadow- text-white">
                    <Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/real-estate/buyer/dashboard")}
                  className="w-full mt-1 h-9 lg:h-10 rounded-[20px] border-2 border-[#ef864c]/20 text-[#ef864c] bg-white hover:bg-[#ef864c]/5 font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-sm"
                  variant="outline"
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Switch to Buyer Mode
                </Button>
              </div>

              {/* Identity & Contact Stats */}
              <div className="flex-1 space-y-4 lg:space-y-6 text-center lg:text-left">
                <div className="space-y-1.5 lg:space-y-2">
                  <div className="flex flex-col md:flex-row items-center gap-3 justify-center lg:justify-start">
                    <h2 className="text-2xl lg:text-4xl font-black text-[#0f4656] tracking-tight">
                      {fullName}
                    </h2>
                    {data?.profile?.verificationStatus === "approved" && (
                      // <div
                      //   className="bg-blue-500/10 text-blue-600 p-1.5 lg:p-2 rounded-xl lg:rounded-2xl"
                      //   shadow-sm
                      // >
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
                      // </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 lg:gap-3">
                    <Badge className="bg-[#ef864c]/10 text-[#ef864c] border-0 font-black text-[9px] lg:text-[10px] px-2.5 py-1 uppercase tracking-widest rounded-[20px]">
                      {specialization}
                    </Badge>
                    <div className="flex items-center gap-1 text-[#0f4656] font-black">
                      <span className="text-lg lg:text-xl">{rating}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3 h-3 lg:w-3.5 h-3.5 fill-current",
                              i >= Math.floor(Number(rating)) &&
                                "text-slate-200",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-5 pt-5 lg:pt-6 border-t border-[#0f4656]/5">
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 text-[#0f4656]/60">
                    <div className="p-2 bg-[#0f4656]/5 rounded-[20px] text-[#0f4656]">
                      <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </div>
                    <span className="text-[11px] lg:text-sm font-bold">
                      {profile.email}
                    </span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center justify-center lg:justify-start gap-2.5 text-[#0f4656]/60">
                      <div className="p-2 bg-[#0f4656]/5 rounded-[20px] text-[#0f4656]">
                        <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </div>
                      <span className="text-[11px] lg:text-sm font-bold">
                        {profile.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 text-[#0f4656]/60">
                    <div className="p-2 bg-[#0f4656]/5 rounded-[20px] text-[#0f4656]">
                      <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </div>
                    <span className="text-[11px] lg:text-sm font-bold">
                      {cityState}
                    </span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 text-[#0f4656]/60">
                    <div className="p-2 bg-[#0f4656]/5 rounded-[20px] text-[#0f4656]">
                      <Building2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </div>
                    <span className="text-[11px] lg:text-sm font-bold">
                      {agency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* High-Impact Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
          <Card className="border-0 shadow-lg bg-white rounded-[20px] p-6 lg:p-8 hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
            <div className="absolute bottom-0 right-0 p-6 text-[#0f4656]/5 group-hover:scale-125 transition-transform duration-1000">
              <Building2 className="w-16 h-16 lg:w-20 lg:h-20" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <div className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                Active Listings
              </div>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-3xl lg:text-4xl font-black text-[#0f4656] tracking-tighter">
                  {profile.totalProperties}
                </span>
                <span className="text-[9px] font-black text-[#0f4656]/30 uppercase tracking-tighter">
                  Properties
                </span>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-[20px] p-6 lg:p-8 hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
            <div className="absolute bottom-0 right-0 p-6 text-[#0f4656]/5 group-hover:scale-125 transition-transform duration-1000">
              <User className="w-16 h-16 lg:w-20 lg:h-20" />
            </div>
            <div className="space-y-2  text-center md:text-left">
              <div className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                Client Engagement
              </div>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-3xl lg:text-4xl font-black text-[#0f4656] tracking-tighter">
                  {(profile.totalViews || 0).toLocaleString()}
                </span>
                <span className="text-[9px] font-black text-[#0f4656]/30 uppercase tracking-tighter">
                  Total Views
                </span>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-[20px] p-6 lg:p-8 hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
            <div className="absolute bottom-0 right-0 p-6 text-[#ef864c]/10 group-hover:scale-125 transition-transform duration-1000">
              <Award className="w-16 h-16 lg:w-20 lg:h-20" />
            </div>
            <div className="space-y-2  text-center md:text-left">
              <div className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                Reputation Score
              </div>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-3xl lg:text-4xl font-black text-[#ef864c] tracking-tighter">
                  {rating}
                </span>
                <span className="text-[9px] font-black text-[#0f4656]/30 uppercase tracking-tighter">
                  Gold Standard
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Expert Information Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white rounded-[20px] p-6 lg:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-6 bg-[#ef864c]" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40">
                Professional Trajectory
              </h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-lg lg:text-xl font-black text-[#0f4656]">
                  Expert Bio
                </h3>
                <p className="text-xs lg:text-sm font-bold text-[#0f4656]/70 leading-relaxed text-justify">
                  {bio}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#0f4656]/5">
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black uppercase tracking-[1.5px] text-[#ef864c]">
                    Domain Expertise
                  </h4>
                  <div className="text-sm lg:text-base font-black text-[#0f4656]">
                    {specialization}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black uppercase tracking-[1.5px] text-[#ef864c]">
                    Represented Agency
                  </h4>
                  <div className="text-sm lg:text-base font-black text-[#0f4656]">
                    {agency}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-5 lg:space-y-8">
            <Card className="border-0 shadow-xl bg-white rounded-[20px] p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#ef864c]" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40">
                  Accreditations
                </h3>
              </div>
              <p className="text-xs lg:text-sm font-bold text-[#0f4656]/70 leading-relaxed">
                {certifications}
              </p>
            </Card>

            <Card className="border-0 shadow-xl bg-white rounded-[20px] p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <Languages className="w-4 h-4 text-[#ef864c]" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40">
                  Languages
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.length ? (
                  languages.map((lang, index) => (
                    <Badge
                      key={`${lang}-${index}`}
                      className="bg-[#0f4656]/5 text-[#0f4656] border-0 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-[20px] transition-all hover:bg-[#ef864c]/10 hover:text-[#ef864c]"
                    >
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[9px] font-bold text-[#0f4656]/30 uppercase tracking-widest">
                    Protocol Offline: Add Proficiency
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Global Action Banner */}
        <Card className="border-0 shadow-xl bg-[#ef864c] rounded-[20px] p-6 lg:p-10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-1000" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1.5">
              <h3 className="text-lg lg:text-2xl font-black text-white tracking-tight">
                Expand Your Digital Presence
              </h3>
              <p className="text-xs lg:text-sm font-bold text-white/70 max-w-xl">
                Maintain an elite profile to command higher authority and lead
                conversions across the market index.
              </p>
            </div>
            <Link href="/real-estate/seller/profile/edit">
              <Button className="h-11 lg:h-12 px-8 rounded-[20px] bg-white text-[#ef864c] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all text-[10px] lg:text-xs">
                Initiate Optimization
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
