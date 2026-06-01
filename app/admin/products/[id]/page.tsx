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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Box,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  costPrice?: number;
  price: number | { ghs: number; usd?: number };
  stock: number | { quantity: number; inStock: boolean };
  status: string;
  images: Array<{
    url: string;
    publicId: string;
    alt: string;
    order: number;
  }>;
  category: {
    main: string;
    sub?: string;
  };
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  highlights?: string[];
  specifications?: Array<{ label: string; value: string }>;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${params.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch product");

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateProduct = async () => {
    if (!product) return;

    try {
      setIsDuplicating(true);
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
        images: product.images?.map((img: any) =>
          typeof img === "string" ? img : img.url
        ) || [],
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
      router.push(`/admin/products/${createData.data._id}/edit`);
    } catch (error) {
      console.error("Failed to duplicate product:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading product...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Product not found</div>
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
              <Link href="/admin/products">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <p className="text-muted-foreground mt-1">{product.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={duplicateProduct}
                    disabled={isDuplicating}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {isDuplicating ? "Duplicating..." : "Duplicate"}
                  </Button>
                  <Link href={`/admin/products/${product._id}/edit`}>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.images && product.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {product.images.map((image, index) => (
                          <img
                            key={index}
                            src={typeof image === "string" ? image : image.url}
                            alt={
                              typeof image === "string"
                                ? `${product.name} ${index + 1}`
                                : image.alt || `${product.name} ${index + 1}`
                            }
                            className="w-full h-48 object-cover rounded"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-muted rounded">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No images</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {product.shortDescription && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Short Description
                        </h4>
                        <p className="text-muted-foreground">
                          {product.shortDescription}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold mb-2">Full Description</h4>
                      <p className="whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {product.highlights && product.highlights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {product.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {product.specifications &&
                  product.specifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {product.specifications.map((spec, index) => (
                            <div
                              key={index}
                              className="flex justify-between py-2 border-b last:border-0"
                            >
                              <span className="font-medium">{spec.label}:</span>
                              <span className="text-muted-foreground">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {product.tags && product.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "secondary"
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {product.costPrice && (
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Cost Price
                          </div>
                          <div className="text-lg font-medium">
                            GHS {product.costPrice.toFixed(2)}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Selling Price
                        </div>
                        <div className="text-2xl font-bold">
                          GHS{" "}
                          {typeof product.price === "object"
                            ? product.price.ghs.toFixed(2)
                            : product.price.toFixed(2)}
                        </div>
                      </div>
                      {product.costPrice && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">
                            Profit Analysis
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Profit per Unit:</span>
                              <span className="font-medium">
                                GHS{" "}
                                {(
                                  (typeof product.price === "object"
                                    ? product.price.ghs
                                    : product.price) - product.costPrice
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Profit Margin:</span>
                              <span className="font-medium">
                                {(
                                  (((typeof product.price === "object"
                                    ? product.price.ghs
                                    : product.price) -
                                    product.costPrice) /
                                    (typeof product.price === "object"
                                      ? product.price.ghs
                                      : product.price)) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            {typeof product.stock === "object" ? (
                              <div className="flex justify-between">
                                <span className="text-sm">
                                  Total Potential Profit:
                                </span>
                                <span className="font-medium text-green-600">
                                  GHS{" "}
                                  {(
                                    ((typeof product.price === "object"
                                      ? product.price.ghs
                                      : product.price) -
                                      product.costPrice) *
                                    (typeof product.stock === "object"
                                      ? product.stock.quantity
                                      : product.stock)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex justify-between">
                                <span className="text-sm">
                                  Total Potential Profit:
                                </span>
                                <span className="font-medium text-green-600">
                                  GHS{" "}
                                  {(
                                    ((typeof product.price === "object"
                                      ? product.price.ghs
                                      : product.price) -
                                      product.costPrice) *
                                    product.stock
                                  ).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Stock
                      </div>
                      <div className="text-xl font-semibold">
                        {typeof product.stock === "object"
                          ? product.stock.quantity
                          : product.stock}{" "}
                        units
                      </div>
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
                        className="mt-2"
                      >
                        {(typeof product.stock === "object"
                          ? product.stock.quantity
                          : product.stock) > 10
                          ? "In Stock"
                          : (typeof product.stock === "object"
                              ? product.stock.quantity
                              : product.stock) > 0
                          ? "Low Stock"
                          : "Out of Stock"}
                      </Badge>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Category
                      </div>
                      <Badge variant="outline">{product.category.main}</Badge>
                      {product.category.sub && (
                        <Badge variant="outline" className="ml-2">
                          {product.category.sub}
                        </Badge>
                      )}
                    </div>
                    {product.brand && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Brand
                        </div>
                        <div>{product.brand}</div>
                      </div>
                    )}
                    {product.sku && (
                      <div>
                        <div className="text-sm text-muted-foreground">SKU</div>
                        <div>{product.sku}</div>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Product Flags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.isTrending && (
                          <Badge variant="default">Trending</Badge>
                        )}
                        {product.isNewArrival && (
                          <Badge variant="default">New Arrival</Badge>
                        )}
                        {product.isBestSeller && (
                          <Badge variant="default">Best Seller</Badge>
                        )}
                        {!product.isTrending &&
                          !product.isNewArrival &&
                          !product.isBestSeller && (
                            <span className="text-sm text-muted-foreground">
                              No flags set
                            </span>
                          )}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground">Views</div>
                      <div>{product.views || 0}</div>
                    </div>
                  </CardContent>
                </Card>

                {product.weight || product.dimensions ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dimensions & Weight</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {product.weight && (
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Weight
                          </div>
                          <div>{product.weight} kg</div>
                        </div>
                      )}
                      {product.dimensions && (
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Dimensions
                          </div>
                          <div>
                            {product.dimensions.length} ×{" "}
                            {product.dimensions.width} ×{" "}
                            {product.dimensions.height} cm
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="text-sm">
                        {new Date(product.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Updated
                      </div>
                      <div className="text-sm">
                        {new Date(product.updatedAt).toLocaleString()}
                      </div>
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
