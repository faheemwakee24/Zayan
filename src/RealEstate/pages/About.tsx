"use client";

import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import {
  Building2,
  Users,
  Target,
  Award,
  Heart,
  TrendingUp,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function About() {
  const [animatedStats, setAnimatedStats] = useState({ properties: 0, users: 0, agents: 0 });
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const targets = { properties: 50000, users: 100000, agents: 5000 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        properties: Math.floor(targets.properties * easeOutQuart),
        users: Math.floor(targets.users * easeOutQuart),
        agents: Math.floor(targets.agents * easeOutQuart),
      });

      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We prioritize honesty and clarity in every transaction, ensuring all parties feel confident and informed.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our mission. We go above and beyond to exceed expectations.",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology to enhance your experience.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making real estate accessible to everyone, regardless of background or experience.",
    },
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "RealeState was born with a vision to revolutionize real estate" },
    { year: "2021", title: "10K Users", description: "Reached our first major milestone with 10,000 active users" },
    { year: "2022", title: "50K Properties", description: "Listed over 50,000 properties across the United States" },
    { year: "2023", title: "100K Users", description: "Celebrated 100,000 satisfied users and growing" },
    { year: "2024", title: "$2B+ Sold", description: "Facilitated over $2 billion in property transactions" },
  ];

  const team = [
    {
      name: "Sarah Mitchell",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
    {
      name: "David Thompson",
      role: "Head of Marketing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    },
  ];

  return (
    <LandingLayout>
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-[85vh] overflow-hidden pt-20" style={{ backgroundColor: '#0f4656' }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/3 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block mb-4 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20" style={{ backgroundColor: '#ef864c20' }}>
                <Sparkles className="w-4 h-4 inline mr-2" style={{ color: '#ef864c' }} />
                <span style={{ color: '#ef864c' }}>About RealeState</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Building the Future of
                  <span className="block mt-2">Real Estate</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                  We&apos;re on a mission to make real estate accessible, transparent, and seamless for everyone.
                  From first-time homebuyers to seasoned investors, we&apos;ve got you covered.
                </p>
              </div>

              {/* Key Points */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(239, 134, 76, 0.1)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ef864c' }}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Trusted Platform</p>
                    <p className="text-white/70 text-xs">100K+ Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(239, 134, 76, 0.1)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ef864c' }}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Verified Listings</p>
                    <p className="text-white/70 text-xs">50K+ Properties</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/real-estate/buyer/properties">
                  <Button 
                    size="lg" 
                    className="text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    style={{ backgroundColor: '#ef864c' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                  >
                    Explore Properties
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/real-estate/contact">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white bg-transparent text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=800&fit=crop"
                alt="About RealeState"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {/* Floating Stats Badge */}
              <div className="absolute top-6 right-6 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl" style={{ backgroundColor: 'rgba(15, 70, 86, 0.9)' }}>
                <p className="text-3xl font-bold text-white mb-1">{animatedStats.properties.toLocaleString()}+</p>
                <p className="text-white/80 text-sm">Active Properties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:bg-primary/5 transition-all duration-300">
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#0f4656' }}>
                {animatedStats.properties.toLocaleString()}+
              </p>
              <p className="text-lg text-foreground/60">Active Properties</p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:bg-primary/5 transition-all duration-300">
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#ef864c' }}>
                {animatedStats.users.toLocaleString()}+
              </p>
              <p className="text-lg text-foreground/60">Happy Users</p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:bg-primary/5 transition-all duration-300">
              <p className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#0f4656' }}>
                {animatedStats.agents.toLocaleString()}+
              </p>
              <p className="text-lg text-foreground/60">Trusted Agents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#0f4656' }}>
                Empowering Real Estate Dreams
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                At RealeState, we believe that finding your perfect property should be exciting, not stressful.
                Our platform combines cutting-edge technology with personalized service to create an unparalleled
                real estate experience.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed mb-8">
                Whether you&apos;re buying your first home, selling an investment property, or exploring new opportunities,
                we provide the tools, resources, and support you need to make informed decisions.
              </p>
              <Link href="/real-estate/buyer/properties">
                <Button 
                  size="lg" 
                  className="text-white hover:opacity-90 group"
                  style={{ backgroundColor: '#ef864c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                >
                  Explore Properties
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
                alt="Our Mission"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Values</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#0f4656' }}>
              What We Stand For
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              These core values guide everything we do and shape how we serve our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 group"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" style={{ backgroundColor: '#ef864c' }}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 transition-colors" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>
                    {value.title}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      {/* <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Journey</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#0f4656' }}>
              Milestones & Achievements
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              A timeline of our growth and the impact we&apos;ve made in the real estate industry.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#ef864c' }}>
                  {milestone.year}
                </div>
                <Card className="flex-1 p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>{milestone.title}</h3>
                  <p className="text-foreground/60">{milestone.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Meet the Team</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#0f4656' }}>
              The People Behind RealeState
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              A passionate team dedicated to transforming the real estate experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 group">
                <div className="relative h-64 overflow-hidden bg-foreground/5">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1 transition-colors" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>{member.name}</h3>
                  <p className="text-foreground/60">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-white relative overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Ready to experience the future of real estate? Join thousands of satisfied users today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=buyer">
              <Button 
                size="lg" 
                className="hover:bg-white/90 w-full sm:w-auto"
                style={{ backgroundColor: '#ef864c', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/real-estate/contact">
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/20 w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

