"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Trash2, LogOut, Check } from "lucide-react";
import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import {
  useGetCurrentUserQuery,
  useAssignRolesMutation,
  type GetCurrentUserResponse,
  useRequestPasswordResetOtpMutation,
  useVerifyPasswordResetOtpMutation,
  useResetPasswordWithOtpMutation,
} from "@/services/redux/api/authApi";
import type { AssignRolesPayload } from "@/services/redux/api/authApi";
import {
  useSubmitVerificationMutation,
  useGetVerificationStatusQuery,
} from "@/services/redux/api/verificationApi";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Upload,
  X,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

type RoleKey =
  | "ecommerceBuyer"
  | "ecommerceSeller"
  | "realEstateBuyer"
  | "realEstateSeller";

const buildRoleState = (roles?: string[]) => ({
  ecommerceBuyer: roles?.includes("ecommerceBuyer") ?? false,
  ecommerceSeller: roles?.includes("ecommerceSeller") ?? false,
  realEstateBuyer: roles?.includes("realEstateBuyer") ?? false,
  realEstateSeller: roles?.includes("realEstateSeller") ?? false,
});

const roleDescriptions: Record<
  RoleKey,
  { title: string; description: string }
> = {
  ecommerceBuyer: {
    title: "Ecommerce Buyer",
    description: "Browse and purchase products from sellers.",
  },
  ecommerceSeller: {
    title: "Ecommerce Seller",
    description: "Manage an online storefront and track sales.",
  },
  realEstateBuyer: {
    title: "Real Estate Buyer",
    description: "Discover and enquire about listed properties.",
  },
  realEstateSeller: {
    title: "Real Estate Seller",
    description: "List properties and connect with qualified buyers.",
  },
};

export default function SellerSettings() {
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery("realestate_seller");

  if (isUserLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center p-6">
          <p className="text-sm text-foreground/60">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUserData?.user) {
    return (
      // <DashboardLayout>
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-foreground/60">
          Unable to load Dashboard data.
        </p>
      </div>
      // </DashboardLayout>
    );
  }

  // Check account status
  const accountStatus = currentUserData.user.accountStatus || "active";
  if (accountStatus !== "active") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              accountStatus === "banned"
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-orange-100 dark:bg-orange-900/30"
            }`}
          >
            {accountStatus === "banned" ? (
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Account {accountStatus === "banned" ? "Banned" : "Suspended"}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            {accountStatus === "banned"
              ? "Your account has been permanently banned. You cannot access settings or other features."
              : "Your account has been suspended. You have limited access to settings and features."}
          </p>
          {currentUserData.user.banReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mb-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Ban Reason:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {currentUserData.user.banReason}
              </p>
            </div>
          )}
          {currentUserData.user.suspensionReason && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-md mb-4">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                Suspension Reason:
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {currentUserData.user.suspensionReason}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            Please contact support if you believe this is an error.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return <SellerSettingsContent user={currentUserData.user} />;
}

function SellerSettingsContent({
  user,
}: {
  user: GetCurrentUserResponse["user"];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [assignRoles, { isLoading: isSavingRoles }] = useAssignRolesMutation();
  const [selectedRoles, setSelectedRoles] = useState(() =>
    buildRoleState(user.roles),
  );
  const [initialRoles, setInitialRoles] = useState(() =>
    buildRoleState(user.roles),
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change password flow state (inline)
  type Step = "email" | "otp" | "reset" | "success";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [requestOtp, { isLoading: requestingOtp }] =
    useRequestPasswordResetOtpMutation();
  const [verifyOtpMutation, { isLoading: verifyingOtp }] =
    useVerifyPasswordResetOtpMutation();
  const [resetPasswordMutation, { isLoading: resettingPassword }] =
    useResetPasswordWithOtpMutation();

  // Verification state
  const { data: verificationStatus, refetch: refetchVerification } =
    useGetVerificationStatusQuery();
  const [submitVerification, { isLoading: isSubmittingVerification }] =
    useSubmitVerificationMutation();
  const [verificationDocuments, setVerificationDocuments] = useState<string[]>(
    [],
  );
  const [showVerificationUpload, setShowVerificationUpload] = useState(false);

  // Update verification documents when status changes
  useEffect(() => {
    if (verificationStatus?.verificationDocuments) {
      setVerificationDocuments(verificationStatus.verificationDocuments);
    }
  }, [verificationStatus]);

  const toggleRole = (key: RoleKey) => {
    setSelectedRoles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasRoleChanges = useMemo(
    () => JSON.stringify(selectedRoles) !== JSON.stringify(initialRoles),
    [selectedRoles, initialRoles],
  );

  const hasAnyRoleSelected = useMemo(
    () => Object.values(selectedRoles).some(Boolean),
    [selectedRoles],
  );

  const handleSaveRoles = async () => {
    if (!hasAnyRoleSelected) {
      toast({
        title: "Select at least one role",
        description: "You must keep at least one role active.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: AssignRolesPayload = {
        ecommerceBuyer: selectedRoles.ecommerceBuyer,
        ecommerceSeller: selectedRoles.ecommerceSeller,
        realEstateBuyer: selectedRoles.realEstateBuyer,
        realEstateSeller: selectedRoles.realEstateSeller,
      };
      const result = await assignRoles(payload).unwrap();

      if (result.user?.roles) {
        const normalized = buildRoleState(result.user.roles);
        setInitialRoles(normalized);
        setSelectedRoles(normalized);
        if (typeof window !== "undefined") {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const storedUser = JSON.parse(userStr);
            storedUser.roles = result.user.roles;
            localStorage.setItem("user", JSON.stringify(storedUser));
          }
        }
      }

      toast({
        title: "Roles updated",
        description: "Your platform roles were saved successfully.",
      });
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as Error)?.message ||
        "Unable to update roles. Please try again.";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = () => {
    setShowChangePassword((prev) => !prev);
    setStep("email");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter the email associated with your account.",
        variant: "destructive",
      });
      return;
    }

    try {
      await requestOtp({ email }).unwrap();
      toast({
        title: "OTP sent",
        description: "Please check your email for the verification code.",
      });
      setStep("otp");
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as Error)?.message ||
        "Unable to send OTP. Please try again.";
      toast({
        title: "Request failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code sent to your email.",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyOtpMutation({ email, otp }).unwrap();
      toast({
        title: "OTP verified",
        description: "You can now set a new password.",
      });
      setStep("reset");
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as Error)?.message ||
        "OTP verification failed. Please try again.";
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Make sure both password fields are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must have at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      await resetPasswordMutation({ email, newPassword }).unwrap();
      toast({
        title: "Password reset",
        description: "Your password has been updated successfully.",
      });
      setStep("success");
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as Error)?.message ||
        "Unable to reset password. Please try again.";
      toast({
        title: "Reset failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted");
    setShowDeleteConfirm(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // Remove from localStorage
      localStorage.removeItem("zayanToken");
      localStorage.removeItem("user");

      // Remove from cookies
      document.cookie =
        "zayanToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "zayanUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("authStateChange"));
      router.push("/");
    }
  };

  // Check if user is seller/agent
  const hasSellerRole = useMemo(() => {
    return user.roles?.some(
      (role) => role === "ecommerceSeller" || role === "realEstateSeller",
    );
  }, [user.roles]);

  // Handle file upload for verification documents
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://zayan-backend.vercel.app"}/api/upload`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${localStorage.getItem("zayanToken")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  // Handle verification document upload
  const handleVerificationDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, JPG, PNG)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPG, or PNG files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = await handleFileUpload(file);
      setVerificationDocuments((prev) => [...prev, url]);
      toast({
        title: "File uploaded",
        description: "Document uploaded successfully.",
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle verification submission
  const handleSubmitVerification = async () => {
    if (verificationDocuments.length === 0) {
      toast({
        title: "Documents required",
        description: "Please upload at least one verification document.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitVerification({ verificationDocuments }).unwrap();
      toast({
        title: "Verification submitted",
        description: "Your verification request has been submitted for review.",
      });
      setShowVerificationUpload(false);
      setVerificationDocuments([]);
      refetchVerification();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        (error as Error)?.message ||
        "Failed to submit verification. Please try again.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Remove verification document
  const handleRemoveDocument = (index: number) => {
    setVerificationDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    // <DashboardLayout>
    <div className="p-4 lg:p-8 space-y-8 max-w-[1320px]">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 font-semibold transition-colors"
        style={{ color: "#ef864c" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: "#0f4656" }}
        >
          Settings
        </h1>
        <p className="text-foreground/60">
          Manage your account, notifications, and business preferences
        </p>
      </div>

      {/* Disabled Roles Warning */}
      {user.disabledRoles && user.disabledRoles.length > 0 && (
        <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                Disabled Roles
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                The following roles have been disabled by an administrator:
              </p>
              <div className="flex flex-wrap gap-2">
                {user.disabledRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                  >
                    {role === "ecommerceSeller"
                      ? "E-commerce Seller"
                      : role === "realEstateSeller"
                        ? "Real Estate Seller"
                        : role}
                  </span>
                ))}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                You cannot use features associated with these roles. Contact
                support if you believe this is an error.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 shadow-sm">
        <h2
          className="text-xl font-bold mb-6 flex items-center gap-2"
          style={{ color: "#0f4656" }}
        >
          <Lock className="w-5 h-5" style={{ color: "#ef864c" }} />
          Account Roles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(roleDescriptions) as RoleKey[]).map((key) => {
            const isActive = selectedRoles[key];
            const roleName =
              key === "ecommerceSeller"
                ? "ecommerceSeller"
                : key === "realEstateSeller"
                  ? "realEstateSeller"
                  : "";
            const isDisabled = !!(
              roleName && user.disabledRoles?.includes(roleName)
            );
            return (
              <button
                key={key}
                type="button"
                onClick={() => !isDisabled && toggleRole(key)}
                disabled={isDisabled}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  isDisabled
                    ? "border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 opacity-60 cursor-not-allowed"
                    : isActive
                      ? "border-[#ef864c] bg-[#ef864c20] hover:bg-[#ef864c30]"
                      : "border-border hover:border-[#ef864c]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDisabled
                          ? "text-orange-700 dark:text-orange-300"
                          : "",
                      )}
                      style={!isDisabled ? { color: "#0f4656" } : undefined}
                    >
                      {roleDescriptions[key].title}
                      {isDisabled && (
                        <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                          (Disabled by Admin)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {roleDescriptions[key].description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full border-2",
                      isDisabled
                        ? "border-orange-300 dark:border-orange-800 bg-orange-100 dark:bg-orange-900/30"
                        : isActive
                          ? "text-white"
                          : "border-border text-transparent",
                    )}
                    style={
                      !isDisabled && isActive
                        ? { backgroundColor: "#ef864c", borderColor: "#ef864c" }
                        : undefined
                    }
                  >
                    {isDisabled ? (
                      <svg
                        className="h-4 w-4 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground/60">
            Select the roles you want to use across Zayan. You must keep at
            least one role active.
          </p>
          <Button
            onClick={handleSaveRoles}
            disabled={!hasRoleChanges || !hasAnyRoleSelected || isSavingRoles}
            className="sm:w-auto text-white"
            style={{ backgroundColor: "#ef864c" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#d9723f";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef864c";
            }}
          >
            {isSavingRoles ? "Saving roles..." : "Save Roles"}
          </Button>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 shadow-sm">
        <h2
          className="text-xl font-bold mb-6 flex items-center gap-2"
          style={{ color: "#0f4656" }}
        >
          <Lock className="w-5 h-5" style={{ color: "#ef864c" }} />
          Security
        </h2>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start max-w-fit"
            style={{ borderColor: "#ef864c", color: "#ef864c" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ef864c20";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={handleChangePassword}
          >
            {showChangePassword ? "Close" : "Change Password"}
          </Button>

          {showChangePassword && (
            <div className="space-y-4 border border-border rounded-xl p-4">
              {/* Email Step */}
              {step === "email" && (
                <form className="space-y-3" onSubmit={handleEmailSubmit}>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#ef864c")
                      }
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={requestingOtp}
                    className="w-full text-white"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#d9723f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef864c";
                    }}
                  >
                    {requestingOtp ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              )}

              {/* OTP Step */}
              {step === "otp" && (
                <form className="space-y-3" onSubmit={handleOtpSubmit}>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit OTP sent to <strong>{email}</strong>.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 tracking-widest transition-colors"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#ef864c")
                      }
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={verifyingOtp}
                      className="flex-1 text-white"
                      style={{ backgroundColor: "#ef864c" }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#d9723f";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef864c";
                      }}
                    >
                      {verifyingOtp ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      style={{ borderColor: "#ef864c", color: "#ef864c" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef864c20";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                      onClick={() => setStep("email")}
                    >
                      Back
                    </Button>
                  </div>
                </form>
              )}

              {/* Reset Password Step */}
              {step === "reset" && (
                <form className="space-y-3" onSubmit={handlePasswordReset}>
                  <p className="text-sm text-muted-foreground">
                    Create a new password for <strong>{email}</strong>.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#ef864c")
                      }
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={
                        { "--tw-ring-color": "#ef864c" } as React.CSSProperties
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#ef864c")
                      }
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      id="showPassword"
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => setShowPassword((prev) => !prev)}
                      className="h-4 w-4 rounded border-border"
                      style={{ accentColor: "#ef864c" }}
                    />
                    <label htmlFor="showPassword" className="text-foreground">
                      Show passwords
                    </label>
                  </div>
                  <Button
                    type="submit"
                    disabled={resettingPassword}
                    className="w-full text-white"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = "#d9723f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef864c";
                    }}
                  >
                    {resettingPassword ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}

              {/* Success Step */}
              {step === "success" && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700">
                    Your password has been reset successfully.
                  </p>
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: "#ef864c" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d9723f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef864c";
                    }}
                    onClick={() => {
                      setShowChangePassword(false);
                      setStep("email");
                      setEmail("");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Verification Section - Only show for sellers/agents */}
      {hasSellerRole && (
        <Card className="p-6 shadow-sm">
          <h2
            className="text-xl font-bold mb-6 flex items-center gap-2"
            style={{ color: "#0f4656" }}
          >
            <BadgeCheck className="w-5 h-5" style={{ color: "#ef864c" }} />
            Seller/Agent Verification
          </h2>

          {/* Verification Status Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {verificationStatus?.verificationStatus === "approved" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : verificationStatus?.verificationStatus === "rejected" ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : verificationStatus?.verificationStatus === "pending" ? (
                  <Clock className="w-5 h-5 text-yellow-600" />
                ) : (
                  <FileText className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    Verification Status
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {verificationStatus?.verificationStatus === "approved"
                      ? "Verified ✓"
                      : verificationStatus?.verificationStatus === "rejected"
                        ? "Rejected - Please resubmit"
                        : verificationStatus?.verificationStatus === "pending"
                          ? "Pending Review"
                          : "Not Submitted"}
                  </p>
                </div>
              </div>
              {verificationStatus?.verificationStatus === "approved" && (
                <BadgeCheck className="w-6 h-6 text-green-600" />
              )}
            </div>

            {/* Upload Documents Section */}
            {verificationStatus?.verificationStatus !== "approved" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    Verification Documents
                  </h3>
                  {!showVerificationUpload &&
                    verificationStatus?.verificationStatus !== "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ borderColor: "#ef864c", color: "#ef864c" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#ef864c20";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() => setShowVerificationUpload(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {verificationStatus?.verificationStatus === "rejected"
                          ? "Resubmit Documents"
                          : "Upload Documents"}
                      </Button>
                    )}
                </div>

                {/* Existing Documents */}
                {verificationStatus?.verificationDocuments &&
                  verificationStatus.verificationDocuments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Uploaded Documents (
                        {verificationStatus.verificationDocuments.length})
                      </p>
                      <div className="space-y-2">
                        {verificationStatus.verificationDocuments.map(
                          (doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border border-border rounded-lg bg-background"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground truncate max-w-[200px]">
                                  Document {index + 1}
                                </span>
                              </div>
                              <a
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs hover:underline transition-colors"
                                style={{ color: "#ef864c" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#d9723f")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "#ef864c")
                                }
                              >
                                View
                              </a>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Upload Form */}
                {showVerificationUpload && (
                  <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Upload Verification Documents
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Upload documents such as business license, ID card, or
                        certification (PDF, JPG, PNG - Max 10MB each)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleVerificationDocumentUpload}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-white"
                        style={
                          {
                            "--tw-file-bg": "#ef864c",
                            "--tw-file-hover-bg": "#d9723f",
                          } as React.CSSProperties
                        }
                      />
                    </div>

                    {/* Uploaded Documents List */}
                    {verificationDocuments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">
                          New Documents ({verificationDocuments.length})
                        </p>
                        <div className="space-y-2">
                          {verificationDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border border-border rounded-lg bg-background"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground truncate max-w-[200px]">
                                  Document {index + 1}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveDocument(index)}
                                className="p-1 hover:bg-destructive/10 rounded"
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitVerification}
                        disabled={
                          isSubmittingVerification ||
                          verificationDocuments.length === 0 ||
                          verificationStatus?.verificationStatus === "pending"
                        }
                        className="flex-1 text-white"
                        style={{ backgroundColor: "#ef864c" }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = "#d9723f";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#ef864c";
                        }}
                      >
                        {isSubmittingVerification
                          ? "Submitting..."
                          : verificationStatus?.verificationStatus ===
                              "rejected"
                            ? "Resubmit for Verification"
                            : "Submit for Verification"}
                      </Button>
                      <Button
                        variant="outline"
                        style={{ borderColor: "#ef864c", color: "#ef864c" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#ef864c20";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() => {
                          setShowVerificationUpload(false);
                          setVerificationDocuments([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Account Actions */}
      <Card className="p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#0f4656" }}>
          Account Actions
        </h2>

        <div className="space-y-3 flex flex-wrap gap-[10px] max-[475px]:flex-col items-center">
          <Button
            variant="outline"
            className="w-[160px] max-[475px]:w-full mt-[12px]  justify-center text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
          <Button
            variant="outline"
            className="w-[160px] max-[475px]:w-full justify-center text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0f4656" }}>
              Delete Account?
            </h3>
            <p className="text-foreground/60 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and all your data including your properties will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                style={{ borderColor: "#ef864c", color: "#ef864c" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef864c20";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDeleteAccount}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
    // </DashboardLayout>
  );
}
