"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Check,
  X,
  Star,
  Zap,
  Crown,
  Package,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Lock,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
  useFeatureListingMutation,
  useBoostListingMutation,
} from "@/services/redux/api/subscriptionApi";
import { useCreatePaymentIntentMutation } from "@/services/redux/api/paymentApi";
import { useGetProductsQuery } from "@/services/redux/api/productApi";
import { useGetPropertiesQuery } from "@/services/redux/api/propertyApi";
import { StripeProvider } from "@/components/payments/StripeProvider";
import { PaymentForm } from "@/components/payments/PaymentForm";

interface SubscriptionManagementProps {
  role: "ecommerceSeller" | "realEstateSeller";
}

export default function SubscriptionManagement({
  role,
}: SubscriptionManagementProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [isBoostDialogOpen, setIsBoostDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "product" | "property" | null
  >(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(
    null,
  );
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<
    (typeof allPlans)[0] | null
  >(null);

  // Fetch plans
  const { data: plansData, isLoading: isPlansLoading } = useGetPlansQuery(role);
  const allPlans = plansData?.plans || [];

  // Filter plans by billing period
  const plans = allPlans.filter(
    (plan) => (plan.billingPeriod || "monthly") === billingPeriod,
  );

  // Fetch current subscription
  const {
    data: subscriptionData,
    isLoading: isSubscriptionLoading,
    refetch: refetchSubscription,
  } = useGetMySubscriptionQuery(role);
  const subscription = subscriptionData?.subscription;

  // Fetch products/properties for feature/boost
  const { data: productsData } = useGetProductsQuery(undefined, {
    skip: role !== "ecommerceSeller",
  });
  const { data: propertiesData } = useGetPropertiesQuery(undefined, {
    skip: role !== "realEstateSeller",
  });

  const products = productsData?.products || [];
  const properties = propertiesData?.properties || [];

  // Mutations
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();
  const [featureListing, { isLoading: isFeaturing }] =
    useFeatureListingMutation();
  const [boostListing, { isLoading: isBoosting }] = useBoostListingMutation();
  const [createPaymentIntent, { isLoading: isCreatingIntent }] =
    useCreatePaymentIntentMutation();

  const handleSubscribe = async (planId?: string) => {
    const id = planId || selectedPlanId;
    if (!id) return;

    setSelectedPlanId(id);

    try {
      // Find the selected plan
      const plan = allPlans.find((p) => p._id === id);
      if (!plan) {
        toast.error("Plan not found");
        setSelectedPlanId(null);
        return;
      }

      // Check if it's a free plan
      if (plan.price === 0) {
        // Free plan - activate immediately
        await subscribe({ planId: id, role }).unwrap();
        toast.success("Subscription activated successfully!");
        setSelectedPlanId(null);
        refetchSubscription();
      } else {
        // Paid plan - create payment intent
        const result = await createPaymentIntent({ planId: id, role }).unwrap();

        if (result.freePlan) {
          // Should not happen, but handle gracefully
          await subscribe({ planId: id, role }).unwrap();
          toast.success("Subscription activated successfully!");
          setSelectedPlanId(null);
          refetchSubscription();
        } else if (result.clientSecret) {
          // Open payment dialog
          setSelectedPlanForPayment(plan);
          setPaymentClientSecret(result.clientSecret);
          setIsPaymentDialogOpen(true);
        } else {
          toast.error(result.message || "Failed to initialize payment");
          setSelectedPlanId(null);
        }
      }
    } catch (error: any) {
      const message = error?.data?.message || "Failed to subscribe";
      toast.error(message);
      setSelectedPlanId(null);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful. Activating subscription...");
    setIsPaymentDialogOpen(false);
    setPaymentClientSecret(null);
    setSelectedPlanForPayment(null);
    setSelectedPlanId(null);
    // Refetch subscription after a delay to allow webhook to process
    setTimeout(() => {
      refetchSubscription();
    }, 3000);
  };

  const handlePaymentError = (errorMsg: string) => {
    toast.error(errorMsg || "Payment failed");
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription({ role }).unwrap();
      toast.success("Subscription cancelled successfully");
      refetchSubscription();
    } catch (error: any) {
      const message = error?.data?.message || "Failed to cancel subscription";
      toast.error(message);
    }
  };

  const handleFeature = async () => {
    if (!selectedItemId || !selectedItemType) return;

    try {
      await featureListing({
        itemId: selectedItemId,
        itemType: selectedItemType,
      }).unwrap();
      toast.success("Listing featured successfully!");
      setIsFeatureDialogOpen(false);
      setSelectedItemId(null);
      setSelectedItemType(null);
    } catch (error: any) {
      const message = error?.data?.message || "Failed to feature listing";
      toast.error(message);
    }
  };

  const handleBoost = async () => {
    if (!selectedItemId || !selectedItemType) return;

    try {
      await boostListing({
        itemId: selectedItemId,
        itemType: selectedItemType,
      }).unwrap();
      toast.success("Listing boosted successfully!");
      setIsBoostDialogOpen(false);
      setSelectedItemId(null);
      setSelectedItemType(null);
    } catch (error: any) {
      const message = error?.data?.message || "Failed to boost listing";
      toast.error(message);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Basic":
        return <Package className="w-6 h-6" />;
      case "Pro":
        return <Star className="w-6 h-6" />;
      case "Premium":
        return <Crown className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isPlansLoading || isSubscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#ef864c" }}
        />
      </div>
    );
  }

  const items = role === "ecommerceSeller" ? products : properties;
  const itemType = role === "ecommerceSeller" ? "product" : "property";

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 lg:space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#ef864c] font-black text-[9px] lg:text-sm uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              Secure License Center
            </div>
            <h1 className="text-2xl lg:text-5xl font-black text-[#0f4656] tracking-tight leading-tight">
              Growth & Monetization
            </h1>
            <p className="text-xs lg:text-lg font-bold text-[#0f4656]/50 max-w-2xl">
              Optimize your market presence. Enhance listing visibility and
              unlock elite tools to scale your portfolio.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-[#0f4656]/30 uppercase tracking-widest bg-white rounded-full px-4 py-2 shadow-sm border border-[#0f4656]/5">
            <Lock className="w-3.5 h-3.5 text-[#ef864c]" />
            Encrypted Checkout by Stripe
          </div>
        </div>

        {/* Value narrative — outcomes, not feature spam */}
        <div className="rounded-[20px] bg-white/80 border border-[#0f4656]/5 p-5 lg:p-6 shadow-sm">
          <p className="text-sm lg:text-base font-medium text-[#0f4656]/80 leading-relaxed max-w-3xl">
            {role === "ecommerceSeller" ? (
              <>
                Start with one product free and list immediately. When you're ready to grow your catalog and get more visibility, upgrade to list more products and feature your best items so buyers see them first.
              </>
            ) : (
              <>
                Start with your first property free. Upgrade when you're ready to list more and stand out—featured placement and priority support help your best listings get in front of serious buyers.
              </>
            )}
          </p>
        </div>

        {/* Current Subscription Cinematic Status */}
        {subscription && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#ef864c] font-black text-[9px] lg:text-xs uppercase tracking-widest pl-1">
              <div className="h-0.5 w-6 bg-[#ef864c]" />
              License Overview
            </div>
            <Card className="border-0 shadow-2xl bg-white rounded-[20px] overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef864c]/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000" />

              <CardHeader className="pb-4 lg:pb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="p-4 lg:p-6 bg-gradient-to-br from-[#ef864c] to-[#d9723f] rounded-[24px] lg:rounded-[32px] text-white shadow-xl shadow-[#ef864c]/20 transition-transform group-hover:rotate-3">
                      {getPlanIcon(subscription.planId.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                        <CardTitle className="text-2xl lg:text-4xl font-black text-[#0f4656] tracking-tight">
                          {subscription.planId.name}
                        </CardTitle>
                        <Badge className="bg-green-500 text-white border-0 font-black text-[8px] lg:text-[10px] uppercase tracking-widest rounded-lg px-2 lg:px-3 h-5 lg:h-6">
                          {subscription.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1.5 mt-1.5 lg:mt-2 text-[10px] lg:text-base font-black text-[#0f4656]/40 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ef864c]" />
                        Renews on {formatDate(subscription.endDate)}
                        <span className="hidden sm:inline bg-[#ef864c]/10 text-[#ef864c] px-2 py-0.5 rounded-md ml-2">
                          {getDaysRemaining(subscription.endDate)} Days Left
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  {!(
                    subscription.planId.name === "Basic" &&
                    subscription.planId.price === 0
                  ) && (
                    <Button
                      variant="outline"
                      className="border-[#0f4656]/10 text-[#0f4656]/40 hover:text-red-500 hover:bg-red-50 font-black text-[10px] lg:text-xs uppercase rounded-xl lg:rounded-2xl h-10 lg:h-12 px-6 transition-all"
                      onClick={handleCancel}
                      disabled={
                        isCancelling || subscription.status !== "active"
                      }
                    >
                      {isCancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-1.5" />
                      )}
                      Terminate License
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 lg:pt-4 relative px-6 lg:px-12 pb-8 lg:pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 py-6 lg:py-8 border-t border-[#0f4656]/5">
                  <div className="space-y-2">
                    <div className="text-[10px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Listing Capacity
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl lg:text-5xl font-black text-[#0f4656] tracking-tight">
                        {subscription.planId.features.maxListings === 0
                          ? "∞"
                          : subscription.planId.features.maxListings}
                      </span>
                      <span className="text-[10px] lg:text-sm font-black text-[#0f4656]/40 uppercase">
                        Assets Allowed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                        Promotional Power
                      </div>
                      <span className="text-[10px] font-black text-[#ef864c]">
                        {subscription.planId.features.featuredListingsCount > 0
                          ? `${subscription.usage.featuredUsed}/${subscription.planId.features.featuredListingsCount}`
                          : "UNLIMITED"}
                      </span>
                    </div>
                    <div className="w-full bg-[#0f4656]/5 h-2 lg:h-3 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#ef864c] to-[#d9723f] h-full rounded-full transition-all duration-1000"
                        style={{
                          width:
                            subscription.planId.features.featuredListingsCount >
                            0
                              ? `${(subscription.usage.featuredUsed / subscription.planId.features.featuredListingsCount) * 100}%`
                              : "100%",
                        }}
                      />
                    </div>
                    <p className="text-[9px] font-black text-[#0f4656]/20 uppercase tracking-tighter">
                      Featured Slots Remaining
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest">
                      Platform Priority
                    </div>
                    <div className="flex items-center gap-3">
                      {subscription.planId.features.boostedVisibility ? (
                        <>
                          <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-[#ef864c]/10 flex items-center justify-center text-[#ef864c] shadow-lg shadow-[#ef864c]/10">
                            <Zap className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                          </div>
                          <span className="text-lg lg:text-2xl font-black text-[#0f4656] tracking-tight  ">
                            ENHANCED 10X
                          </span>
                        </>
                      ) : (
                        <span className="text-lg lg:text-2xl font-black text-[#0f4656]/20 uppercase tracking-tight  ">
                          STANDARD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Power Actions Section */}
        {subscription && subscription.status === "active" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#ef864c] font-black text-[9px] lg:text-xs uppercase tracking-widest pl-1">
              <div className="h-0.5 w-6 bg-[#ef864c]" />
              Market Dominance Tools
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <Dialog
                open={isFeatureDialogOpen}
                onOpenChange={setIsFeatureDialogOpen}
              >
                <DialogTrigger asChild>
                  <button className="group relative flex items-start gap-4 p-5 lg:p-10 bg-white rounded-[20px] border-0 shadow-xl hover:shadow-2xl transition-all text-left overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-[#ef864c]/5 group-hover:scale-125 transition-transform duration-1000">
                      <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="p-4 lg:p-6 bg-[#ef864c]/10 rounded-[20px] lg:rounded-[32px] text-[#ef864c]">
                      <Sparkles className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <div className="flex-1 space-y-1 lg:space-y-2">
                      <h3 className="text-lg lg:text-2xl font-black text-[#0f4656] flex items-center gap-3  ">
                        Feature Listing
                        <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#ef864c]" />
                      </h3>
                      <p className="text-xs lg:text-base font-bold text-[#0f4656]/50 leading-relaxed max-w-[280px]">
                        Command attention by pinning your asset to the apex of
                        selective search indices.
                      </p>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-[32px] p-6 lg:p-10 border-0 shadow-2xl bg-white max-w-lg">
                  <DialogHeader className="space-y-4">
                    <DialogTitle className="text-2xl lg:text-3xl font-black text-[#0f4656]">
                      Elevate Visibility
                    </DialogTitle>
                    <DialogDescription className="text-base lg:text-lg font-medium text-[#0f4656]/60">
                      Select an asset to designate as a Platinum Feature.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-8 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center bg-[#0f4656]/5 rounded-3xl border-2 border-dashed border-[#0f4656]/10">
                        <Package className="w-12 h-12 text-[#0f4656]/20 mb-3" />
                        <p className="text-[#0f4656]/40 text-sm font-black uppercase tracking-widest">
                          Inventory Empty
                        </p>
                      </div>
                    ) : (
                      items.map((item: any) => (
                        <button
                          key={item._id}
                          className={cn(
                            "w-full flex items-center justify-between p-4 lg:p-5 rounded-2xl border-4 transition-all text-left group",
                            selectedItemId === item._id
                              ? "bg-[#ef864c]/10 border-[#ef864c] shadow-lg"
                              : "bg-white border-[#0f4656]/5 hover:border-[#0f4656]/10",
                          )}
                          onClick={() => {
                            setSelectedItemId(item._id);
                            setSelectedItemType(itemType);
                          }}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full shrink-0",
                                selectedItemId === item._id
                                  ? "bg-[#ef864c] shadow-[0_0_10px_rgba(239,134,76,0.5)]"
                                  : "bg-[#0f4656]/10",
                              )}
                            />
                            <span className="font-black text-sm lg:text-base text-[#0f4656] truncate">
                              {item.name || item.title}
                            </span>
                          </div>
                          {selectedItemId === item._id && (
                            <CheckCircle2 className="w-5 h-5 text-[#ef864c] shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-10">
                    <Button
                      variant="ghost"
                      className="flex-1 h-14 rounded-2xl font-black text-[#0f4656]/40"
                      onClick={() => setIsFeatureDialogOpen(false)}
                    >
                      CANCEL
                    </Button>
                    <Button
                      className="flex-[2] h-14 bg-gradient-to-r from-[#ef864c] to-[#d9723f] text-white rounded-2xl font-black shadow-xl shadow-[#ef864c]/30 active:scale-95"
                      onClick={handleFeature}
                      disabled={!selectedItemId || isFeaturing}
                    >
                      {isFeaturing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "EXECUTE FEATURE"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {subscription.planId.features.boostedVisibility && (
                <Dialog
                  open={isBoostDialogOpen}
                  onOpenChange={setIsBoostDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button className="group relative flex items-start gap-4 p-5 lg:p-10 bg-white rounded-[20px] border-0 shadow-xl hover:shadow-2xl transition-all text-left overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-[#0f4656]/5 group-hover:scale-125 transition-transform duration-1000">
                        <Zap className="w-32 h-32" />
                      </div>
                      <div className="p-4 lg:p-6 bg-[#0f4656]/5 rounded-[20px] lg:rounded-[32px] text-[#0f4656]">
                        <Zap className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                      <div className="flex-1 space-y-1 lg:space-y-2">
                        <h3 className="text-lg lg:text-2xl font-black text-[#0f4656] flex items-center gap-3  ">
                          Boost Authority
                          <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0f4656]" />
                        </h3>
                        <p className="text-xs lg:text-base font-bold text-[#0f4656]/50 leading-relaxed max-w-[280px]">
                          Accelerate lead generation with 10x priority placement
                          in precision recommendations.
                        </p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[32px] p-6 lg:p-10 border-0 shadow-2xl bg-white max-w-lg">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="text-2xl lg:text-3xl font-black text-[#0f4656]">
                        Force Multiplier
                      </DialogTitle>
                      <DialogDescription className="text-base lg:text-lg font-medium text-[#0f4656]/60">
                        Apply global visibility boost to your target listing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-8 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-[#0f4656]/5 rounded-3xl border-2 border-dashed border-[#0f4656]/10">
                          <Zap className="w-12 h-12 text-[#0f4656]/20 mb-3" />
                          <p className="text-[#0f4656]/40 text-sm font-black uppercase tracking-widest">
                            No Targets Available
                          </p>
                        </div>
                      ) : (
                        items.map((item: any) => (
                          <button
                            key={item._id}
                            className={cn(
                              "w-full flex items-center justify-between p-4 lg:p-5 rounded-2xl border-4 transition-all text-left group",
                              selectedItemId === item._id
                                ? "bg-[#0f4656]/10 border-[#0f4656] shadow-lg"
                                : "bg-white border-[#0f4656]/5 hover:border-[#0f4656]/10",
                            )}
                            onClick={() => {
                              setSelectedItemId(item._id);
                              setSelectedItemType(itemType);
                            }}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full shrink-0",
                                  selectedItemId === item._id
                                    ? "bg-[#0f4656] shadow-[0_0_10px_rgba(15,70,86,0.3)]"
                                    : "bg-[#0f4656]/10",
                                )}
                              />
                              <span className="font-black text-sm lg:text-base text-[#0f4656] truncate">
                                {item.name || item.title}
                              </span>
                            </div>
                            {selectedItemId === item._id && (
                              <CheckCircle2 className="w-5 h-5 text-[#0f4656] shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-10">
                      <Button
                        variant="ghost"
                        className="flex-1 h-14 rounded-2xl font-black text-[#0f4656]/40"
                        onClick={() => setIsBoostDialogOpen(false)}
                      >
                        CANCEL
                      </Button>
                      <Button
                        className="flex-[2] h-14 bg-[#0f4656] text-white rounded-2xl font-black shadow-xl shadow-[#0f4656]/20 active:scale-95"
                        onClick={handleBoost}
                        disabled={!selectedItemId || isBoosting}
                      >
                        {isBoosting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "EXECUTE BOOST"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </section>
        )}

        {/* Premium Portfolio Tier Selection Area */}
        <section className="space-y-6 lg:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[#ef864c] font-black text-[9px] lg:text-xs uppercase tracking-widest pl-1">
              <div className="h-0.5 w-6 bg-[#ef864c]" />
              Select Your Tier
            </div>

            {/* Ultra-Modern Billing Toggle */}
            {allPlans.some((p) => p.billingPeriod === "yearly") && (
              <div className="bg-[#0f4656]/5 rounded-2xl p-1.5 flex gap-1 w-fit border border-[#0f4656]/5 shadow-inner scale-90 lg:scale-100">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs lg:text-sm font-black uppercase tracking-widest transition-all",
                    billingPeriod === "monthly"
                      ? "bg-white text-[#ef864c] shadow-lg shadow-[#0f4656]/5"
                      : "text-[#0f4656]/40 hover:text-[#0f4656]/60",
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs lg:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    billingPeriod === "yearly"
                      ? "bg-white text-[#ef864c] shadow-lg shadow-[#0f4656]/5"
                      : "text-[#0f4656]/40 hover:text-[#0f4656]/60",
                  )}
                >
                  Yearly
                  <span className="bg-[#ef864c] text-white px-2 py-0.5 rounded-md text-[8px] lg:text-[10px] shadow-sm">
                    -20%
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Plan comparison table — clean, value-oriented */}
          {plans.length > 0 && (
            <div className="overflow-x-auto rounded-[20px] border border-[#0f4656]/10 bg-white shadow-sm">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-[#0f4656]/10 bg-[#0f4656]/[0.02]">
                    <th className="py-4 px-4 lg:px-6 text-[10px] lg:text-xs font-black text-[#0f4656]/50 uppercase tracking-widest">
                      Feature
                    </th>
                    {plans.map((plan) => {
                      const isCurrent = subscription?.planId._id === plan._id;
                      return (
                        <th
                          key={plan._id}
                          className={cn(
                            "py-4 px-4 lg:px-6 text-sm lg:text-base font-black text-[#0f4656]",
                            isCurrent && "bg-[#ef864c]/5",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {plan.name}
                            {isCurrent && (
                              <Badge className="bg-[#ef864c] text-white border-0 text-[9px] font-black rounded-full px-2 h-5">
                                Current
                              </Badge>
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-[#0f4656]/5">
                    <td className="py-3 px-4 lg:px-6 font-semibold text-[#0f4656]/80">
                      Price
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={plan._id}
                        className="py-3 px-4 lg:px-6 font-bold text-[#0f4656]"
                      >
                        {plan.price === 0
                          ? "Free"
                          : `$${plan.price}/${plan.billingPeriod === "yearly" ? "yr" : "mo"}`}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#0f4656]/5">
                    <td className="py-3 px-4 lg:px-6 font-semibold text-[#0f4656]/80">
                      {role === "ecommerceSeller" ? "Products" : "Listings"}
                    </td>
                    {plans.map((plan) => (
                      <td key={plan._id} className="py-3 px-4 lg:px-6">
                        {plan.features.maxListings === 0
                          ? "Unlimited"
                          : plan.features.maxListings}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#0f4656]/5">
                    <td className="py-3 px-4 lg:px-6 font-semibold text-[#0f4656]/80">
                      Featured slots
                    </td>
                    {plans.map((plan) => (
                      <td key={plan._id} className="py-3 px-4 lg:px-6">
                        {plan.features.featuredListingsCount === 0
                          ? "Unlimited"
                          : plan.features.featuredListingsCount}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#0f4656]/5">
                    <td className="py-3 px-4 lg:px-6 font-semibold text-[#0f4656]/80">
                      Boosted visibility
                    </td>
                    {plans.map((plan) => (
                      <td key={plan._id} className="py-3 px-4 lg:px-6">
                        {plan.features.boostedVisibility ? (
                          <Check className="w-4 h-4 text-[#ef864c] inline" />
                        ) : (
                          <span className="text-[#0f4656]/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 lg:px-6 font-semibold text-[#0f4656]/80">
                      Priority support
                    </td>
                    {plans.map((plan) => (
                      <td key={plan._id} className="py-3 px-4 lg:px-6">
                        {plan.features.prioritySupport ? (
                          <Check className="w-4 h-4 text-[#ef864c] inline" />
                        ) : (
                          <span className="text-[#0f4656]/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {plans.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[20px] border-4 border-dashed border-[#0f4656]/5 shadow-2xl">
              <div className="w-16 h-16 bg-[#0f4656]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0f4656]/20">
                <Package className="w-8 h-8" />
              </div>
              <p className="text-xl lg:text-3xl font-black text-[#0f4656] tracking-tight">
                No Tiers Found
              </p>
              <p className="text-[#0f4656]/40 font-bold max-w-sm mx-auto mt-4 px-6">
                Directives for these roles are currently offline. Contact the
                Command Center.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {plans.map((plan) => {
                const isPremium =
                  plan.name === "Premium" || plan.name === "Pro";
                const isCurrent = subscription?.planId._id === plan._id;
                const isFree = plan.price === 0;

                return (
                  <Card
                    key={plan._id}
                    className={cn(
                      "group relative flex flex-col h-full rounded-[20px] transition-all duration-700 overflow-hidden border-0 shadow-xl",
                      isCurrent
                        ? "bg-white ring-4 ring-[#ef864c] shadow-2xl scale-[1.02]"
                        : "bg-white hover:shadow-2xl hover:-translate-y-1.5",
                    )}
                  >
                    {isPremium && !isCurrent && (
                      <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
                        <div className="absolute top-6 -right-10 w-[140%] rotate-45 bg-[#EF864C] py-2 text-[8px] font-black text-white text-center shadow-lg uppercase tracking-[0.2em] shadow-[#ef864c]/30">
                          ELITE CHOICE
                        </div>
                      </div>
                    )}

                    <CardHeader className="p-5 lg:p-7 pb-3 lg:pb-4">
                      <div className="flex items-start justify-between">
                        <div
                          className={cn(
                            "p-3.5 lg:p-4.5 rounded-[20px] lg:rounded-[24px] shadow-lg transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6",
                            isFree
                              ? "bg-[#0f4656]/5 text-[#0f4656]/40"
                              : "bg-[#ef864c]/10 text-[#ef864c]",
                          )}
                        >
                          {getPlanIcon(plan.name)}
                        </div>
                        {isCurrent && (
                          <Badge className="bg-[#ef864c] text-white border-0 font-black text-[10px] uppercase rounded-full px-4 h-7">
                            ACTIVE
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 lg:mt-5 space-y-1 lg:space-y-2">
                        <CardTitle className="text-xl lg:text-3xl font-black text-[#0f4656] tracking-tight">
                          {plan.name}
                        </CardTitle>
                        <p className="text-[10px] lg:text-xs font-black text-[#0f4656]/40 uppercase tracking-widest   group-hover:text-[#ef864c] transition-colors">
                          Accelerate growth targets
                        </p>
                      </div>

                      <div className="mt-4 lg:mt-5 flex items-baseline gap-1 lg:gap-2">
                        {isFree ? (
                          <span className="text-2xl lg:text-4xl font-black text-[#0f4656] tracking-tighter uppercase   opacity-20">
                            Free
                          </span>
                        ) : (
                          <>
                            <span className="text-xs lg:text-sm font-black text-[#0f4656]/30 self-start mt-1.5">
                              $
                            </span>
                            <span className="text-3xl lg:text-5xl font-black text-[#0f4656] tracking-tighter">
                              {plan.price}
                            </span>
                            <span className="text-[10px] lg:text-xs font-black text-[#0f4656]/30 ml-1 uppercase tracking-widest">
                              /
                              {plan.billingPeriod === "yearly"
                                ? "Annually"
                                : "Monthly"}
                            </span>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 lg:px-7 pb-3 lg:pb-4 flex-1">
                      <div className="h-0.5 w-12 bg-[#ef864c] mb-4 lg:mb-5 opacity-20 group-hover:w-full transition-all duration-700" />
                      <ul className="space-y-2.5 lg:space-y-3.5">
                        {[
                          {
                            val:
                              plan.features.maxListings === 0
                                ? "Infinite"
                                : plan.features.maxListings,
                            label: "Asset Slots",
                          },
                          {
                            val:
                              plan.features.maxStores === 0
                                ? "Infinite"
                                : plan.features.maxStores,
                            label: "Store Slots",
                          },
                          {
                            val:
                              plan.features.featuredListingsCount === 0
                                ? "Infinite"
                                : plan.features.featuredListingsCount,
                            label: "Featured Licenses",
                          },
                          {
                            val: plan.features.boostedVisibility
                              ? "Included"
                              : "Limited",
                            label: "Priority Exposure",
                            active: plan.features.boostedVisibility,
                          },
                          {
                            val: plan.features.prioritySupport
                              ? "Precision"
                              : "Standard",
                            label: "Support Protocol",
                            active: plan.features.prioritySupport,
                          },
                        ].map((feat, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-4 group/item"
                          >
                            <div
                              className={cn(
                                "h-6 w-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                feat.active !== false
                                  ? "bg-[#ef864c]/10 text-[#ef864c]"
                                  : "bg-[#0f4656]/5 text-[#0f4656]/20",
                              )}
                            >
                              <Check className="w-3.5 h-3.5" strokeWidth={4} />
                            </div>
                            <div className="flex flex-col">
                              <span
                                className={cn(
                                  "text-sm lg:text-base font-black leading-none",
                                  feat.active !== false
                                    ? "text-[#0f4656]"
                                    : "text-[#0f4656]/30",
                                )}
                              >
                                {feat.val}
                              </span>
                              <span className="text-[9px] lg:text-[10px] font-black text-[#0f4656]/40 uppercase tracking-tighter">
                                {feat.label}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="p-5 lg:p-7 pt-0">
                      <Button
                        className={cn(
                          "w-full h-11 lg:h-14 rounded-xl lg:rounded-[24px] text-xs lg:text-base font-black uppercase tracking-widest shadow-2xl transition-all duration-500",
                          isCurrent
                            ? "bg-[#0f4656]/5 text-[#0f4656]/20 cursor-not-allowed border-0"
                            : isPremium
                              ? "bg-[#ef864c] hover:bg-[#d9723f] text-white shadow-[#ef864c]/40 hover:scale-[1.05] active:scale-95"
                              : "bg-[#0f4656] text-white hover:bg-[#155a6d] hover:scale-[1.05] active:scale-95",
                        )}
                        onClick={() => !isCurrent && handleSubscribe(plan._id)}
                        disabled={
                          isCurrent ||
                          (isSubscribing && selectedPlanId === plan._id) ||
                          isCreatingIntent
                        }
                      >
                        {isCurrent ? (
                          "License Active"
                        ) : isSubscribing && selectedPlanId === plan._id ? (
                          <Loader2 className="w-5 h-5 lg:w-7 lg:h-7 animate-spin" />
                        ) : isFree ? (
                          "Initiate Trial"
                        ) : (
                          <div className="flex items-center gap-3">
                            {subscription ? "Upgrade Tier" : "Subscribe"}
                            <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </div>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {!subscription && (
          <div className="bg-[#0f4656] rounded-[20px] p-8 lg:p-16 flex flex-col md:flex-row items-center gap-10 justify-between relative overflow-hidden shadow-[0_32px_64px_-12px_rgba(15,70,86,0.3)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full -mr-48 -mt-48" />
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-[0.5px]">
                Need a bespoke solution?
              </h3>
              <p className="text-sm lg:text-lg font-bold text-white/50 max-w-xl leading-relaxed">
                For high-velocity enterprises or specialized brokerage
                requirements, our consultants can architect a dedicated tier
                optimized for your global scale.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-14 lg:h-20 px-8 lg:px-12 rounded-2xl lg:rounded-[32px] font-black text-white border-white/20 bg-white/10 transition-all shadow-2xl uppercase tracking-widest text-xs lg:text-base"
            >
              Contact
            </Button>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-white dark:bg-slate-900">
            <div className="bg-[#0f4656]/5 p-8 lg:p-12 border-b border-[#0f4656]/5">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-xl text-[#ef864c]">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <DialogTitle className="text-2xl lg:text-3xl font-black tracking-tight text-[#0f4656]">
                    Secure Protocol
                  </DialogTitle>
                  <p className="text-xs lg:text-sm font-black text-[#0f4656]/30 uppercase tracking-widest mt-1">
                    Deploying {selectedPlanForPayment?.name} License
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12">
              {paymentClientSecret && selectedPlanForPayment && (
                <StripeProvider clientSecret={paymentClientSecret}>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-[#0f4656]/5 rounded-3xl border border-[#0f4656]/5 shadow-inner">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl text-[#0f4656]/20 shadow-sm">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="font-black text-lg text-[#0f4656]">
                          {selectedPlanForPayment.name}
                        </div>
                      </div>
                      <div className="text-2xl lg:text-3xl font-black text-[#0f4656] tracking-tighter">
                        ${selectedPlanForPayment.price}
                        <span className="text-[10px] text-[#0f4656]/30 ml-2 font-black uppercase tracking-widest">
                          /
                          {selectedPlanForPayment.billingPeriod === "yearly"
                            ? "YEAR"
                            : "MO"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl border-4 border-[#0f4656]/5 p-6 bg-white focus-within:ring-4 focus-within:ring-[#ef864c]/10 transition-all shadow-2xl">
                      <PaymentForm
                        clientSecret={paymentClientSecret}
                        amount={selectedPlanForPayment.price}
                        planName={selectedPlanForPayment.name}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  </div>
                </StripeProvider>
              )}

              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[9px] lg:text-[10px] font-black text-[#0f4656]/20 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="w-4 h-4 text-[#ef864c]"
                    strokeWidth={3}
                  />
                  Tier 1 PCI
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ef864c]" strokeWidth={3} />
                  Deep Encryption
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard
                    className="w-4 h-4 text-[#ef864c]"
                    strokeWidth={3}
                  />
                  Safe Channel
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
