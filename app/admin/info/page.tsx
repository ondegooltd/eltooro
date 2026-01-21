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
import { FileText, Plus, Edit, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminInfo {
  _id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminInfoPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [infoItems, setInfoItems] = useState<AdminInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/info", {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch content");

      const data = await response.json();
      if (data.success) {
        setInfoItems(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
      toast({
        title: "Error",
        description: "Failed to load content",
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
                <h1 className="text-3xl font-bold">Content Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage static content and pages
                </p>
              </div>
              <Link href="/admin/info/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Content
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Items</CardTitle>
                <CardDescription>
                  {infoItems.length} item{infoItems.length !== 1 ? "s" : ""}{" "}
                  found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading content...</div>
                ) : infoItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No content found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {infoItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <Badge variant="outline">{item.type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.slug}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "published"
                                    ? "default"
                                    : item.status === "draft"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link href={`/admin/info/${item.slug}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
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
