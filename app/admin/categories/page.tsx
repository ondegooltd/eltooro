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
import { FolderTree, Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import React from "react";
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
  image?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "/api/admin/categories?includeInactive=true",
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
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
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const getParentName = (parentId: string | undefined) => {
    if (!parentId) return "None";
    const parent = categories.find((c) => c._id === parentId);
    return parent ? parent.name : "Unknown";
  };

  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  });

  // Separate parent and child categories
  const parentCategories = filteredCategories.filter((c) => !c.parentId);
  const childCategories = filteredCategories.filter((c) => c.parentId);

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Category Management</h1>
                <p className="text-muted-foreground mt-1">
                  Organize your product categories
                </p>
              </div>
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, slug, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  {filteredCategories.length} categor
                  {filteredCategories.length !== 1 ? "ies" : "y"} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading categories...</div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No categories found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Parent</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parentCategories.map((category) => (
                          <React.Fragment key={category._id}>
                            <TableRow>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                                  {category.name}
                                </div>
                                {category.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {category.description}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {category.slug}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">Root</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {category.productCount}
                                </Badge>
                              </TableCell>
                              <TableCell>{category.order}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    category.isActive ? "default" : "secondary"
                                  }
                                >
                                  {category.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Link
                                    href={`/admin/categories/${category._id}`}
                                  >
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      deleteCategory(
                                        category._id,
                                        category.name
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {childCategories
                              .filter((c) => c.parentId === category._id)
                              .map((subcategory) => (
                                <TableRow key={subcategory._id}>
                                  <TableCell className="font-medium pl-8">
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">
                                        └─
                                      </span>
                                      {subcategory.name}
                                    </div>
                                    {subcategory.description && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {subcategory.description}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {subcategory.slug}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {getParentName(subcategory.parentId)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">
                                      {subcategory.productCount}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{subcategory.order}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        subcategory.isActive
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {subcategory.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Link
                                        href={`/admin/categories/${subcategory._id}`}
                                      >
                                        <Button variant="outline" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          deleteCategory(
                                            subcategory._id,
                                            subcategory.name
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </React.Fragment>
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
