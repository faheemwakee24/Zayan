"use client";

import { LandingLayout } from "@/RealEstate/components/LandingLayout";
import { Card } from "@/RealEstate/components/ui/card";
import { Button } from "@/RealEstate/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Clock,
  HelpCircle,
  Building2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "hello@realestate.com",
      action: "mailto:hello@realestate.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri from 8am to 6pm",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come say hello at our office",
      contact: "123 Real Estate Ave, New York, NY 10001",
      action: "https://maps.google.com",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 24/7",
      action: "#",
    },
  ];

  const faqs = [
    {
      question: "How do I list my property?",
      answer: "You can list your property by creating an account and navigating to the seller dashboard. Our platform guides you through the entire process step by step.",
    },
    {
      question: "What are your commission rates?",
      answer: "Our commission rates vary depending on the property type and location. Please contact us for detailed pricing information tailored to your needs.",
    },
    {
      question: "How long does it take to sell a property?",
      answer: "The average time to sell a property on our platform is 45-60 days, though this can vary based on market conditions, pricing, and property features.",
    },
    {
      question: "Do you offer financing options?",
      answer: "We partner with trusted lenders to help our clients find the best financing options. Contact our team to discuss your financing needs.",
    },
  ];

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] overflow-hidden bg-gradient-to-br from-background via-white to-secondary/5 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm border" style={{ backgroundColor: '#ef864c20', color: '#0f4656', borderColor: '#0f465620' }}>
              <MessageSquare className="w-4 h-4 inline mr-2" style={{ color: '#ef864c' }} />
              Get in Touch
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#0f4656' }}>
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto">
              Have questions? We&apos;re here to help! Reach out to our team and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <a
                  key={index}
                  href={method.action}
                  className="block"
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 group cursor-pointer h-full">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" style={{ backgroundColor: '#ef864c' }}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 transition-colors" style={{ color: '#0f4656' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef864c'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f4656'}>
                      {method.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-2">{method.description}</p>
                    <p className="text-sm font-semibold" style={{ color: '#0f4656' }}>{method.contact}</p>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0f4656' }}>Send Us a Message</h2>
                <p className="text-lg text-foreground/70">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>
              </div>

              <Card className="p-8 border-2 border-primary/10">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#ef864c' }}>
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#0f4656' }}>Message Sent!</h3>
                    <p className="text-foreground/60">We&apos;ll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors bg-white"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors bg-white"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors bg-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors bg-white"
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="listing">Property Listing</option>
                          <option value="buying">Buying a Property</option>
                          <option value="support">Support Request</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors bg-white resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-white hover:opacity-90 group"
                      style={{ backgroundColor: '#ef864c' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
                    >
                      Send Message
                      <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Contact Info & Hours */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#0f4656' }}>Visit Our Office</h2>
                <Card className="p-8 border-2 border-primary/10">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ef864c' }}>
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1" style={{ color: '#0f4656' }}>Address</h3>
                        <p className="text-foreground/70">
                          123 Real Estate Avenue<br />
                          New York, NY 10001<br />
                          United States
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ef864c' }}>
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1" style={{ color: '#0f4656' }}>Business Hours</h3>
                        <div className="text-foreground/70 space-y-1">
                          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                          <p>Saturday: 9:00 AM - 4:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#0f4656' }}>Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="p-6 border-2 border-primary/10">
                      <div className="flex items-start gap-4">
                        <HelpCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#0f4656' }} />
                        <div>
                          <h3 className="font-bold mb-2" style={{ color: '#0f4656' }}>{faq.question}</h3>
                          <p className="text-foreground/70">{faq.answer}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-white relative overflow-hidden" style={{ backgroundColor: '#0f4656' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users finding their perfect properties on RealeState today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="hover:bg-white/90"
              style={{ backgroundColor: '#ef864c', color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9723f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef864c'}
            >
              Browse Properties
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 bg-transparent">
              List Your Property
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
