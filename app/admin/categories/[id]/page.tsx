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
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  subcategories?: Category[];
}

export default function AdminCategoryEditPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    order: "0",
    isActive: true,
  });

  useEffect(() => {
    fetchParentCategories();
    if (params.id) {
      fetchCategory();
    }
  }, [params.id]);

  const fetchParentCategories = async () => {
    try {
      const response = await fetch(
        "/api/admin/categories?includeInactive=true",
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Exclude current category and its subcategories from parent options
        const filtered = (data.data || []).filter(
          (c: Category) => !c.parentId && c._id !== params.id
        );
        setParentCategories(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/categories/${params.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch category");

      const data = await response.json();
      if (data.success) {
        const cat = data.data;
        setCategory(cat);
        setFormData({
          name: cat.name || "",
          slug: cat.slug || "",
          description: cat.description || "",
          parentId: cat.parentId?.toString() || "__none__",
          order: cat.order?.toString() || "0",
          isActive: cat.isActive !== undefined ? cat.isActive : true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
      toast({
        title: "Error",
        description: "Failed to load category",
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
      const categoryData = {
        ...formData,
        parentId:
          formData.parentId === "__none__" ? undefined : formData.parentId,
        order: parseInt(formData.order),
      };

      const response = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update category");
      }

      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      router.push("/admin/categories");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete category");
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      router.push("/admin/categories");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading category...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!category) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Category not found</div>
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
              <Link href="/admin/categories">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </Link>
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Category</h1>
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
                      <CardTitle>Category Information</CardTitle>
                      <CardDescription>
                        {category.productCount} product
                        {category.productCount !== 1 ? "s" : ""} in this
                        category
                        {category.subcategories &&
                          category.subcategories.length > 0 && (
                            <>
                              {" "}
                              • {category.subcategories.length} subcategor
                              {category.subcategories.length !== 1
                                ? "ies"
                                : "y"}
                            </>
                          )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Category Name *</Label>
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
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          URL-friendly identifier
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentId">Parent Category</Label>
                        <Select
                          value={formData.parentId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, parentId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              None (Root Category)
                            </SelectItem>
                            {parentCategories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty for a root category
                        </p>
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
                            Show category on website
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
                <Link href="/admin/categories">
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
