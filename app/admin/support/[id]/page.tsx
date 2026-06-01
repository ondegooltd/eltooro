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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface TicketResponse {
  _id: string;
  message: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  isInternal: boolean;
  createdAt: string;
}

interface SupportTicket {
  _id: string;
  ticketNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  responses: TicketResponse[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminSupportTicketDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTicket();
    }
  }, [params.id]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/support/${params.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch ticket");

      const data = await response.json();
      if (data.success) {
        setTicket(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/support/${ticket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "Ticket status updated",
      });
      fetchTicket();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const sendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !responseMessage.trim()) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/support/${ticket._id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify({
          message: responseMessage,
          isInternal: isInternal,
        }),
      });

      if (!response.ok) throw new Error("Failed to send response");

      toast({
        title: "Success",
        description: "Response sent successfully",
      });
      setResponseMessage("");
      setIsInternal(false);
      fetchTicket();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      low: "outline",
      medium: "default",
      high: "secondary",
      urgent: "destructive",
    };

    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading ticket...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Ticket not found</div>
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
              <Link href="/admin/support">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tickets
                </Button>
              </Link>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">
                    Ticket {ticket.ticketNumber}
                  </h1>
                  <p className="text-muted-foreground mt-1">{ticket.subject}</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Status
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <Select value={ticket.status} onValueChange={updateStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Original Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Priority
                        </div>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Message
                        </div>
                        <p className="whitespace-pre-wrap">{ticket.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {ticket.responses && ticket.responses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Responses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ticket.responses.map((response) => (
                        <div key={response._id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {response.authorName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {response.authorEmail}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(response.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {response.isInternal && (
                            <Badge variant="outline" className="text-xs">
                              Internal Note
                            </Badge>
                          )}
                          <p className="whitespace-pre-wrap">
                            {response.message}
                          </p>
                          <Separator />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Add Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={sendResponse} className="space-y-4">
                      <div>
                        <Label htmlFor="response">Response Message</Label>
                        <Textarea
                          id="response"
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={4}
                          placeholder="Type your response here..."
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          title="Internal note (not visible to customer)"
                          type="checkbox"
                          id="internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="internal" className="cursor-pointer">
                          Internal note (not visible to customer)
                        </Label>
                      </div>
                      <Button type="submit" disabled={isSaving}>
                        <Send className="h-4 w-4 mr-2" />
                        {isSaving ? "Sending..." : "Send Response"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">
                        {ticket.firstName} {ticket.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </div>
                      <div>{ticket.email}</div>
                    </div>
                    {ticket.phone && (
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          Phone
                        </div>
                        <div>{ticket.phone}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Ticket Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div>{new Date(ticket.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Last Updated
                      </div>
                      <div>{new Date(ticket.updatedAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Responses
                      </div>
                      <div>{ticket.responses?.length || 0}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
