"use client";

import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import { Input } from "@/RealEstate/components/ui/input";
import { Label } from "@/RealEstate/components/ui/label";
import { Textarea } from "@/RealEstate/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Sparkles,
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  Languages,
  Edit,
} from "lucide-react";
import { useState } from "react";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useUploadPropertyImageMutation,
  type SellerProfile,
} from "@/services/redux/api/propertyApi";
import { useGenerateProfileBioMutation } from "@/services/redux/api/aiApi";
import { AiPromptModal } from "@/components/ai/AiPromptModal";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop";

export default function SellerProfileEdit() {
  const { data, isLoading, isError, refetch } =
    useGetSellerProfileQuery("realestate_seller");
  const profile = data?.profile;

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

  if (isError || !profile) {
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
              <Link href="/real-estate/seller/profile">
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
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ProfileEditForm key={profile.id} profile={profile} />
    </DashboardLayout>
  );
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

  const handleGenerateBio = async (customPrompt: string = "") => {
    try {
      const result = await generateBio({
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        agency: formData.agency,
        city: formData.city,
        state: formData.state,
        certifications: formData.certifications,
        languages: formData.languages.split(",").map((l) => l.trim()),
        customPrompt,
      }).unwrap();

      if (result.description) {
        setFormData((prev) => ({ ...prev, bio: result.description || "" }));
        sonnerToast.success("Professional bio generated successfully!");
      }
    } catch (error) {
      sonnerToast.error("Failed to generate bio with AI. Please try again.");
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

      await updateProfile({ ...payload, role: "realestate_seller" }).unwrap();

      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });
      router.push("/real-estate/seller/profile");
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
    <div className="p-3 lg:p-8 space-y-6 lg:space-y-10 max-w-[1400px] mx-auto font-sans">
      {/* Back Protocol */}
      <Link
        href="/real-estate/seller/profile"
        className="inline-flex items-center gap-2 group text-[#ef864c] font-black text-[10px] lg:text-sm uppercase tracking-widest pl-1"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Return to Profile
      </Link>

      {/* Header Area */}
      <div className="space-y-1 lg:space-y-1.5 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-[#ef864c] font-black text-[9px] lg:text-xs uppercase tracking-[0.2em]">
          <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          Modification Interface
        </div>
        <h1 className="text-xl lg:text-3xl font-black text-[#0f4656] tracking-tight leading-tight">
          Profile Edit
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Cinematic Card */}
        <Card className="border-0 shadow-xl bg-white rounded-[20px] p-6 lg:p-10 space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef864c]/5 rounded-full -mr-32 -mt-32" />
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-6 bg-[#ef864c]" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40">
              Profile Visuals
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10">
            <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-[20px] overflow-hidden border-4 border-white shadow-xl bg-[#0f4656]/5 group/upload relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-full h-full object-cover group-hover/upload:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="flex-1 w-full max-w-[400px]">
              <label
                htmlFor="avatar"
                className="flex flex-col items-center justify-center gap-3 h-28 lg:h-40 border-2 border-dashed border-[#0f4656]/5 rounded-[20px] cursor-pointer hover:border-[#ef864c]/50 hover:bg-[#ef864c]/5 transition-all group"
              >
                <Upload className="w-5 h-5 lg:w-6 lg:h-6 text-[#ef864c] group-hover:scale-110 transition-transform" />
                <span className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-widest">
                  Upload New Profile
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

        {/* Personal & Professional Identity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
          <Card className="border-0 shadow-xl bg-white rounded-[20px] p-6 lg:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-6 bg-[#ef864c]" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40">
                Personal Metrics
              </h2>
            </div>

            <div className="space-y-4 lg:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="firstName"
                    className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="lastName"
                    className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="h-11 lg:h-12 bg-[#0f4656]/10 border-0 rounded-[20px] font-black px-4 text-[#0f4656]/40 cursor-not-allowed"
                  />
                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f4656]/20" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="city"
                    className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="state"
                    className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-xl bg-white rounded-[20px] p-6 lg:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-6 bg-[#ef864c]" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[#0f4656]/40">
                Domain Intelligence
              </h2>
            </div>

            <div className="space-y-4 lg:space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="agency"
                  className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                >
                  Agency
                </Label>
                <Input
                  id="agency"
                  name="agency"
                  value={formData.agency}
                  onChange={handleInputChange}
                  className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="specialization"
                  className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                >
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Luxury Asset Portfolios"
                  className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="certifications"
                  className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                >
                  Market Credentials
                </Label>
                <Input
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="languages"
                  className="text-[9px] font-black uppercase tracking-[1.5px] text-[#0f4656]/40 px-1"
                >
                  Languages
                </Label>
                <Input
                  id="languages"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  placeholder="English, French, Spanish"
                  className="h-11 lg:h-12 bg-[#0f4656]/5 border-0 rounded-[20px] font-bold px-4 focus:ring-2 ring-[#ef864c]/10"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Professional Bio with AI Augmentation */}
        <Card className="border-0 shadow-xl bg-[#0f4656] rounded-[20px] p-6 lg:p-10 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#ef864c]" />
                <h3 className="text-[10px] font-black uppercase tracking-[2.5px] text-white/40">
                  AI Augmented Narrative
                </h3>
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-white">
                Professional Bio
              </h2>
            </div>
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

          <div className="">
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Deploy your professional narrative..."
              rows={6}
              className="bg-white/5 border-2 border-white/10 rounded-[20px] p-5 text-white font-bold placeholder:text-white/20 focus:ring-2 ring-[#ef864c]/20 transition-all text-sm lg:text-base lg:leading-relaxed"
            />
          </div>
        </Card>

        {/* Global Action Terminal */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 max-w-xl mx-auto pt-4 lg:pt-6">
          <Link href="/real-estate/seller/profile" className="block">
            <Button
              type="button"
              className="w-full h-12 lg:h-14 rounded-[20px] border-2 border-[#0f4656]/5 bg-white text-[#0f4656] font-black uppercase tracking-widest hover:bg-[#0f4656]/5 transition-all text-xs"
            >
              Discard Changes
            </Button>
          </Link>
          <Button
            type="submit"
            className="w-full h-12 lg:h-14 rounded-[20px] bg-[#ef864c] hover:bg-[#d9723f] text-white font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-xs"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* AI Intelligence Dialog */}
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerate={handleGenerateBio}
        title={`${formData.firstName} ${formData.lastName}`}
        isLoading={isGeneratingBio}
      />
    </div>
  );
}
