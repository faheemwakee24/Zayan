"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Mail } from "lucide-react";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/services/redux/api/authApi";
import type {
  ResendOtpPayload,
  VerifyOtpPayload,
} from "@/services/redux/api/authApi";

export default function OTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams && searchParams.get("email")) || "your@email.com";
  const [verifyOtp, { isLoading: loading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      toast({
        title: "Invalid Code",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    const payload: VerifyOtpPayload = { email, otp: otpCode };

    try {
      const result = await verifyOtp(payload).unwrap();

      // Don't persist session after OTP - user needs to login
      // Just show success message and redirect to login
      toast({
        title: "Email Verified",
        description: result.message || "Please login to continue...",
      });

      router.push("/login");
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error | undefined)?.message ||
        "Unable to verify OTP. Please try again.";
      setError(errorMessage);
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setOtp(["", "", "", "", "", ""]);
    setResendTimer(60);
    setError("");
    inputRefs.current[0]?.focus();

    const payload: ResendOtpPayload = { email };

    try {
      const result = await resendOtp(payload).unwrap();

      toast({
        title: "OTP Sent",
        description:
          result.message ||
          "A new verification code has been sent to your email address.",
      });
    } catch (err: unknown) {
      setResendTimer(0);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error | undefined)?.message ||
        "Unable to resend OTP. Please try again.";
      setError(errorMessage);
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-accent-50 to-background pt-20 pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-accent-400/30 via-accent-300/15 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-primary-400/30 via-primary-300/15 to-transparent rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="inline-flex items-center justify-center gap-3 mb-4 w-full">
          <img
            src="/Images/footerlogo.png"
            alt="Zayan Logo"
            className="w-[150px] h-[150px]"
          />
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2 text-center">
            Verify Your Email
          </h2>

          <p className="text-center text-muted-foreground mb-8">
            We&apos;ve sent a verification code to
            <br />
            <span className="font-medium text-foreground flex items-center justify-center gap-2 mt-2">
              <Mail className="w-4 h-4" />
              {email}
            </span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Enter 6-digit code
              </label>
              <p className="text-xs text-muted-foreground mb-4">
                You can paste the code (Ctrl+V or Cmd+V)
              </p>
              <div className="flex gap-2 sm:gap-3 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary-600 hover:opacity-90 disabled:opacity-50"
              size="lg"
            >
              {loading ? "Verifying..." : "Verify Email"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in{" "}
                <span className="font-medium text-foreground">
                  {resendTimer}s
                </span>
              </p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive the code?
                </p>
                <button
                  onClick={handleResend}
                  type="button"
                  className="text-primary font-medium hover:text-primary-600 transition-colors disabled:opacity-50"
                  disabled={resendLoading}
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700">
            <span className="font-medium">💡 Tip:</span> Check your spam folder
            if you don&apos;t see the verification email
          </p>
        </div>
      </div>
    </div>
  );
}
