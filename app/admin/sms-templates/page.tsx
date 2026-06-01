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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SMSTemplate {
  _id: string;
  eventType: string;
  name: string;
  message: string;
  status: string;
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: string;
}

export default function AdminSMSTemplatesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/sms-templates", {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast({
        title: "Error",
        description: "Failed to load SMS templates",
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
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">SMS Templates</h1>
                <p className="text-muted-foreground mt-1">
                  Manage SMS notification templates
                </p>
              </div>
              <Link href="/admin/sms-templates/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>
                  {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
                  found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading templates...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Message Preview</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template._id}>
                            <TableCell className="font-medium">
                              {template.eventType}
                            </TableCell>
                            <TableCell>
                              {template.name}
                              {template.isDefault && (
                                <Badge variant="default" className="ml-2">
                                  Default
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {template.message}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  template.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {template.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.usageCount} time
                              {template.usageCount !== 1 ? "s" : ""}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/sms-templates/${template._id}`}
                                >
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link
                                  href={`/admin/sms-templates/${template._id}/preview`}
                                >
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
