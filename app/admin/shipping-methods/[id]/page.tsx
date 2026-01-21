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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
}

export default function AdminShippingMethodEditPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    deliveryTime: "",
    multiplier: "1.0",
    order: "0",
    isActive: true,
  });

  useEffect(() => {
    if (params.id) {
      fetchShippingMethod();
    }
  }, [params.id]);

  const fetchShippingMethod = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/shipping-methods/${params.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch shipping method");

      const data = await response.json();
      if (data.success) {
        const method = data.data;
        setShippingMethod(method);
        setFormData({
          name: method.name || "",
          code: method.code || "",
          description: method.description || "",
          deliveryTime: method.deliveryTime || "",
          multiplier: method.multiplier?.toString() || "1.0",
          order: method.order?.toString() || "0",
          isActive: method.isActive !== undefined ? method.isActive : true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch shipping method:", error);
      toast({
        title: "Error",
        description: "Failed to load shipping method",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const shippingMethodData = {
        ...formData,
        multiplier: parseFloat(formData.multiplier),
        order: parseInt(formData.order),
      };

      const response = await fetch(`/api/admin/shipping-methods/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(shippingMethodData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update shipping method");
      }

      toast({
        title: "Success",
        description: "Shipping method updated successfully",
      });
      router.push("/admin/shipping-methods");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update shipping method",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!shippingMethod) return;
    if (
      !confirm(
        `Are you sure you want to delete "${shippingMethod.name}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/admin/shipping-methods/${shippingMethod._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete shipping method");
      }

      toast({
        title: "Success",
        description: "Shipping method deleted successfully",
      });
      router.push("/admin/shipping-methods");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipping method",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading shipping method...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!shippingMethod) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Shipping method not found</div>
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
              <Link href="/admin/shipping-methods">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shipping Methods
                </Button>
              </Link>
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Shipping Method</h1>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Method Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
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
                        <Label htmlFor="code">Code *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              code: e.target.value.toLowerCase(),
                            })
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Unique identifier (lowercase, no spaces)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryTime">Delivery Time *</Label>
                        <Input
                          id="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deliveryTime: e.target.value,
                            })
                          }
                          required
                        />
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
                        <Label htmlFor="multiplier">Cost Multiplier *</Label>
                        <Input
                          id="multiplier"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.multiplier}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              multiplier: e.target.value,
                            })
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Multiplier for base shipping cost (e.g., 1.0 for standard, 1.5 for express)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="order">Display Order</Label>
                        <Input
                          id="order"
                          type="number"
                          value={formData.order}
                          onChange={(e) =>
                            setFormData({ ...formData, order: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Lower numbers appear first
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Active</Label>
                          <p className="text-sm text-muted-foreground">
                            Show shipping method on checkout
                          </p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isActive: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Link href="/admin/shipping-methods">
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
