"use client";

import { useSession } from "next-auth/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SMSEventTypes = [
  "order_confirmation",
  "order_confirmed",
  "order_processing",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "order_refunded",
  "payment_confirmation",
  "payment_failed",
  "payment_pending",
  "refund_processed",
  "account_welcome",
  "password_reset",
  "email_verified",
  "phone_verified",
  "otp",
  "abandoned_cart_reminder",
  "back_in_stock",
  "support_ticket_created",
  "support_ticket_status_update",
  "support_ticket_response",
];

export default function AdminSMSTemplateCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    eventType: "",
    name: "",
    message: "",
    status: "active",
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/sms-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create template");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "SMS template created successfully",
        });
        router.push("/admin/sms-templates");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link href="/admin/sms-templates">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Templates
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Create SMS Template</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="eventType">Event Type *</Label>
                        <Select
                          value={formData.eventType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, eventType: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {SMSEventTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          rows={6}
                          placeholder="Use {{variable}} for dynamic content. Example: Hi {{name}}, your order {{orderNumber}} is confirmed!"
                          required
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Maximum 160 characters. Use variables like{" "}
                          {`{{name}}, {{orderNumber}}, {{amount}}`} etc.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Set as Default</Label>
                          <p className="text-sm text-muted-foreground">
                            Make this the default template for this event type
                          </p>
                        </div>
                        <Switch
                          checked={formData.isDefault}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isDefault: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Link href="/admin/sms-templates">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Template"}
                </Button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
