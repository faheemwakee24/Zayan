"use client";

import { useEffect } from "react";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  User,
  Shield,
  Globe,
  Store,
} from "lucide-react";
import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import { BuyerDashboardLayout } from "@/RealEstate/components/BuyerDashboardLayout";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import { Loader2 } from "lucide-react";

export default function BuyerProfile() {
  const { data, isLoading, isError, refetch } =
    useGetCurrentUserQuery("realestate_buyer");
  const user = data?.user;

  // Refetch when component mounts to ensure fresh data after navigation
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <LandingLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-foreground/60">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "#ef864c" }}
            />
            <p>Loading profile...</p>
          </div>
        </div>
      </LandingLayout>
    );
  }

  // Error state
  if (isError || !user) {
    return (
      <LandingLayout>
        <div className="min-h-screen bg-background">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-red-700 mb-2">
                Error loading profile
              </h3>
              <p className="text-red-600 mb-4">
                Unable to load your profile. Please try again.
              </p>
              <Link href="/real-estate/buyer/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

  return (
    <BuyerDashboardLayout>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Link
            href="/real-estate/buyer/dashboard"
            className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:translate-x-[-4px]"
            style={{ color: "#ef864c" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>

          {/* Profile Header */}
          <Card className="p-6 lg:p-10 border-0 shadow-2xl bg-white rounded-[24px] lg:rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef864c]/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000" />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 ">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatar &&
                (user.avatar.startsWith("http") ||
                  user.avatar.startsWith("https") ||
                  user.avatar.startsWith("data:")) ? (
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4"
                    style={{ borderColor: "#ef864c40" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      key={user.avatar} // Force re-render when avatar changes
                    />
                  </div>
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center border-4"
                    style={{
                      backgroundColor: "#ef864c",
                      borderColor: "#ef864c40",
                    }}
                  >
                    <span className="text-5xl font-black text-white">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <h1
                    className="text-3xl lg:text-4xl font-black tracking-tight"
                    style={{ color: "#0f4656" }}
                  >
                    {user.name}
                  </h1>
                  {user.verificationStatus === "approved" && (
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
                <p className="text-foreground/60 mb-4">{user.email}</p>

                {user.bio && (
                  <p className="text-foreground/70 mb-4">{user.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-sm">
                  {user.location && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <MapPin
                        className="w-4 h-4"
                        style={{ color: "#ef864c" }}
                      />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.joinDate && (
                    <div className="flex items-center gap-2 text-foreground/60">
                      <Calendar
                        className="w-4 h-4"
                        style={{ color: "#ef864c" }}
                      />
                      <span>{user.joinDate}</span>
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex flex-col gap-3">
                <Link href="/real-estate/buyer/profile/edit">
                  <Button
                    className="gap-2 w-full text-white h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-[#ef864c]/20 border-0"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#d9723f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ef864c")
                    }
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/real-estate/seller/dashboard">
                  <Button
                    variant="outline"
                    className="gap-2 w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] border-[#0f4656]/10 text-[#ef864c]"
                    style={{ color: "#ef864c" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef864c20";
                      e.currentTarget.style.color = "#d9723f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "#ef864c";
                    }}
                  >
                    <Store className="w-4 h-4" />
                    Switch to Selling
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="p-6 lg:p-8 border-0 shadow-xl bg-white rounded-[24px]">
              <h2
                className="text-xl font-black mb-6 flex items-center gap-3"
                style={{ color: "#0f4656" }}
              >
                <User className="w-5 h-5 text-[#ef864c]" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground/60 mb-1 block">
                    Full Name
                  </label>
                  <p className="text-foreground font-medium">
                    {user.name || "Not provided"}
                  </p>
                </div>
                {user.firstName && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 block">
                      First Name
                    </label>
                    <p className="text-foreground font-medium">
                      {user.firstName}
                    </p>
                  </div>
                )}
                {user.lastName && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 block">
                      Last Name
                    </label>
                    <p className="text-foreground font-medium">
                      {user.lastName}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-foreground/60 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <p className="text-foreground font-medium">{user.phone}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Location & Preferences */}
            <Card className="p-6 lg:p-8 border-0 shadow-xl bg-white rounded-[24px]">
              <h2
                className="text-xl font-black mb-6 flex items-center gap-3"
                style={{ color: "#0f4656" }}
              >
                <MapPin className="w-5 h-5 text-[#ef864c]" />
                Location & Preferences
              </h2>
              <div className="space-y-4">
                {user.country && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Country
                    </label>
                    <p className="text-foreground font-medium">
                      {user.country}
                    </p>
                  </div>
                )}
                {user.state && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 block">
                      State
                    </label>
                    <p className="text-foreground font-medium">{user.state}</p>
                  </div>
                )}
                {user.city && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 block">
                      City
                    </label>
                    <p className="text-foreground font-medium">{user.city}</p>
                  </div>
                )}
                {user.languages && user.languages.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-1 block">
                      Languages
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: "#ef864c20",
                            color: "#0f4656",
                          }}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Additional Information */}
          {(user.bio || user.specialization || user.certifications) && (
            <Card className="p-6 lg:p-8 border-0 shadow-xl bg-white rounded-[24px]">
              <h2
                className="text-xl font-black mb-6"
                style={{ color: "#0f4656" }}
              >
                Additional Information
              </h2>
              <div className="space-y-4">
                {user.bio && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-2 block">
                      Bio
                    </label>
                    <p className="text-foreground/70 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}
                {user.specialization && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-2 block">
                      Specialization
                    </label>
                    <p className="text-foreground font-medium">
                      {user.specialization}
                    </p>
                  </div>
                )}
                {user.certifications && (
                  <div>
                    <label className="text-sm font-semibold text-foreground/60 mb-2 block">
                      Certifications
                    </label>
                    <p className="text-foreground/70">{user.certifications}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Roles */}
          {user.roles && user.roles.length > 0 && (
            <Card className="p-6 lg:p-8 border-0 shadow-xl bg-white rounded-[24px]">
              <h2
                className="text-xl font-black mb-6"
                style={{ color: "#0f4656" }}
              >
                Your Roles
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <span
                    key={index}
                    className="text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: "#ef864c" }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </BuyerDashboardLayout>
  );
}
