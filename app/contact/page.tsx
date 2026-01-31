"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SubjectType =
  | "order"
  | "shipping"
  | "return"
  | "product"
  | "account"
  | "other";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    orderNumber: "",
    subject: "" as SubjectType | "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      toast({
        title: "First name required",
        description: "Please enter your first name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Last name required",
        description: "Please enter your last name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject) {
      toast({
        title: "Subject required",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast({
        title: "Message too short",
        description: "Please enter a message with at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          orderNumber: formData.orderNumber.trim() || undefined,
          subject: formData.subject,
          message: formData.message.trim(),
          priority: "medium",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          orderNumber: "",
          subject: "" as SubjectType | "",
          message: "",
        });

        toast({
          title: "Message sent successfully!",
          description: data.data?.ticketNumber
            ? `Your ticket number is ${data.data.ticketNumber}. We'll get back to you soon.`
            : "We'll get back to you soon.",
        });

        // Reset success state after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We&apos;re here to help. Reach out to our customer support team.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone / WhatsApp</h3>
                <p className="text-muted-foreground mb-2">Call or message us</p>
                <a
                  href="https://wa.me/233537182367"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-iherb-green hover:underline block"
                >
                  +233-537-182-367
                </a>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-muted-foreground mb-2">Send us a message</p>
                <a
                  href="mailto:eltooroltd@gmail.com"
                  className="font-medium text-iherb-green hover:underline block break-all"
                >
                  eltooroltd@gmail.com
                </a>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Social Media</h3>
                <p className="text-muted-foreground mb-3">
                  Follow us for updates
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="https://www.instagram.com/eltooro_gh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-iherb-green/10 rounded-full hover:bg-iherb-green/20 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg
                      className="h-5 w-5 text-iherb-green"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@eltooro.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-iherb-green/10 rounded-full hover:bg-iherb-green/20 transition-colors"
                    aria-label="TikTok"
                  >
                    {/* TikTok logo icon */}
                    <svg
                      className="h-5 w-5 text-iherb-green"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.52-.34-1.04-.7-1.54-1.09-2.69-2.23-4.39-5.31-4.42-8.75h4.02v-.02zm-7.13 12.08c.32.52.68 1.01 1.08 1.47.4.46.84.88 1.32 1.27.48.39.99.73 1.53 1.03.54.3 1.11.55 1.7.75.59.2 1.2.35 1.82.45.62.1 1.25.15 1.88.15v4.02c-1.63-.02-3.25-.31-4.81-.83-1.56-.52-3.02-1.27-4.35-2.23-1.33-.96-2.53-2.12-3.57-3.45-1.04-1.33-1.9-2.78-2.57-4.34-.67-1.56-1.14-3.2-1.4-4.88-.26-1.68-.31-3.4-.15-5.11h4.02c-.02.78.07 1.55.26 2.3.19.75.47 1.47.83 2.15.36.68.8 1.31 1.32 1.88.52.58 1.11 1.09 1.76 1.53.65.44 1.36.8 2.11 1.08.75.28 1.54.47 2.34.57.8.1 1.61.12 2.42.08z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        className="mt-1"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        disabled={isSubmitting || isSuccess}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        className="mt-1"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        disabled={isSubmitting || isSuccess}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isSubmitting || isSuccess}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderNumber">Order Number (Optional)</Label>
                    <Input
                      id="orderNumber"
                      placeholder="ORD-12345678"
                      className="mt-1"
                      value={formData.orderNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orderNumber: e.target.value,
                        })
                      }
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          subject: value as SubjectType,
                        })
                      }
                      disabled={isSubmitting || isSuccess}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order Inquiry</SelectItem>
                        <SelectItem value="shipping">
                          Shipping Question
                        </SelectItem>
                        <SelectItem value="return">
                          Returns & Refunds
                        </SelectItem>
                        <SelectItem value="product">
                          Product Information
                        </SelectItem>
                        <SelectItem value="account">Account Help</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="How can we help you?"
                      className="mt-1"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      disabled={isSubmitting || isSuccess}
                      required
                      minLength={10}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-iherb-green hover:bg-iherb-green-dark"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Message Sent!
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Other Information</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM PST
                      </p>
                      <p className="text-muted-foreground">
                        Saturday - Sunday: 10:00 AM - 4:00 PM PST
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Headquarters</h3>
                      <p className="text-muted-foreground">Eltooro, LLC</p>
                      <p className="text-muted-foreground">
                        17400 Laguna Canyon Road
                      </p>
                      <p className="text-muted-foreground">
                        Irvine, CA 92618, USA
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Response Time</h3>
                      <p className="text-muted-foreground">
                        We typically respond within 24 hours
                      </p>
                      <p className="text-muted-foreground">
                        during business days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/help"
                        className="text-iherb-green hover:underline"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="/track-order"
                        className="text-iherb-green hover:underline"
                      >
                        Track Your Order
                      </a>
                    </li>
                    <li>
                      <a
                        href="/returns"
                        className="text-iherb-green hover:underline"
                      >
                        Return Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="/shipping"
                        className="text-iherb-green hover:underline"
                      >
                        Shipping Information
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
