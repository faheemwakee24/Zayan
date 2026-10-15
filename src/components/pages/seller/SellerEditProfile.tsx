"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useUploadPropertyImageMutation,
  type SellerProfile,
} from "@/services/redux/api/propertyApi";
import { useToast } from "@/hooks/use-toast";
import { AiPromptModal } from "@/components/ai/AiPromptModal";
import { useGenerateProfileBioMutation } from "@/services/redux/api/aiApi";
import { Sparkles } from "lucide-react";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop";

export default function SellerEditProfile() {
  const { data, isLoading, isError, refetch } =
    useGetSellerProfileQuery("ecommerce_seller");
  const profile = data?.profile;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-foreground/60">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#ef864c" }}
          />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">
            {isError ? "Failed to load profile" : "Profile not found"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              style={{ borderColor: "#ef864c", color: "#ef864c" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ef864c20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              onClick={() => refetch()}
            >
              Retry
            </Button>
            <Link href="/ecommerce/seller/profile">
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
                Back to Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileEditForm key={profile.id} profile={profile} />;
}

interface ProfileEditFormProps {
  profile: SellerProfile;
}

function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateSellerProfileMutation();
  const [uploadImage] = useUploadPropertyImageMutation();
  const [generateBio, { isLoading: isGeneratingBio }] =
    useGenerateProfileBioMutation();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
    specialization: profile.specialization ?? "",
    agency: profile.agency ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    certifications: profile.certifications ?? "",
    languages: profile.languages?.join(", ") ?? "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(
    profile.avatar || DEFAULT_AVATAR,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateBio = async (prompt: string) => {
    try {
      const result = await generateBio({
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        agency: formData.agency,
        city: formData.city,
        state: formData.state,
        certifications: formData.certifications,
        languages: formData.languages.split(",").map((l: string) => l.trim()),
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
      let avatarUrl = profile.avatar || "";

      if (avatarFile) {
        const uploadResult = await uploadImage(avatarFile).unwrap();
        avatarUrl = uploadResult.url;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        specialization: formData.specialization,
        agency: formData.agency,
        city: formData.city,
        state: formData.state,
        certifications: formData.certifications,
        languages: formData.languages
          .split(",")
          .map((lang) => lang.trim())
          .filter(Boolean),
        avatar: avatarUrl,
      };

      await updateProfile({ ...payload, role: "ecommerce_seller" }).unwrap();

      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });
      router.push("/ecommerce/seller/profile");
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

  const isProcessing = isUpdatingProfile;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/ecommerce/seller/profile"
          className="inline-flex items-center gap-2 font-semibold mb-6 transition-colors"
          style={{ color: "#ef864c" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl md:text-3xl font-heading font-bold mb-2"
            style={{ color: "#0f4656" }}
          >
            Edit Profile
          </h1>
          <p className="text-foreground/60">
            Update your seller information and credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2
              className="text-xl font-heading font-bold mb-6"
              style={{ color: "#0f4656" }}
            >
              Profile Picture
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className="w-32 h-32 rounded-full overflow-hidden border-4 flex-shrink-0"
                style={{
                  borderColor: "#ef864c40",
                  backgroundColor: "#ef864c10",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 w-full">
                <label
                  htmlFor="avatar"
                  className="flex items-center justify-center gap-2 px-6 py-[30px] border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                  style={{ borderColor: "#ef864c" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef864c10";
                    e.currentTarget.style.borderColor = "#d9723f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#ef864c";
                  }}
                >
                  <span className="text-sm font-medium flex flex-col items-center gap-[10px] text-foreground/70">
                    <Upload className="w-4 h-4" style={{ color: "#ef864c" }} />
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
                <p className="text-xs text-muted-foreground mt-2 text-center sm:text-left">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2
              className="text-xl font-heading font-bold mb-6"
              style={{ color: "#0f4656" }}
            >
              Personal Information
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#ef864c")
                    }
                    onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                  />
                </div>

                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#ef864c")
                    }
                    onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Email changes are managed by support. Reach out if you need to
                  update it.
                </p>
              </div>

              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={
                    { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#ef864c")
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#ef864c")
                    }
                    onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                  />
                </div>

                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#0f4656" }}
                  >
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#ef864c")
                    }
                    onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2
              className="text-xl font-heading font-bold mb-6"
              style={{ color: "#0f4656" }}
            >
              Professional Information
            </h2>
            <div className="space-y-5">
              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Business Name / Agency
                </label>
                <input
                  type="text"
                  name="agency"
                  value={formData.agency}
                  onChange={handleInputChange}
                  placeholder="e.g., TechGear Pro, My Store"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={
                    { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#ef864c")
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
              </div>

              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Specialization / Category
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Electronics, Fashion, Home & Garden"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={
                    { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#ef864c")
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <label
                    className="block text-base font-medium"
                    style={{ color: "#0f4656" }}
                  >
                    Bio
                  </label>
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
                <div className="relative group">
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell customers about your business and what you offer..."
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors"
                    style={
                      { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#ef864c")
                    }
                    onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    disabled={isGeneratingBio}
                  ></textarea>
                  {isGeneratingBio && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-20">
                      <Loader2
                        className="w-6 h-6 animate-spin"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Certifications & Credentials
                </label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  placeholder="e.g., Verified Seller, Award Winner 2023"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={
                    { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#ef864c")
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
              </div>

              <div>
                <label
                  className="block text-base font-medium mb-2"
                  style={{ color: "#0f4656" }}
                >
                  Languages
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  placeholder="e.g., English, Spanish, French"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={
                    { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                  }
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#ef864c")
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Separate languages with commas.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/ecommerce/seller/profile" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                style={{ borderColor: "#ef864c", color: "#ef864c" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef864c20";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 text-white"
              style={{ backgroundColor: "#ef864c" }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = "#d9723f";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ef864c";
              }}
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
          title="Seller Bio"
          isLoading={isGeneratingBio}
        />
      </div>
    </div>
  );
}
