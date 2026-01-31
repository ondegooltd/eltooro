"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Mail,
  Phone,
  Loader2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const footerLinks = {
  company: [
    { name: "About Eltooro", href: "/about" },
    // { name: "Careers", href: "/careers" },
    // { name: "Press", href: "/press" },
    // { name: "Affiliates", href: "/affiliates" },
    // { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    // { name: "Track Order", href: "/track-order" },
    { name: "Shipping & Delivery", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "Contact Us", href: "/contact" },
  ],
  // categories: [
  //   { name: "Supplements", href: "/supplements" },
  //   { name: "Beauty", href: "/beauty" },
  //   { name: "Sports", href: "/sports" },
  //   { name: "Grocery", href: "/grocery" },
  //   { name: "Home", href: "/home" },
  // ],
  account: [
    { name: "My Account", href: "/account" },
    { name: "Orders", href: "/orders" },
    { name: "Wishlist", href: "/wishlist" },
    // { name: "Rewards", href: "/rewards" },
    // { name: "Auto-Delivery", href: "/auto-delivery" },
  ],
};

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          source: "footer",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setEmail("");
        toast({
          title: "Success!",
          description:
            data.data?.message || "You've been subscribed to our newsletter",
        });

        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-foreground text-white">
      {/* Newsletter Section */}
      <div className="bg-iherb-green">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">
                Subscribe to our newsletter
              </h3>
              <p className="text-white/80">
                Get exclusive offers, health tips, and more!
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="bg-white text-foreground border-0 flex-1 text-sm sm:text-base h-10 sm:h-11 min-h-[2.5rem]"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="bg-white text-iherb-green hover:bg-white/90 font-semibold shrink-0 h-10 sm:h-11 min-h-[2.5rem] text-sm sm:text-base px-4 sm:px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          {/* <div>
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Account */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
              My Account
            </h4>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a
                  href="mailto:eltooroltd@gmail.com"
                  className="text-white/70 hover:text-white transition-colors text-sm break-all"
                >
                  eltooroltd@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <a
                  href="https://wa.me/233537182367"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  +233-537-182-367
                </a>
              </li>
            </ul>
            <div>
              <h5 className="font-semibold text-sm mb-3">Follow Us</h5>
              <div className="flex gap-3">
                <Link
                  href="https://www.instagram.com/eltooro_gh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.tiktok.com/@eltooro.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="TikTok"
                >
                  {/* TikTok logo icon */}
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.52-.34-1.04-.7-1.54-1.09-2.69-2.23-4.39-5.31-4.42-8.75h4.02v-.02zm-7.13 12.08c.32.52.68 1.01 1.08 1.47.4.46.84.88 1.32 1.27.48.39.99.73 1.53 1.03.54.3 1.11.55 1.7.75.59.2 1.2.35 1.82.45.62.1 1.25.15 1.88.15v4.02c-1.63-.02-3.25-.31-4.81-.83-1.56-.52-3.02-1.27-4.35-2.23-1.33-.96-2.53-2.12-3.57-3.45-1.04-1.33-1.9-2.78-2.57-4.34-.67-1.56-1.14-3.2-1.4-4.88-.26-1.68-.31-3.4-.15-5.11h4.02c-.02.78.07 1.55.26 2.3.19.75.47 1.47.83 2.15.36.68.8 1.31 1.32 1.88.52.58 1.11 1.09 1.76 1.53.65.44 1.36.8 2.11 1.08.75.28 1.54.47 2.34.57.8.1 1.61.12 2.42.08z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/eltoroo.png"
                alt="Eltooro"
                width={156}
                height={52}
                className="h-[42px] w-auto"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
              <span>© {new Date().getFullYear()} Eltooro. All Rights Reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
