"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import {
  useRequestPasswordResetOtpMutation,
  useVerifyPasswordResetOtpMutation,
  useResetPasswordWithOtpMutation,
} from "@/services/redux/api/authApi";
import { toast } from "@/hooks/use-toast";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [requestOtp, { isLoading: requestingOtp }] = useRequestPasswordResetOtpMutation();
  const [verifyOtpMutation, { isLoading: verifyingOtp }] = useVerifyPasswordResetOtpMutation();
  const [resetPasswordMutation, { isLoading: resettingPassword }] = useResetPasswordWithOtpMutation();

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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(11,54,66,0.90), rgba(15,70,86,0.90), rgba(24,78,95,0.90)), url('/Images/loginright.png')",
      }}
    >
      {/* Main Card */}
      <div className="relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-[#0f4656]">
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Left Side - Branding Section (desktop) */}
          <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center p-12">
            {/* Slanted Background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#0f4656",
                clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* Background Pattern/Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.15)" }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-lg">
              {/* Logo + Copy */}
              <div className="mb-10">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-2xl"
                    style={{ backgroundColor: "#ef864c" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-7 h-7"
                    >
                      <path d="M13 2H3v10h10V2z" />
                      <path d="M21 2h-6v10h10V2z" />
                      <path d="M13 13H3v10h10v-10z" />
                      <path d="M21 13h-6v10h10v-10z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p
                      className="text-xs tracking-[0.2em] uppercase"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      Forgot your
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: "#ffffff" }}
                    >
                      Password?
                    </p>
                  </div>
                </div>
                <h1
                  className="text-4xl xl:text-5xl font-heading font-bold mb-3"
                  style={{ color: "#ffffff" }}
                >
                  We&apos;ll help you get back in.
                </h1>
                <p
                  className="text-sm md:text-base max-w-md"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Securely reset your password in three simple steps: verify your
                  email, enter the OTP, and choose a new password.
                </p>
              </div>

              {/* Illustration */}
              <div className="mt-6 flex justify-center lg:justify-start">
                <div className="relative w-64 h-64 xl:w-[500px] xl:h-72 rounded-xl overflow-hidden border border-[rgba(239,134,76,0.4)] shadow-2xl bg-[rgba(0,0,0,0.25)]">
                  {/* Animated glow */}
                  <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[rgba(239,134,76,0.35)] blur-3xl animate-pulse" />
                  <img
                    src="/Images/loginright.png"
                    alt="Friendly character welcoming user through a door"
                    className="relative z-10 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forgot Password Flow */}
          <div className="relative w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-transparent">
            {/* Slanted Background (desktop) */}
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                backgroundColor: "#ffbf58",
                clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* Solid background on mobile */}
            <div
              className="absolute inset-0 lg:hidden"
              style={{ backgroundColor: "#ffffff" }}
            />

            <div className="relative z-10 w-full max-w-md px-4">
              {/* Logo (mobile) */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-block mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#ef864c" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6"
                    >
                      <path d="M13 2H3v10h10V2z" />
                      <path d="M21 2h-6v10h10V2z" />
                      <path d="M13 13H3v10h10v-10z" />
                      <path d="M21 13h-6v10h10v-10z" />
                    </svg>
                  </div>
                </div>
                <h1
                  className="text-3xl font-heading font-bold"
                  style={{ color: "#0f4656" }}
                >
                  Zayan
                </h1>
              </div>

        {/* STEP 1: EMAIL VERIFICATION */}
        {step === "email" && (
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 animate-fade-in-up">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Reset Your Password
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter your email address and we&apos;ll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={requestingOtp}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 disabled:opacity-50"
                size="lg"
              >
                {requestingOtp ? "Sending..." : "Send OTP"}
                {!requestingOtp && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {/* Back to Login */}
            <button
              onClick={() => router.push("/login")}
              className="w-full mt-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        )}

        {/* STEP 2: OTP ENTRY */}
        {step === "otp" && (
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 animate-fade-in-up">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Enter Verification Code
            </h2>
            <p className="text-muted-foreground mb-8">
              We sent a 6-digit OTP to <span className="font-semibold">{email}</span>. Enter it below to continue.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  6-digit OTP
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all tracking-widest"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={verifyingOtp}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 disabled:opacity-50"
                size="lg"
              >
                {verifyingOtp ? "Verifying..." : "Verify Code"}
                {!verifyingOtp && <ArrowRight className="w-4 h-4" />}
              </Button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full mt-2 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === "reset" && (
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 animate-fade-in-up">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Create New Password
            </h2>
            <p className="text-muted-foreground mb-8">
              Please enter your new password below.
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-900 mb-2">
                  Password requirements:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ At least 6 characters</li>
                  <li>✓ Mix of uppercase and lowercase letters</li>
                  <li>✓ At least one number or special character</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={resettingPassword}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 disabled:opacity-50"
                size="lg"
              >
                {resettingPassword ? "Resetting..." : "Reset Password"}
                {!resettingPassword && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="bg-white rounded-2xl shadow-xl border border-border p-8 animate-fade-in-up text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-secondary-600 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Password Reset Successful
            </h2>
            <p className="text-muted-foreground mb-8">
              Your password has been successfully reset. You can now login with
              your new password.
            </p>

            {/* Success Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-green-700">
                ✓ Your account is secure and ready to use
              </p>
            </div>

            {/* Back to Login Button */}
            <Button
              onClick={() => router.push("/login")}
              className="w-full gap-2 bg-gradient-to-r from-secondary to-secondary-600 hover:opacity-90"
              size="lg"
            >
              Back to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
