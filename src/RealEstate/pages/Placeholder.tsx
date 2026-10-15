import { Button } from "@/RealEstate/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

interface PlaceholderProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Placeholder({ 
  title = "Page Coming Soon",
  description = "This page is currently being developed. Let us know if you'd like this page to be ready sooner!",
  ctaText = "Go Back Home",
  ctaLink = "/"
}: PlaceholderProps) {
  return (
    // <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">{title}</h1>
          <p className="text-lg text-foreground/60 mb-8">{description}</p>
          
          <Link href={ctaLink || "/"}>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90">
              {ctaText}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>

          <div className="mt-16 pt-12 border-t border-border">
            <p className="text-sm text-foreground/50 mb-6">
              Want us to prioritize this page? Let us know!
            </p>
            <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
              Request Feature
            </Button>
          </div>
        </div>
      </div>
    // </Layout>
  );
}
