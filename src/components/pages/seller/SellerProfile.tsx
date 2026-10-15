"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Mail, Phone, Calendar, Edit, Award, Loader2 } from "lucide-react";
import { useGetSellerProfileQuery } from "@/services/redux/api/propertyApi";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import { useMemo } from "react";

export default function SellerProfile() {
  const router = useRouter();

  // Fetch profile with ecommerce_seller role
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetSellerProfileQuery("ecommerce_seller");

  // Fetch current user for join date
  const { data: userData } = useGetCurrentUserQuery();

  const profile = profileData?.profile;
  const user = userData?.user;

  // Format join date
  const joinDate = useMemo(() => {
    if (!user || !user.createdAt) return "Unknown";
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [user]);

  // Format location
  const location = useMemo(() => {
    if (!profile) return "";
    const parts = [profile.city, profile.state].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not set";
  }, [profile]);

  // Format full name
  const fullName = useMemo(() => {
    if (!profile) return "Your Name";
    return `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || user?.name || "Your Name";
  }, [profile, user?.name]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ef864c' }} />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {profileError ? "Failed to load profile" : "Profile not found"}
          </p>
          <Button 
            className="text-white"
            style={{ backgroundColor: '#ef864c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const avatar = profile.avatar || "👤";
  const bio = profile.bio || "Add a bio to tell customers more about your business.";
  const rating = profile.rating || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl  px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8 shadow-sm">
          {/* Banner */}
          <div className="h-32" style={{ backgroundColor: '#0f4656' }}></div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col items-start sm:items-center sm:flex-row gap-2 sm:gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center text-6xl overflow-hidden">
                {avatar && avatar.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{avatar}</span>
                )}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold" style={{ color: 'White' }}>
                    {fullName}
                  </h1>
                  {user?.verificationStatus === "approved" && (
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
                <p className="text-foreground/60 flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4" style={{ color: '#ef864c' }} />
                  Joined {joinDate}
                </p>
              </div>
              <Button
                className="gap-2 text-white"
                style={{ backgroundColor: '#ef864c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                onClick={() => router.push("/ecommerce/seller/profile/edit")}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            {/* Bio */}
            <p className="text-foreground/60 mb-6">{bio}</p>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5" style={{ color: '#ef864c' }} />
                <span className="text-foreground/80">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5" style={{ color: '#ef864c' }} />
                  <span className="text-foreground/80">{profile.phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3 text-sm col-span-2">
                  <MapPin className="w-5 h-5" style={{ color: '#ef864c' }} />
                  <span className="text-foreground/80">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1">Stores</p>
            <p className="text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
              {profile.totalStores || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1">Products</p>
            <p className="text-3xl font-heading font-bold" style={{ color: '#ef864c' }}>
              {profile.totalProducts || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1">Followers</p>
            <p className="text-3xl font-heading font-bold" style={{ color: '#0f4656' }}>
              {(profile.totalFollowers || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium mb-1">Rating</p>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" style={{ color: '#ef864c' }} />
              <p className="text-3xl font-heading font-bold" style={{ color: '#ef864c' }}>
                {rating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Badges - Show badges based on achievements */}
        {(profile.totalStores || 0) > 0 || (profile.totalProducts || 0) > 0 || rating >= 4.5 ? (
          <div className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
            <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-2" style={{ color: '#0f4656' }}>
              <Award className="w-5 h-5" style={{ color: '#ef864c' }} />
              Seller Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(profile.totalStores || 0) > 0 && (
                <div className="rounded-xl p-6 border-2 hover:shadow-md transition-shadow" style={{ backgroundColor: '#ef864c20', borderColor: '#ef864c40' }}>
                  <div className="text-4xl mb-3">🏪</div>
                  <h4 className="font-heading font-bold" style={{ color: '#0f4656' }}>
                    Store Owner
                  </h4>
                </div>
              )}
              {(profile.totalProducts || 0) > 50 && (
                <div className="rounded-xl p-6 border-2 hover:shadow-md transition-shadow" style={{ backgroundColor: '#ef864c20', borderColor: '#ef864c40' }}>
                  <div className="text-4xl mb-3">⭐</div>
                  <h4 className="font-heading font-bold" style={{ color: '#0f4656' }}>
                    Best Quality
                  </h4>
                </div>
              )}
              {rating >= 4.5 && (
                <div className="rounded-xl p-6 border-2 hover:shadow-md transition-shadow" style={{ backgroundColor: '#ef864c20', borderColor: '#ef864c40' }}>
                  <div className="text-4xl mb-3">✓</div>
                  <h4 className="font-heading font-bold" style={{ color: '#0f4656' }}>
                    Trusted Seller
                  </h4>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
