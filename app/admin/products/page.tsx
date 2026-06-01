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
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  ArrowLeft,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
  order: number;
}
interface Product {
  _id: string;
  name: string;
  slug: string;
  costPrice?: number;
  price: number | { ghs: number; usd?: number };
  stock: number | { quantity: number; inStock: boolean };
  status: string;
  images: ProductImage[];
  category: {
    main: string;
    sub?: string;
  };
  brand?: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, page]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/products?${params}`);

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(data.meta?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const duplicateProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      // Fetch the full product data
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");

      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch product");

      const product = data.data;

      // Generate new name and slug for the duplicate
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      };

      const newName = `${product.name} (Copy)`;
      const newSlug = `${generateSlug(product.name)}-copy-${Date.now()}`;

      // Prepare duplicate product data
      const duplicateData = {
        name: newName,
        slug: newSlug,
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        costPrice: product.costPrice,
        price:
          typeof product.price === "object" ? product.price.ghs : product.price,
        stock:
          typeof product.stock === "object"
            ? product.stock.quantity
            : product.stock || 0,
        category: product.category || { main: "" },
        brand: product.brand || "",
        status: "draft", // Set as draft so user can review before publishing
        sku: "", // Will be auto-generated
        weight: product.weight,
        dimensions: product.dimensions,
        tags: product.tags || [],
        highlights: product.highlights || [],
        specifications: product.specifications || [],
        images: product.images?.map((img: any) => img.url) || [],
        isTrending: false, // Reset flags
        isNewArrival: false,
        isBestSeller: false,
      };

      // Create the duplicate product
      const createResponse = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateData),
      });

      if (!createResponse.ok) throw new Error("Failed to create duplicate");

      const createData = await createResponse.json();
      if (!createData.success) throw new Error("Failed to create duplicate");

      toast({
        title: "Success",
        description: "Product duplicated successfully",
      });

      // Redirect to edit page for the new product
      window.location.href = `/admin/products/${createData.data._id}/edit`;
    } catch (error) {
      console.error("Failed to duplicate product:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category.main.toLowerCase().includes(query)
    );
  });

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
                <h1 className="text-3xl font-bold">Product Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your product catalog
                </p>
              </div>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
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
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted flex items-center justify-center rounded">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {product.name}
                              {product.brand && (
                                <div className="text-xs text-muted-foreground">
                                  {product.brand}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {product.category.main}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  GHS{" "}
                                  {typeof product.price === "object"
                                    ? product.price.ghs.toFixed(2)
                                    : product.price.toFixed(2)}
                                </div>
                                {product.costPrice && (
                                  <div className="text-xs text-muted-foreground">
                                    Cost: GHS {product.costPrice.toFixed(2)} |
                                    Profit: GHS{" "}
                                    {(
                                      (typeof product.price === "object"
                                        ? product.price.ghs
                                        : product.price) - product.costPrice
                                    ).toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  (typeof product.stock === "object"
                                    ? product.stock.quantity
                                    : product.stock) > 10
                                    ? "default"
                                    : (typeof product.stock === "object"
                                        ? product.stock.quantity
                                        : product.stock) > 0
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {typeof product.stock === "object"
                                  ? product.stock.quantity
                                  : product.stock}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link href={`/admin/products/${product._id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link
                                  href={`/admin/products/${product._id}/edit`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => duplicateProduct(product._id)}
                                  title="Duplicate"
                                  disabled={isLoading}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteProduct(product._id)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
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
