"use client";

import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { Input } from "@/RealEstate/components/ui/input";
import { Label } from "@/RealEstate/components/ui/label";
import { Textarea } from "@/RealEstate/components/ui/textarea";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, startTransition } from "react";
import { BuyerDashboardLayout } from "@/RealEstate/components/BuyerDashboardLayout";
import { useGetCurrentUserQuery } from "@/services/redux/api/authApi";
import {
  useUpdateSellerProfileMutation,
  useUploadPropertyImageMutation,
} from "@/services/redux/api/propertyApi";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AiPromptModal } from "@/components/ai/AiPromptModal";
import { useGenerateProfileBioMutation } from "@/services/redux/api/aiApi";
import { Sparkles } from "lucide-react";

export default function BuyerProfileEdit() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    data,
    isLoading: isLoadingProfile,
    isError,
  } = useGetCurrentUserQuery("realestate_buyer");
  const user = data?.user;
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateSellerProfileMutation();
  const [uploadImage] = useUploadPropertyImageMutation();
  const [generateBio, { isLoading: isGeneratingBio }] =
    useGenerateProfileBioMutation();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Initialize form data - will be synced with user data when it loads
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    city: "",
    state: "",
    country: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  );

  // Track the user ID we've initialized for to avoid re-initializing
  const initializedUserIdRef = useRef<string | null>(null);

  // Sync form data with user data when it loads
  // This useEffect is necessary because user data loads asynchronously after component mount
  // This is a valid use case: syncing local state with external async data
  // We use startTransition to mark these updates as non-urgent to avoid blocking the UI
  useEffect(() => {
    if (user?._id && initializedUserIdRef.current !== user._id) {
      initializedUserIdRef.current = user._id;
      startTransition(() => {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
        });
        if (
          user.avatar &&
          (user.avatar.startsWith("http") ||
            user.avatar.startsWith("https") ||
            user.avatar.startsWith("data:"))
        ) {
          setAvatarPreview(user.avatar);
        }
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBio = async (prompt: string) => {
    try {
      const result = await generateBio({
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city,
        state: formData.state,
        customPrompt: prompt,
      }).unwrap();

      if (result.description) {
        setFormData((prev) => ({ ...prev, bio: result.description || "" }));
        toast({
          title: "Bio generated",
          description: "AI has successfully crafted your profile bio.",
        });
      }
    } catch (_) {
      toast({
        title: "Generation failed",
        description: "AI was unable to generate a bio at this time.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let avatarUrl = user?.avatar || "";

      if (avatarFile) {
        const uploadResult = await uploadImage(avatarFile).unwrap();
        avatarUrl = uploadResult.url;
      }

      // Build payload with all fields
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        avatar: avatarUrl,
        role: "realestate_buyer",
      };

      await updateProfile(payload).unwrap();

      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });

      // Navigate after a brief delay to ensure cache invalidation completes
      setTimeout(() => {
        router.push("/real-estate/buyer/profile");
        router.refresh(); // Force Next.js to refresh the page
      }, 200);
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          (error as { message?: string })?.message ||
          "Something went wrong while saving your profile.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingProfile) {
    return (
      // <LandingLayout>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-foreground/60">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#ef864c" }}
          />
          <p>Loading profile...</p>
        </div>
      </div>
      // </LandingLayout>
    );
  }

  if (isError || !user) {
    return (
      // <LandingLayout>
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
      // </LandingLayout>
    );
  }

  const isProcessing = isUpdatingProfile;

  return (
    <BuyerDashboardLayout>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl space-y-8">
          {/* Back Button */}
          <Link
            href="/real-estate/buyer/dashboard"
            className="inline-flex items-center gap-2 font-semibold"
            style={{ color: "#ef864c" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1
              className="text-3xl lg:text-4xl font-black mb-2"
              style={{ color: "#0f4656" }}
            >
              Edit Profile
            </h1>
            <p className="text-foreground/60 font-medium">
              Update your personal information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <Card className="p-6 border-0 shadow-xl rounded-[24px] bg-white">
              <h2
                className="text-lg font-black mb-6"
                style={{ color: "#0f4656" }}
              >
                Profile Picture
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="w-32 h-32 rounded-full overflow-hidden border-4 flex-shrink-0 relative bg-foreground/5"
                  style={{ borderColor: "#ef864c40" }}
                >
                  {avatarPreview &&
                  (avatarPreview.startsWith("http") ||
                    avatarPreview.startsWith("https")) ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        avatarPreview ||
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="avatar"
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors"
                    style={{ borderColor: "inherit" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#ef864c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "")
                    }
                  >
                    <Upload className="w-4 h-4" style={{ color: "#ef864c" }} />
                    <span className="text-sm font-medium text-foreground/70">
                      Click to upload new photo
                    </span>
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6 border-0 shadow-xl rounded-[24px] bg-white">
              <h2
                className="text-lg font-black mb-6"
                style={{ color: "#0f4656" }}
              >
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-foreground font-semibold mb-2"
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-border"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-foreground font-semibold mb-2"
                    >
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-border"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-foreground font-semibold mb-2"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="border-border bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-foreground/50 mt-1">
                    Email changes are managed by support. Reach out if you need
                    to update it.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-foreground font-semibold mb-2"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="city"
                      className="text-foreground font-semibold mb-2"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="border-border"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="state"
                      className="text-foreground font-semibold mb-2"
                    >
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="border-border"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="country"
                      className="text-foreground font-semibold mb-2"
                    >
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="border-border"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* About & Preferences */}
            <Card className="p-6 border-0 shadow-xl rounded-[24px] bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black" style={{ color: "#0f4656" }}>
                  About You
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAiModalOpen(true)}
                  className="gap-2 bg-gradient-to-r from-[#ef864c] to-[#0f4656] text-white border-0 hover:scale-105 active:scale-95 transition-all font-bold h-8 text-[11px] px-4 rounded-full shadow-lg shadow-primary/10"
                >
                  {isGeneratingBio ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI Enhance
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="bio"
                    className="text-foreground font-semibold mb-2 block"
                  >
                    Bio
                  </Label>
                  <div className="relative group">
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="border-0 bg-[#0f4656]/5 focus-visible:ring-2 focus-visible:ring-[#ef864c]/20 rounded-xl resize-none py-3 font-medium transition-all"
                    />
                    {isGeneratingBio && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
                        <Loader2 className="w-6 h-6 animate-spin text-[#ef864c]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link href="/real-estate/buyer/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 lg:h-14 font-black uppercase tracking-widest text-xs rounded-2xl"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-[2] text-white hover:opacity-90 font-black uppercase tracking-widest text-xs rounded-2xl h-12 lg:h-14 shadow-xl shadow-[#ef864c]/20 transition-all border-0"
                style={{ backgroundColor: "#ef864c" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d9723f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ef864c")
                }
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>

          <AiPromptModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            onGenerate={handleGenerateBio}
            title="Profile Bio"
            isLoading={isGeneratingBio}
          />
        </div>
      </div>
    </BuyerDashboardLayout>
  );
}
