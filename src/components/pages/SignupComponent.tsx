"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, MapPin, ArrowRight } from "lucide-react";
import { useRegisterMutation } from "@/services/redux/api/authApi";
import type { RegisterPayload } from "@/services/redux/api/authApi";

interface AddressSuggestion {
  display_name?: string;
  name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    region?: string;
    country?: string;
  };
}

export default function Signup() {
  const router = useRouter();
  const [register, { isLoading: loading }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    country: "",
    state: "",
    city: "",
    confirmPassword: "",
  });
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch address suggestions from Nominatim API
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      );
      const data = await res.json();

      if (data && Array.isArray(data)) {
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced function to fetch suggestions
  const debouncedFetchSuggestions = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(query);
    }, 300); // 300ms delay
  };

  // Handle address input change with autocomplete
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange(e);
    debouncedFetchSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    const fullAddress = suggestion.display_name || suggestion.name || "";
    const cityValue =
      suggestion.address?.city ||
      suggestion.address?.town ||
      suggestion.address?.village ||
      "";
    const stateValue =
      suggestion.address?.state || suggestion.address?.region || "";
    const countryValue = suggestion.address?.country || "";

    // Update the form data with address and extracted location
    setFormData((prev) => ({
      ...prev,
      address: fullAddress,
      city: cityValue || prev.city,
      state: stateValue || prev.state,
      country: countryValue || prev.country,
    }));

    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Handle Enter key press
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If suggestions are shown and there's a first suggestion, select it
      if (showSuggestions && addressSuggestions.length > 0) {
        handleSuggestionSelect(addressSuggestions[0]);
        return;
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.address ||
      !formData.country ||
      !formData.state ||
      !formData.city
    ) {
      setError("Please fill in all fields");
      toast({
        title: "Validation Error",
        description: "Please fill in all fields including address",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedLegal) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      toast({
        title: "Legal Agreement Required",
        description:
          "Please agree to the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setError("");

    try {
      const userinfo: RegisterPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        acceptedPolicies: {
          privacy: true,
          terms: true,
        },
      };

      const result = await register(userinfo).unwrap();
      console.log(result, "result");
      if (
        result?.message ===
        "OTP sent to your email address. Please verify to continue."
      ) {
        toast({
          title: "OTP Sent",
          description:
            result?.message || "Check your email for the verification code",
        });
        router.push(`/otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast({
          title: "Registration Failed",
          description: result?.message || "Unable to complete registration.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        ((err as { message?: string })?.message ??
          "An error occurred during registration. Please try again.");
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(11,54,66,0.90), rgba(15,70,86,0.90), rgba(24,78,95,0.90)), url('/Images/signupright.png')",
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
                <div className="inline-flex items-center justify-center mb-4 w-full">
                  <img
                    src="/Images/footerlogo.png"
                    alt="Zayan Logo"
                    className="w-[150px] h-[150px]"
                  />
                </div>
                <h1
                  className="text-4xl xl:text-5xl font-heading font-bold mb-3"
                  style={{ color: "#ffffff" }}
                >
                  Create your account in minutes.
                </h1>
                <p
                  className="text-sm md:text-base max-w-md"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Start buying and selling across ecommerce and real-estate with
                  a single unified login.
                </p>
              </div>

              {/* Illustration */}
              <div className="mt-6 flex justify-center lg:justify-start">
                <div className="relative w-64 h-64 xl:w-[500px] xl:h-72 rounded-xl overflow-hidden border border-[rgba(239,134,76,0.4)] shadow-2xl bg-[rgba(0,0,0,0.25)]">
                  {/* Animated glow */}
                  <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[rgba(239,134,76,0.35)] blur-3xl animate-pulse" />
                  <img
                    src="/Images/signupright.png"
                    alt="Friendly character welcoming user through a door"
                    className="relative z-10 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
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

            <div className="relative z-10 w-full max-w-md">
              {/* Mobile Logo - Only visible on small screens */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-block">
                  <img
                    src="/Images/footerlogo.png"
                    alt="Zayan Logo"
                    className="w-[100px] h-[110px]"
                  />
                </div>
                <p className="mt-2" style={{ color: "#ef864c" }}>
                  Join our marketplace
                </p>
              </div>

              {/* Signup Form Card */}
              <div
                className="bg-white rounded-2xl shadow-xl border p-8 mb-6"
                style={{ borderColor: "rgba(239, 134, 76, 0.2)" }}
              >
                <div className="mb-6">
                  <h2
                    className="text-2xl font-heading font-bold"
                    style={{ color: "#0f4656" }}
                  >
                    Create Your Account
                  </h2>
                  <p
                    className="text-sm mt-2"
                    style={{ color: "rgba(15,70,86,0.8)" }}
                  >
                    Sign up to get started
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        ref={addressInputRef}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleAddressChange}
                        onKeyDown={handleAddressKeyDown}
                        onFocus={() => {
                          if (addressSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        placeholder="Enter your address"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute top-full left-0 right-0 bg-white border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto mt-1"
                        >
                          {isLoadingSuggestions ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Loading suggestions...
                            </div>
                          ) : (
                            addressSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() =>
                                  handleSuggestionSelect(suggestion)
                                }
                                className="p-3 cursor-pointer border-b border-border last:border-b-0 hover:bg-muted transition-colors"
                              >
                                <div className="font-medium text-sm text-foreground mb-1">
                                  {suggestion.name ||
                                    suggestion.display_name?.split(",")[0]}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {suggestion.display_name}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location: Country, State & City (Auto-populated) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Enter or auto-fill"
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Enter or auto-fill"
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter or auto-fill"
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
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
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border border-border rounded mt-0.5 cursor-pointer"
                      checked={acceptedLegal}
                      onChange={(e) => setAcceptedLegal(e.target.checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <a
                        href="/terms-of-service"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy-policy"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2 bg-gradient-to-r from-secondary to-secondary-600 hover:opacity-90 disabled:opacity-50"
                    size="lg"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </form>
              </div>

              {/* Already have account link */}
              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="text-primary font-medium hover:text-primary-600 transition-colors"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
