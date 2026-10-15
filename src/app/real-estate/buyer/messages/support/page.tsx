"use client";

import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import SupportChat from "@/components/chat/SupportChat";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SupportChatPage() {
  return (
    <LandingLayout>
      <div className="w-full min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-[#0f4656]">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/real-estate/buyer/messages"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Messages</span>
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                Support
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              Support Chat
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
              Our support team is here to help you. Chat with us anytime and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Chat Section */}
        <section className="py-16 bg-gradient-to-b from-white via-background/50 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SupportChat className="h-[calc(100vh-20rem)] min-h-[600px]" />
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}

