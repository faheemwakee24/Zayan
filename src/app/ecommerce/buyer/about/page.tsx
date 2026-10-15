"use client";

import BuyerLayout from "@/components/BuyerLayout";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  Award,
  Heart,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const stats = [
    { icon: Users, value: "50K+", label: "Active Users" },
    { icon: TrendingUp, value: "10K+", label: "Active Sellers" },
    { icon: Award, value: "100K+", label: "Products Listed" },
    { icon: Heart, value: "98%", label: "Satisfaction Rate" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "We prioritize your security with advanced encryption and secure payment processing. Your data and transactions are always protected.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Connect with buyers and sellers across Pakistan. Our platform brings together a vibrant community of entrepreneurs and shoppers.",
    },
    {
      icon: Target,
      title: "Customer First",
      description:
        "Your satisfaction is our mission. We continuously improve our platform based on your feedback and needs.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description:
        "We maintain high standards for all products and sellers on our platform, ensuring you get the best experience every time.",
    },
  ];

  const team = [
    {
      name: "Ahmed Khan",
      role: "CEO & Founder",
      description: "Visionary leader with 10+ years in e-commerce",
      avatar: "👨‍💼",
    },
    {
      name: "Fatima Ali",
      role: "CTO",
      description: "Tech enthusiast building scalable solutions",
      avatar: "👩‍💻",
    },
    {
      name: "Hassan Raza",
      role: "Head of Operations",
      description: "Ensuring smooth operations and customer satisfaction",
      avatar: "👨‍💼",
    },
    {
      name: "Sara Ahmed",
      role: "Head of Marketing",
      description: "Connecting brands with their perfect audience",
      avatar: "👩‍💼",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Platform Launch",
      description: "Started with a vision to revolutionize e-commerce in Pakistan",
    },
    {
      year: "2021",
      title: "10K Users",
      description: "Reached our first major milestone with 10,000 active users",
    },
    {
      year: "2022",
      title: "Multi-Vendor Support",
      description: "Launched advanced seller tools and analytics dashboard",
    },
    {
      year: "2023",
      title: "50K Users",
      description: "Grew to 50,000 active users and 10,000 sellers",
    },
    {
      year: "2024",
      title: "Market Leader",
      description: "Became Pakistan's leading multi-vendor marketplace",
    },
  ];

  return (
    <BuyerLayout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-white via-[#0f4656]/5 to-background">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 via-primary-300/20 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tl from-secondary-400/25 via-secondary-300/15 to-transparent rounded-full blur-3xl animate-float-slow"></div>
          </div>

          <div className="  mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block mb-6">
              <span
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: "#0f4656", color: "white" }}
              >
                About Zayan
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 leading-tight">
              Building Pakistan&apos;s{" "}
              <span className="bg-gradient-to-r from-[#0f4656] via-[#0f4656] to-[#ef864c] bg-clip-text text-transparent">
                Largest Marketplace
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              We&apos;re on a mission to empower entrepreneurs and connect buyers with
              quality products. Since 2020, we&apos;ve been building a platform that
              makes buying and selling seamless, secure, and rewarding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: "#ef864c" }}
                onClick={() => router.push("/signup")}
              >
                Join Our Community
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-2 border-[#0f4656] text-[#0f4656] hover:bg-[#0f4656] hover:text-white transition-all duration-300"
                onClick={() => router.push("/buyer/products")}
              >
                Explore Products
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-b from-white to-background/40">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f4656]/10 via-[#0f4656]/5 to-[#ef864c]/20 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                    <stat.icon className="w-8 h-8" style={{ color: "#0f4656" }} />
                  </div>
                  <div className="text-3xl md:text-4xl font-heading font-bold mb-2" style={{ color: "#0f4656" }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-gradient-to-b from-background via-white to-background">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block mb-4">
                  <span
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: "#0f4656", color: "white" }}
                  >
                    Our Story
                  </span>
                </div>
                <h2
                  className="text-3xl md:text-4xl font-heading font-bold mb-6"
                  style={{ color: "#0f4656" }}
                >
                  From Vision to Reality
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Founded in 2020, Zayan started with a simple idea: make
                  e-commerce accessible to everyone in Pakistan. We saw the
                  potential for local businesses to thrive online and buyers to
                  discover amazing products.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Today, we&apos;re proud to be Pakistan&apos;s fastest-growing
                  multi-vendor marketplace, connecting thousands of sellers with
                  millions of buyers. Our platform combines cutting-edge technology
                  with a deep understanding of local market needs.
                </p>
                <div className="space-y-3">
                  {[
                    "Secure payment processing",
                    "Real-time messaging system",
                    "Advanced analytics dashboard",
                    "24/7 customer support",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#ef864c" }} />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="relative h-96 rounded-2xl bg-gradient-to-br from-[#0f4656] via-[#0f4656] to-[#ef864c] overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🚀</div>
                      <div className="text-2xl font-heading font-bold">
                        Growing Together
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-full blur-2xl opacity-30"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20 bg-white">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "#0f4656", color: "white" }}
                >
                  Our Values
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-heading font-bold mb-4"
                style={{ color: "#0f4656" }}
              >
                What Drives Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core values guide everything we do and shape how we serve
                our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-background rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0f4656]/10 via-[#0f4656]/5 to-[#ef864c]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <value.icon className="w-7 h-7" style={{ color: "#0f4656" }} />
                  </div>
                  <h3
                    className="font-heading font-bold text-xl mb-3 group-hover:opacity-90 transition-colors"
                    style={{ color: "#0f4656" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        {/* <section className="py-20 bg-gradient-to-b from-background via-white to-background">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "#0f4656", color: "white" }}
                >
                  Our Journey
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-heading font-bold mb-4"
                style={{ color: "#0f4656" }}
              >
                Milestones & Achievements
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Key moments that shaped our growth and success
              </p>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#0f4656] via-[#0f4656] to-[#ef864c]"></div>

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="w-full md:w-5/12">
                      <div className="bg-white rounded-2xl p-6 border border-border shadow-lg hover:shadow-xl transition-shadow">
                        <div
                          className="text-2xl font-heading font-bold mb-2"
                          style={{ color: "#0f4656" }}
                        >
                          {milestone.year}
                        </div>
                        <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:block w-2/12 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center text-white font-heading font-bold text-lg shadow-lg">
                            {index + 1}
                      </div>
                    </div>
                    <div className="w-full md:w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "#0f4656", color: "white" }}
                >
                  Our Team
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-heading font-bold mb-4"
                style={{ color: "#0f4656" }}
              >
                Meet the People Behind Zayan
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Passionate individuals working together to build the future of
                e-commerce
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-background rounded-2xl p-6 border border-border text-center hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0f4656] to-[#ef864c] flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    {member.avatar}
                  </div>
                  <h3
                    className="font-heading font-bold text-lg mb-1 group-hover:opacity-90 transition-colors"
                    style={{ color: "#0f4656" }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium mb-2" style={{ color: "#ef864c" }}>
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20 text-white relative overflow-hidden"
          style={{ backgroundColor: "#0f4656" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-float-slow" />
          </div>

          <div className="  mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Join Us on This Journey
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Whether you&apos;re a buyer looking for great products or a seller
              ready to grow your business, we&apos;re here to support you every
              step of the way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 px-8 py-6 text-lg font-semibold bg-white hover:bg-white/95 text-[#0f4656] shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300"
                onClick={() => router.push("/signup")}
              >
                Start Selling
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-2 border-white text-white bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                onClick={() => router.push("/buyer/products")}
              >
                Start Shopping
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BuyerLayout>
  );
}
