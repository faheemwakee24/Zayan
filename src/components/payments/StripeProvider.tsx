"use client";

import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode } from "react";

// Initialize Stripe with publishable key from environment
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
  options?: StripeElementsOptions;
}

export function StripeProvider({ 
  children, 
  clientSecret,
  options 
}: StripeProviderProps) {
  // If no publishable key, return children without Stripe Elements
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
    return <>{children}</>;
  }

  // If clientSecret is provided, wrap with Elements
  if (clientSecret) {
    const elementsOptions: StripeElementsOptions = {
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#ef864c",
          colorBackground: "#ffffff",
          colorText: "#1a1a1a",
          colorDanger: "#df1b41",
          fontFamily: "Poppins, ui-sans-serif, sans-serif",
          spacingUnit: "4px",
          borderRadius: "8px",
        },
      },
      ...options,
    } as StripeElementsOptions;

    return (
      <Elements options={elementsOptions} stripe={stripePromise}>
        {children}
      </Elements>
    );
  }

  // If no clientSecret, just return children (for initial render)
  return <>{children}</>;
}

