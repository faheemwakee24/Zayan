"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/RealEstate/components/ui/button";

export default function NotFound() {
  return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          <h1 className="text-4xl font-bold text-primary mb-4">Page Not Found</h1>
          <p className="text-lg text-foreground/60 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <Link href="/real-estate">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90">
              Return to Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Link href="/real-estate/buyer/properties" className="p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
              <p className="font-semibold text-primary mb-1">Browse Properties</p>
              <p className="text-foreground/60">Find your perfect home</p>
            </Link>
            <Link href="/real-estate/contact" className="p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
              <p className="font-semibold text-primary mb-1">Contact Support</p>
              <p className="text-foreground/60">Get help from our team</p>
            </Link>
          </div>
        </div>
      </div>
  );
}
