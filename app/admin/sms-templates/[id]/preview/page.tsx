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
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface SMSTemplate {
  _id: string;
  eventType: string;
  name: string;
  message: string;
}

export default function AdminSMSTemplatePreviewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState<SMSTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any>({});
  const [rendered, setRendered] = useState("");
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  useEffect(() => {
    if (template) {
      previewTemplate();
    }
  }, [previewData, template]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/sms-templates/${params.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch template");

      const data = await response.json();
      if (data.success) {
        setTemplate(data.data);
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

  const previewTemplate = async () => {
    if (!template) return;

    try {
      const response = await fetch(
        `/api/admin/sms-templates/${params.id}/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
          body: JSON.stringify({ variables: previewData }),
        }
      );

      if (!response.ok) throw new Error("Failed to preview template");

      const data = await response.json();
      if (data.success) {
        setRendered(data.data.rendered);
        setLength(data.data.length);
      }
    } catch (error) {
      console.error("Failed to preview template:", error);
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
              <Link href={`/admin/sms-templates/${params.id}`}>
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Template
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Preview SMS Template</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Variables</CardTitle>
                  <CardDescription>
                    Enter sample values to preview the rendered message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={previewData.name || ""}
                      onChange={(e) =>
                        setPreviewData({ ...previewData, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label>Order Number</Label>
                    <Input
                      value={previewData.orderNumber || ""}
                      onChange={(e) =>
                        setPreviewData({
                          ...previewData,
                          orderNumber: e.target.value,
                        })
                      }
                      placeholder="ORD-20240101-12345"
                    />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      value={previewData.amount || ""}
                      onChange={(e) =>
                        setPreviewData({
                          ...previewData,
                          amount: e.target.value,
                        })
                      }
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input
                      value={previewData.currency || ""}
                      onChange={(e) =>
                        setPreviewData({
                          ...previewData,
                          currency: e.target.value,
                        })
                      }
                      placeholder="GHS"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    {length}/160 characters
                    {length > 160 && (
                      <span className="text-destructive ml-2">
                        (Exceeds limit by {length - 160})
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg min-h-[200px]">
                    <p className="whitespace-pre-wrap">
                      {rendered || template.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
