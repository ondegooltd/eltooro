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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mail,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface NotificationTemplate {
  _id: string;
  channel: "email" | "sms";
  event: string;
  subject?: string;
  body: string;
  isEnabled: boolean;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNotificationTemplatesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, [channelFilter]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (channelFilter !== "all") {
        params.set("channel", channelFilter);
      }

      const response = await fetch(
        `/api/admin/notification-templates?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast({
        title: "Error",
        description: "Failed to load notification templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTemplate = async (templateId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/notification-templates/${templateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
          body: JSON.stringify({
            isEnabled: !currentStatus,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update template");

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Template ${!currentStatus ? "enabled" : "disabled"}`,
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to toggle template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string, event: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the template for "${event}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/admin/notification-templates/${templateId}`,
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
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.event.toLowerCase().includes(query) ||
      template.body.toLowerCase().includes(query) ||
      template.subject?.toLowerCase().includes(query)
    );
  });

  const getEventDisplayName = (event: string) => {
    return event
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
                <h1 className="text-3xl font-bold">Notification Templates</h1>
                <p className="text-muted-foreground mt-1">
                  Manage email and SMS notification templates
                </p>
              </div>
              <Link href="/admin/notification-templates/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Templates Table */}
            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>
                  {filteredTemplates.length} template
                  {filteredTemplates.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading templates...</div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Channel</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Locale</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTemplates.map((template) => (
                          <TableRow key={template._id}>
                            <TableCell>
                              <Badge
                                variant={
                                  template.channel === "email"
                                    ? "default"
                                    : "secondary"
                                }
                                className="flex items-center gap-1 w-fit"
                              >
                                {template.channel === "email" ? (
                                  <Mail className="h-3 w-3" />
                                ) : (
                                  <MessageSquare className="h-3 w-3" />
                                )}
                                {template.channel.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {getEventDisplayName(template.event)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {template.subject || (
                                <span className="text-muted-foreground">
                                  N/A (SMS)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={template.isEnabled}
                                  onCheckedChange={() =>
                                    toggleTemplate(
                                      template._id,
                                      template.isEnabled
                                    )
                                  }
                                />
                                <Badge
                                  variant={
                                    template.isEnabled ? "default" : "secondary"
                                  }
                                >
                                  {template.isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{template.locale}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/notification-templates/${template._id}`}
                                >
                                  <Button variant="outline" size="sm" title="View">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link
                                  href={`/admin/notification-templates/${template._id}/edit`}
                                >
                                  <Button variant="outline" size="sm" title="Edit">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    deleteTemplate(template._id, template.event)
                                  }
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
