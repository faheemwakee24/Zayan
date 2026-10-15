"use client";

import { Suspense } from "react";
import SellerSettings from "@/RealEstate/pages/seller/Settings";

export const dynamic = 'force-dynamic';

export default function SellerSettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-6"><p className="text-sm text-foreground/60">Loading settings...</p></div>}>
      <SellerSettings />
    </Suspense>
  );
}

