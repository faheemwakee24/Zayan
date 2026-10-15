"use client";

import BuyerLayout from "@/components/BuyerLayout";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  HeadphonesIcon,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "support@Zayan.com",
      action: "mailto:support@Zayan.com",
      color: "primary",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon to Fri from 9am to 6pm",
      contact: "+92 300 1234567",
      action: "tel:+923001234567",
      color: "secondary",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come say hello at our office",
      contact: "Karachi, Pakistan",
      action: "#",
      color: "accent",
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "We're here to help",
      contact: "Mon - Sat: 9:00 AM - 6:00 PM",
      action: "#",
      color: "primary",
    },
  ];

  const faqs = [
    {
      question: "How do I create a seller account?",
      answer:
        "Click on 'Sign Up' in the top right corner, select 'Join as Seller', and follow the simple registration process. You'll need to provide basic information and verify your email.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, bank transfers, and popular digital wallets. All transactions are secure and encrypted.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is confirmed, you'll receive a tracking number via email. You can also check your order status in your dashboard under 'My Orders'.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy for most products. Items must be in original condition with tags attached. Please contact the seller directly for returns.",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "You can message sellers directly through our messaging system. Click on any product, then use the 'Message Seller' button to start a conversation.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely! We use industry-standard encryption and security measures to protect your data. We never share your information with third parties without your consent.",
    },
  ];

  return (
    <BuyerLayout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-white via-primary-50 to-background">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 via-primary-300/20 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tl from-secondary-400/25 via-secondary-300/15 to-transparent rounded-full blur-3xl animate-float-slow"></div>
          </div>

          <div className="  mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                Get in Touch
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 leading-tight">
              We&apos;d Love to{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Hear from You
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Have a question, suggestion, or need help? Our team is here to
              assist you. Reach out to us through any of the channels below, and
              we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 bg-white">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.action}
                  className="bg-gradient-to-br from-white to-muted rounded-2xl p-6 border border-border hover:shadow-xl transition-all duration-300 group text-center"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                      method.color === "primary"
                        ? "from-primary-100 to-primary-200"
                        : method.color === "secondary"
                        ? "from-secondary-100 to-secondary-200"
                        : "from-accent-100 to-accent-200"
                    } flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <method.icon
                      className={`w-7 h-7 ${
                        method.color === "primary"
                          ? "text-primary"
                          : method.color === "secondary"
                          ? "text-secondary"
                          : "text-accent"
                      }`}
                    />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {method.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {method.description}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      method.color === "primary"
                        ? "text-primary"
                        : method.color === "secondary"
                        ? "text-secondary"
                        : "text-accent"
                    }`}
                  >
                    {method.contact}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20 bg-muted">
          <div className="  mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-foreground">
                      Send us a Message
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form and we&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2">
                    Send Message
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>

              {/* Additional Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-100 to-accent-100 flex items-center justify-center">
                      <HeadphonesIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-foreground">
                        Need Immediate Help?
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Our support team is ready to assist
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-foreground mb-1">
                          Phone Support
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Available Monday - Saturday, 9 AM - 6 PM
                        </p>
                        <a
                          href="tel:+923001234567"
                          className="text-primary font-medium hover:underline"
                        >
                          +92 300 1234567
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-foreground mb-1">
                          Email Support
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          We respond within 24 hours
                        </p>
                        <a
                          href="mailto:support@Zayan.com"
                          className="text-secondary font-medium hover:underline"
                        >
                          support@Zayan.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <HelpCircle className="w-6 h-6 text-primary" />
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      Common Questions
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check out our FAQ section below for quick answers to common
                    questions.
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      document
                        .getElementById("faq-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View FAQs
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq-section" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  Frequently Asked Questions
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Got Questions? We Have Answers
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find quick answers to the most common questions about our
                platform
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-muted rounded-xl p-6 border border-border hover:shadow-lg transition-all"
                >
                  <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Still have questions? Don&apos;t hesitate to reach out!
              </p>
              <Button
                className="gap-2"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Contact Support
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BuyerLayout>
  );
}
