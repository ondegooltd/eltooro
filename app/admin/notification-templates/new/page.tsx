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
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const EVENT_TYPES = [
  "order_confirmation",
  "payment_confirmation",
  "order_shipped",
  "order_delivered",
  "otp",
  "password_reset",
  "support_ticket_created",
  "support_ticket_status_update",
  "support_ticket_response",
  "admin_ticket_notification",
];

export default function AdminNotificationTemplateCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    subject?: string;
    body: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    channel: "email" as "email" | "sms",
    event: "",
    subject: "",
    body: "",
    isEnabled: true,
    locale: "en",
  });

  const [previewTestData, setPreviewTestData] = useState({
    name: "John Doe",
    orderNumber: "ORD-12345678",
    orderTotal: "100.00",
    currency: "GHS",
    otp: "123456",
    expiryMinutes: "10",
    resetLink: "https://example.com/reset-password?token=abc123",
    ticketNumber: "TKT-123456",
    firstName: "John",
    subject: "Test Subject",
    status: "resolved",
    message: "This is a test message",
    isFromAdmin: true,
    priority: "HIGH",
    customerEmail: "customer@example.com",
    amount: "100.00",
    trackingNumber: "TRACK123",
  });

  const handlePreview = async () => {
    try {
      const response = await fetch("/api/admin/notification-templates/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify({
          template: formData.body,
          subject: formData.channel === "email" ? formData.subject : undefined,
          data: previewTestData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPreviewData(data.data.rendered);
      }
    } catch (error) {
      console.error("Preview failed:", error);
      toast({
        title: "Error",
        description: "Failed to preview template",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/notification-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create template");

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Template created successfully",
        });
        router.push("/admin/notification-templates");
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
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
              <Link href="/admin/notification-templates">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Templates
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Create Notification Template</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="channel">Channel *</Label>
                          <Select
                            value={formData.channel}
                            onValueChange={(value: "email" | "sms") =>
                              setFormData({ ...formData, channel: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="event">Event Type *</Label>
                          <Select
                            value={formData.event}
                            onValueChange={(value) =>
                              setFormData({ ...formData, event: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map((event) => (
                                <SelectItem key={event} value={event}>
                                  {event
                                    .split("_")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {formData.channel === "email" && (
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({ ...formData, subject: e.target.value })
                            }
                            placeholder="e.g., Order Confirmation - {{orderNumber}}"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Use Handlebars syntax: {"{{variableName}}"}
                          </p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="body">Body Template *</Label>
                        <Textarea
                          id="body"
                          value={formData.body}
                          onChange={(e) =>
                            setFormData({ ...formData, body: e.target.value })
                          }
                          rows={formData.channel === "email" ? 20 : 5}
                          placeholder={
                            formData.channel === "email"
                              ? "HTML email template with Handlebars variables..."
                              : "SMS message template (max 160 chars) with Handlebars variables..."
                          }
                          required
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use Handlebars syntax: {"{{variableName}}"} for variables,
                          {"{{#if condition}}"} for conditionals
                        </p>
                        {formData.channel === "sms" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Character count: {formData.body.length}/160
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="locale">Locale</Label>
                        <Input
                          id="locale"
                          value={formData.locale}
                          onChange={(e) =>
                            setFormData({ ...formData, locale: e.target.value })
                          }
                          placeholder="en"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Language code (e.g., "en", "fr", "es")
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>
                        Test your template with sample data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreview}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Template
                      </Button>
                      {previewData && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          {previewData.subject && (
                            <div className="mb-4">
                              <Label className="text-sm font-semibold">Subject:</Label>
                              <p className="text-sm mt-1">{previewData.subject}</p>
                            </div>
                          )}
                          <Label className="text-sm font-semibold">Body:</Label>
                          <div
                            className="mt-2 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: previewData.body,
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enabled</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable this template for use
                          </p>
                        </div>
                        <Switch
                          checked={formData.isEnabled}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isEnabled: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Available Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs space-y-2">
                        <p className="font-semibold">Common Variables:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>{"{{name}}"}</li>
                          <li>{"{{orderNumber}}"}</li>
                          <li>{"{{orderTotal}}"}</li>
                          <li>{"{{currency}}"}</li>
                          <li>{"{{otp}}"}</li>
                          <li>{"{{resetLink}}"}</li>
                          <li>{"{{ticketNumber}}"}</li>
                        </ul>
                        <p className="font-semibold mt-4">Conditionals:</p>
                        <p className="text-muted-foreground">
                          {"{{#if variable}}"} ... {"{{/if}}"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Link href="/admin/notification-templates">
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
