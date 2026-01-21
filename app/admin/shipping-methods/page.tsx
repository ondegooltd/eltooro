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
import { Input } from "@/components/ui/input";
import { Truck, Plus, Edit, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShippingMethod {
  _id: string;
  name: string;
  code: string;
  description: string;
  deliveryTime: string;
  multiplier: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminShippingMethodsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "/api/admin/shipping-methods?includeInactive=true",
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch shipping methods");

      const data = await response.json();
      if (data.success) {
        setShippingMethods(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods:", error);
      toast({
        title: "Error",
        description: "Failed to load shipping methods",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShippingMethod = async (
    methodId: string,
    methodName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${methodName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/shipping-methods/${methodId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete shipping method");
      }

      toast({
        title: "Success",
        description: "Shipping method deleted successfully",
      });
      fetchShippingMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipping method",
        variant: "destructive",
      });
    }
  };

  const filteredMethods = shippingMethods.filter((method) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      method.name.toLowerCase().includes(query) ||
      method.code.toLowerCase().includes(query) ||
      method.description?.toLowerCase().includes(query) ||
      method.deliveryTime?.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Shipping Methods</h1>
                <p className="text-muted-foreground mt-1">
                  Manage shipping methods and delivery options
                </p>
              </div>
              <Link href="/admin/shipping-methods/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shipping Method
                </Button>
              </Link>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search Shipping Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, code, description, or delivery time..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Methods Table */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Methods</CardTitle>
                <CardDescription>
                  {filteredMethods.length} shipping method
                  {filteredMethods.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading shipping methods...</div>
                ) : filteredMethods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No shipping methods found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Delivery Time</TableHead>
                          <TableHead>Multiplier</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMethods.map((method) => (
                          <TableRow key={method._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                {method.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-sm">
                              {method.code}
                            </TableCell>
                            <TableCell className="text-sm">
                              {method.description}
                            </TableCell>
                            <TableCell className="text-sm">
                              {method.deliveryTime}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {method.multiplier}x
                              </Badge>
                            </TableCell>
                            <TableCell>{method.order}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  method.isActive ? "default" : "secondary"
                                }
                              >
                                {method.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link
                                  href={`/admin/shipping-methods/${method._id}`}
                                >
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    deleteShippingMethod(
                                      method._id,
                                      method.name
                                    )
                                  }
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
