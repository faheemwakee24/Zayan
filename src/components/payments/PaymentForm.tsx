"use client";

import { useState, FormEvent } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  planName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({
  clientSecret,
  amount,
  planName,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found. Please refresh the page.");
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      console.log(paymentIntent, "paymentIntent checking");
      if (confirmError) {
        // Payment failed
        setError(confirmError.message || "Payment failed. Please try again.");
        onError?.(confirmError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Payment succeeded - but subscription will be activated via webhook
        setSuccess(true);
        onSuccess?.();

        // Show success message
        setTimeout(() => {
          // Keep showing success state - user should wait for webhook
        }, 2000);
      } else {
        setError("Payment status is unexpected. Please contact support.");
        onError?.("Payment status is unexpected");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
      onError?.(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "15px",
        color: "#1a1a1a",
        fontFamily: '"Poppins", ui-sans-serif, sans-serif',
        "::placeholder": {
          color: "#a0a0a0",
        },
      },
      invalid: {
        color: "#df1b41",
        iconColor: "#df1b41",
      },
    },
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="font-semibold mb-2">Payment successful!</div>
            <div className="text-sm">
              Your payment has been processed. We're activating your
              subscription now. This may take a few moments. You'll receive a
              confirmation email once it's complete.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-6 px-1 sm:px-0"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-2 sm:p-4 border rounded-xl bg-background shadow-sm">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Plan:</span>
          <span className="font-semibold">{planName}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold">${amount.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secure and encrypted. We use Stripe to process all
        payments.
      </p>
    </form>
  );
}
