"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Store,
  ShoppingBag,
  Home,
  ArrowRight,
  Check,
  LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAssignRolesMutation } from "@/services/redux/api/authApi";
import type { AssignRolesPayload } from "@/services/redux/api/authApi";

export default function SelectRoles() {
  const router = useRouter();
  const [assignRoles, { isLoading: loading }] = useAssignRolesMutation();

  // Use explicit RoleType for keys
  type RoleType =
    | "ecommerceBuyer"
    | "ecommerceSeller"
    | "realEstateBuyer"
    | "realEstateSeller";

  const [selectedRoles, setSelectedRoles] = useState<Record<RoleType, boolean>>(
    {
      ecommerceBuyer: false,
      ecommerceSeller: false,
      realEstateBuyer: false,
      realEstateSeller: false,
    },
  );

  // Configuration for roles matching the design
  const roleConfig: Record<
    RoleType,
    {
      label: string;
      icon: LucideIcon;
      color: "primary" | "secondary" | "accent" | string;
    }
  > = {
    ecommerceSeller: {
      label: "Ecommerce Seller",
      icon: Store,
      color: "secondary",
    },
    ecommerceBuyer: {
      label: "Ecommerce Buyer",
      icon: ShoppingBag,
      color: "primary",
    },
    realEstateSeller: {
      label: "Real Estate Seller",
      icon: Home,
      color: "#22c55e",
    }, // Using a green for distinction or primary
    realEstateBuyer: {
      label: "Real Estate Buyer",
      icon: Home,
      color: "primary",
    },
  };

  const userRoles = Object.keys(roleConfig) as RoleType[];

  const toggleRole = (role: RoleType) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const hasAnyRole = Object.values(selectedRoles).some(Boolean);

  const handleContinue = async () => {
    if (!hasAnyRole) {
      toast({
        title: "Selection Required",
        description: "Please select at least one role to continue",
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

      if (result.user) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.roles = result.user.roles;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      toast({
        title: "Roles Assigned",
        description: "Your roles have been assigned successfully",
      });

      if (selectedRoles.ecommerceSeller) {
        router.push("/ecommerce/seller/dashboard");
      } else if (selectedRoles.realEstateSeller) {
        router.push("/real-estate/seller/dashboard");
      } else if (selectedRoles.ecommerceBuyer) {
        router.push("/ecommerce/buyer/dashboard");
      } else if (selectedRoles.realEstateBuyer) {
        router.push("/real-estate/buyer/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as Error | undefined)?.message ||
        "Unable to assign roles. Please try again.";
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="w-[95%] sm:w-full sm:max-w-[720px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-[#0f4656]">
          {/* Slanted accent strip */}
          <div
            className="absolute inset-y-0 right-0 w-[42%] hidden sm:block pointer-events-none"
            style={{
              backgroundColor: "#ffbf58",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 20% 100%)",
            }}
          />

          <div className="relative px-6 py-6 sm:px-9 sm:py-8">
            <DialogHeader className="mb-4 text-left">
              <DialogTitle className="text-2xl font-heading text-white flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(239,134,76,0.2)] text-[#ef864c] shadow-lg backdrop-blur-sm">
                  <Home className="w-5 h-5" />
                </span>
                Choose Your Role
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base pt-2 text-[rgba(255,255,255,0.8)]">
                You have multiple ways to use Zayan. Select how you want to
                continue this session.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 items-stretch">
              {userRoles.map((role) => {
                const config = roleConfig[role];
                const isSelected = selectedRoles[role];

                const baseColor =
                  config.color === "primary"
                    ? "#ef864c"
                    : config.color === "secondary"
                      ? "#4f46e5"
                      : "#22c55e";

                return (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`group relative overflow-hidden rounded-2xl border px-5 py-5 text-left transition-all h-full
                      ${
                        isSelected
                          ? "border-[#ef864c] bg-[rgba(9,60,75,0.98)] translate-y-[-2px] shadow-lg shadow-[#ef864c]/20"
                          : "border-[rgba(239,134,76,0.35)] bg-[rgba(6,44,56,0.95)] hover:border-[#ef864c] hover:bg-[rgba(9,60,75,0.98)] hover:-translate-y-0.5"
                      }
                    `}
                  >
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-[rgba(239,134,76,0.25)]/40 via-transparent to-transparent pointer-events-none ${isSelected ? "opacity-100" : ""}`}
                    />

                    {/* Selected Checkmark Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-[#ef864c] text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    <div className="relative flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md shrink-0"
                        style={{ color: baseColor }}
                      >
                        <config.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-lg leading-tight truncate">
                          {config.label}
                        </h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.7)] truncate">
                          Continue as {config.label.split(" ")[1]}
                        </p>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 text-[rgba(255,255,255,0.7)] transition-transform shrink-0 ${isSelected ? "translate-x-0.5 text-white" : "group-hover:translate-x-0.5"}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <Button
                onClick={handleContinue}
                disabled={loading || !hasAnyRole}
                className="w-full sm:w-auto min-w-[200px] h-11 bg-[#ef864c] hover:bg-[#d9753c] text-white rounded-xl font-medium shadow-lg shadow-[#ef864c]/25 transition-all text-base"
              >
                {loading ? "Assigning..." : "Continue"}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>

              <p className="text-xs text-center text-[rgba(255,255,255,0.7)]">
                You can always switch roles later from your profile settings.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
