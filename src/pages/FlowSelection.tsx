"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Users,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

const FlowSelection = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("zayanToken");
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleFlowSelect = (flow: "ecommerce" | "realestate") => {
    if (flow === "ecommerce") {
      router.push("/ecommerce");
    } else {
      router.push("/real-estate");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center relative bg-cover bg-center bg-no-repeat min-h-screen overflow-hidden"
      style={{
        backgroundColor: "#0f4656",
        backgroundImage: "url('/Images/image.png')",
      }}
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: "rgba(239, 134, 76, 0.15)" }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
        ></div>
        <div
          className="absolute top-1/2 left-0 w-72 h-72 rounded-full blur-3xl animate-pulse delay-500"
          style={{ backgroundColor: "rgba(239, 134, 76, 0.08)" }}
        ></div>
        <div
          className="absolute top-1/3 right-0 w-64 h-64 rounded-full blur-3xl animate-pulse delay-700"
          style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 flex flex-col items-center">
        {/* Enhanced Logo & Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="inline-block mb-4 md:mb-6 relative group">
            {/* <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 animate-pulse transition-opacity"
              style={{ backgroundColor: "#ef864c" }}
            ></div> */}

            <img
              src="/Images/mainlogo.png"
              alt="Zayan Logo"
              className="w-[100px] md:h-[90px] lg:w-[140px] lg:h-[130px]"
            />
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 leading-tight"
            style={{ color: "#ffffff" }}
          >
            Welcome to Zayan
          </h1>
          <p
            className="text-lg md:text-xl lg:text-2xl font-medium mb-2"
            style={{ color: "#ef864c" }}
          >
            Choose Your Experience
          </p>
          <p
            className="text-sm md:text-base lg:text-lg max-w-2xl mx-auto"
            style={{ color: "#ffffff" }}
          >
            Select the platform you want to explore and discover endless
            possibilities
          </p>
        </div>

        {/* Enhanced Stats/Trust Badge */}
        <div className="mb-6 md:mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-center">
          <div
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full shadow-md border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(239, 134, 76, 0.3)",
            }}
          >
            <Users
              className="w-4 h-4 md:w-5 md:h-5"
              style={{ color: "#ef864c" }}
            />
            <span
              className="text-xs md:text-sm font-semibold"
              style={{ color: "#ffffff" }}
            >
              100K+ Users
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full shadow-md border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(239, 134, 76, 0.3)",
            }}
          >
            <Star
              className="w-4 h-4 md:w-5 md:h-5 fill-current"
              style={{ color: "#ef864c" }}
            />
            <span
              className="text-xs md:text-sm font-semibold"
              style={{ color: "#ffffff" }}
            >
              4.9 Rating
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full shadow-md border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(239, 134, 76, 0.3)",
            }}
          >
            <Shield
              className="w-4 h-4 md:w-5 md:h-5"
              style={{ color: "#ef864c" }}
            />
            <span
              className="text-xs md:text-sm font-semibold"
              style={{ color: "#ffffff" }}
            >
              Secure & Trusted
            </span>
          </div>
        </div>

        {/* Enhanced Cards Container */}
        <div
          className="backdrop-blur-xl rounded-3xl md:rounded-[2rem] shadow-2xl border p-6 md:p-8 lg:p-12 w-full max-w-5xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "rgba(239, 134, 76, 0.3)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Enhanced Ecommerce Card */}
            <button
              onClick={() => handleFlowSelect("ecommerce")}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl border-2 p-6 md:p-8 text-left hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              style={{
                borderColor: "rgba(239, 134, 76, 0.3)",
                backgroundColor: "#ffffff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#ef864c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(239, 134, 76, 0.3)")
              }
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 transition-all duration-500 pointer-events-none"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(239, 134, 76, 0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              ></div>

              {/* Decorative corner element */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700 pointer-events-none"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
              ></div>

              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"
                    style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                  ></div>
                  <div
                    className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-2xl"
                    style={{ backgroundColor: "#ef864c" }}
                  >
                    <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>

                <h3
                  className="text-2xl md:text-3xl font-bold mb-3 transition-colors"
                  style={{ color: "#0f4656" }}
                >
                  Ecommerce
                </h3>

                <p
                  className="text-sm md:text-base mb-6 leading-relaxed"
                  style={{ color: "#0f4656" }}
                >
                  Explore our vibrant marketplace. Shop from thousands of
                  products, connect with sellers, and enjoy a seamless shopping
                  experience.
                </p>

                <div className="space-y-3 mb-6">
                  <div
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: "#0f4656" }}
                  >
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                    <span>Browse extensive product catalog</span>
                  </div>
                  <div
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: "#0f4656" }}
                  >
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                    <span>Secure payment processing</span>
                  </div>
                  <div
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: "#0f4656" }}
                  >
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                    <span>Seller-buyer messaging</span>
                  </div>
                </div>

                <div
                  className="flex items-center font-semibold text-base md:text-lg group-hover:gap-3 transition-all"
                  style={{ color: "#ef864c" }}
                >
                  <span>Explore Ecommerce</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Background decoration */}
              <div
                className="absolute -right-16 -bottom-16 w-40 h-40 rounded-full group-hover:scale-150 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
              ></div>
            </button>

            {/* Enhanced Real Estate Card */}
            <button
              onClick={() => handleFlowSelect("realestate")}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl border-2 p-6 md:p-8 text-left hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              style={{
                borderColor: "rgba(239, 134, 76, 0.3)",
                backgroundColor: "#ffffff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#ef864c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(239, 134, 76, 0.3)")
              }
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 transition-all duration-500 pointer-events-none"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(239, 134, 76, 0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              ></div>

              {/* Decorative corner element */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700 pointer-events-none"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
              ></div>

              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"
                    style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                  ></div>
                  <div
                    className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-2xl"
                    style={{ backgroundColor: "#ef864c" }}
                  >
                    <Building2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>

                <h3
                  className="text-2xl md:text-3xl font-bold mb-3 transition-colors"
                  style={{ color: "#0f4656" }}
                >
                  Real Estate
                </h3>

                <p
                  className="text-sm md:text-base mb-6 leading-relaxed"
                  style={{ color: "#0f4656" }}
                >
                  Discover your dream property. Browse listings, schedule
                  viewings, connect with agents, and find your perfect home or
                  investment opportunity.
                </p>

                <div className="space-y-3 mb-6">
                  <div
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: "#0f4656" }}
                  >
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                    <span>Property listings & virtual tours</span>
                  </div>
                  <div
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: "#0f4656" }}
                  >
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                    <span>Expert agent connections</span>
                  </div>
                  <div
                    className="flex items-center gap-3 text-sm md:text-base"
                    style={{ color: "#0f4656" }}
                  >
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(239, 134, 76, 0.2)" }}
                    >
                      <CheckCircle2
                        className="w-3 h-3 md:w-4 md:h-4"
                        style={{ color: "#ef864c" }}
                      />
                    </div>
                    <span>Property management tools</span>
                  </div>
                </div>

                <div
                  className="flex items-center font-semibold text-base md:text-lg group-hover:gap-3 transition-all"
                  style={{ color: "#ef864c" }}
                >
                  <span>Explore Real Estate</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Background decoration */}
              <div
                className="absolute -right-16 -bottom-16 w-40 h-40 rounded-full group-hover:scale-150 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: "rgba(239, 134, 76, 0.1)" }}
              ></div>
            </button>
          </div>
        </div>

        {/* Enhanced Sign In Section */}
        {!isLoggedIn && (
          <div className="text-center mt-8 md:mt-10">
            <p
              className="text-base md:text-lg lg:text-xl"
              style={{ color: "#ffffff" }}
            >
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold transition-colors underline-offset-4 hover:underline decoration-2"
                style={{ color: "#ef864c" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#d9723f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ef864c")}
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowSelection;
