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
                <h3 className="font-semibold text-lg mb-2">Phone</h3>
                <p className="text-muted-foreground mb-2">Call us toll-free</p>
                <p className="font-medium">1-800-Eltooro (44372)</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-muted-foreground mb-2">Send us a message</p>
                <p className="font-medium">support@eltooro.com</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-2">
                  Chat with us online
                </p>
                <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                  Start Chat
                </Button>
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
