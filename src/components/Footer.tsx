import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-muted border-t border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            {/* logo */}
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img
                src="/Images/footerlogo.png"
                alt="Zayan Logo"
                className="w-[150px] h-[150px]"
              />

              <span className="font-heading font-bold text-lg text-primary">
                Zayan
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting buyers and sellers in one beautiful marketplace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ecommerce"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/ecommerce/buyer/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/ecommerce/buyer/blogs"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/ecommerce/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-foreground">
              For Buyers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/buyer/products"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  href="/buyer/sellers"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Find Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-foreground">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:hello@zayan.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  hello@zayan.com
                </a>
              </li>
              <li className="flex gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+923001234567"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +92 (300) 1234567
                </a>
              </li>
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Karachi, Pakistan
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>&copy; 2024 Zayan. All rights reserved.</p>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookie-policy"
              className="hover:text-primary transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
