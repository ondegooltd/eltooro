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
import { SITE_PHONE_DISPLAY, SITE_PHONE_E164 } from "@/lib/site";

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
                  href={`https://wa.me/${SITE_PHONE_E164.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-iherb-green hover:underline block"
                >
                  {SITE_PHONE_DISPLAY}
                </a>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-muted-foreground mb-2">Send us a message</p>
                <a
                  href="mailto:info@toroglo.com"
                  className="font-medium text-iherb-green hover:underline block break-all"
                >
                  info@toroglo.com
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
                    href="https://www.instagram.com/toroglo_gh/"
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
                    href="https://www.tiktok.com/@toroglo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-iherb-green/10 rounded-full hover:bg-iherb-green/20 transition-colors"
                    aria-label="TikTok"
                  >
                    {/* TikTok logo icon */}
                    <svg
                      className="h-5 w-5 text-iherb-green"
                      viewBox="0 0 24 24"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <title>TikTok icon</title>
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
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
                      <p className="text-muted-foreground">Toroglo Ghana</p>
                      <p className="text-muted-foreground">
                        ALX Tech Hub, 4th Floor, One Airport Square,
                      </p>
                      <p className="text-muted-foreground">Accra, Ghana</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Response Time</h3>
                      <p className="text-muted-foreground">
                        We typically respond within 30 minutes - 1 hour
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
                        Delivery Information
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
