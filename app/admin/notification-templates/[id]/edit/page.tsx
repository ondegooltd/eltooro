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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationTemplate {
  _id: string;
  channel: "email" | "sms";
  event: string;
  subject?: string;
  body: string;
  isEnabled: boolean;
  locale: string;
}

export default function AdminNotificationTemplateEditPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
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

  useEffect(() => {
    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/notification-templates/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch template");

      const data = await response.json();
      if (data.success) {
        const templateData = data.data;
        setTemplate(templateData);
        setFormData({
          channel: templateData.channel,
          event: templateData.event,
          subject: templateData.subject || "",
          body: templateData.body,
          isEnabled: templateData.isEnabled,
          locale: templateData.locale,
        });
      }
    } catch (error) {
      console.error("Failed to fetch template:", error);
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!formData.body || formData.body.trim().length === 0) {
      toast({
        title: "Error",
        description: "Please enter a template body before previewing",
        variant: "destructive",
      });
      return;
    }

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
      } else {
        throw new Error(data.message || "Failed to preview template");
      }
    } catch (error: any) {
      console.error("Preview failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to preview template",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/notification-templates/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update template");

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
        router.push("/admin/notification-templates");
      }
    } catch (error) {
      console.error("Failed to update template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(
        `/api/admin/notification-templates/${params.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete template");

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      router.push("/admin/notification-templates");
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading template...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!template) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Template not found</div>
        </div>
      </ProtectedRoute>
    );
  }

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
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Notification Template</h1>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
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
                          <Label>Channel</Label>
                          <Input
                            value={formData.channel}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Channel cannot be changed
                          </p>
                        </div>
                        <div>
                          <Label>Event Type</Label>
                          <Input
                            value={formData.event}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Event cannot be changed
                          </p>
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
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
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
