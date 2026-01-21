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
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminShippingMethodCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    deliveryTime: "",
    multiplier: "1.0",
    order: "0",
    isActive: true,
  });

  const generateCode = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: generateCode(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const shippingMethodData = {
        ...formData,
        multiplier: parseFloat(formData.multiplier),
        order: parseInt(formData.order),
      };

      const response = await fetch("/api/admin/shipping-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(shippingMethodData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create shipping method");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Shipping method created successfully",
        });
        router.push("/admin/shipping-methods");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipping method",
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
              <Link href="/admin/shipping-methods">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shipping Methods
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Create New Shipping Method</h1>
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
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="e.g., Standard Shipping"
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
                          placeholder="e.g., standard"
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
                          placeholder="e.g., Standard shipping with reliable delivery"
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
                          placeholder="e.g., 4-7 business days"
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
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Shipping Method"}
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
