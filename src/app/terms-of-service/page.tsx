import { fetchPolicy } from "@/lib/policies";
import { FileText, Shield, Cookie } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TermsOfServicePage() {
  const result = await fetchPolicy("terms");

  const lastUpdated =
    result.success && result.policy?.lastUpdated
      ? new Date(result.policy.lastUpdated).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const content = result.success ? result.policy?.content || "" : "";

  return (
    <div className="w-full min-h-screen bg-background font-heading">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[#0f4656]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
              Legal Document
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Terms of Service
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
            Please read these terms carefully before using our platform. By using Zayan, you agree to be bound by these terms.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href="/privacy-policy"
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold text-sm md:text-base hover:bg-white/20 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="px-6 py-3 bg-white text-[#0f4656] rounded-xl font-semibold text-sm md:text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </Link>
            <Link
              href="/cookie-policy"
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold text-sm md:text-base hover:bg-white/20 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Cookie className="w-4 h-4" />
              Cookie Policy
            </Link>
          </div>

          {lastUpdated && (
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-sm">Last updated on</span>
              <span className="font-semibold text-white">{lastUpdated}</span>
            </div>
          )}

          {!result.success && (
            <div className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg">
              <p className="text-red-100 text-sm">
                {result.message || "We're updating these terms. Please check back soon."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white via-background/50 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {content ? (
            <article className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:text-[#0f4656] dark:prose-headings:text-[#0f4656] prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-li:my-2 prose-strong:text-[#0f4656] dark:prose-strong:text-[#0f4656] prose-a:text-[#ef864c] hover:prose-a:text-[#0f4656] prose-a:no-underline hover:prose-a:underline">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </article>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our terms of service content is not available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


