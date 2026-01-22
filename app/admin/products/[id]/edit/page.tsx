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
import {
  ArrowLeft,
  Save,
  Trash2,
  X,
  Plus,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

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
  description: string;
  shortDescription?: string;
  costPrice?: number;
  price: number | { ghs: number; usd?: number };
  stock: number | { quantity: number; inStock: boolean };
  category: {
    main: string;
    sub?: string;
  };
  brand?: string;
  status: string;
  images: ProductImage[];
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
}

export default function AdminProductEditPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    costPrice: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    status: "active",
    sku: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    tags: [] as string[],
    highlights: [] as string[],
    specifications: [] as Array<{ label: string; value: string }>,
    images: [] as string[],
    isTrending: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  const [newTag, setNewTag] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    fetchCategories();
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${params.id}`);

      if (!response.ok) throw new Error("Failed to fetch product");

      const data = await response.json();
      if (data.success) {
        const prod = data.data;
        setProduct(prod);
        setFormData({
          name: prod.name || "",
          slug: prod.slug || "",
          description: prod.description || "",
          shortDescription: prod.shortDescription || "",
          costPrice: prod.costPrice?.toString() || "",
          price:
            typeof prod.price === "object"
              ? prod.price.ghs?.toString() || ""
              : prod.price?.toString() || "",
          stock:
            typeof prod.stock === "object"
              ? prod.stock.quantity?.toString() || ""
              : prod.stock?.toString() || "",
          category: prod.category?.main || "",
          brand: prod.brand || "",
          status: prod.status || "active",
          sku: prod.sku || "",
          weight: prod.weight?.toString() || "",
          dimensions: {
            length: prod.dimensions?.length?.toString() || "",
            width: prod.dimensions?.width?.toString() || "",
            height: prod.dimensions?.height?.toString() || "",
          },
          tags: prod.tags || [],
          highlights: prod.highlights || [],
          specifications: prod.specifications || [],
          images: prod.images?.map((img: ProductImage) => img.url) || [],
          isTrending: prod.isTrending || false,
          isNewArrival: prod.isNewArrival || false,
          isBestSeller: prod.isBestSeller || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const addHighlight = () => {
    if (
      newHighlight.trim() &&
      !formData.highlights.includes(newHighlight.trim())
    ) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, newHighlight.trim()],
      });
      setNewHighlight("");
    }
  };

  const removeHighlight = (highlight: string) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((h) => h !== highlight),
    });
  };

  const addSpecification = () => {
    if (newSpecLabel.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specifications: [
          ...formData.specifications,
          { label: newSpecLabel.trim(), value: newSpecValue.trim() },
        ],
      });
      setNewSpecLabel("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (url: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img !== url),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: {
          main: formData.category,
        },
        brand: formData.brand || undefined,
        status: formData.status,
        sku: formData.sku || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions:
          formData.dimensions.length &&
          formData.dimensions.width &&
          formData.dimensions.height
            ? {
                length: parseFloat(formData.dimensions.length),
                width: parseFloat(formData.dimensions.width),
                height: parseFloat(formData.dimensions.height),
              }
            : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        highlights:
          formData.highlights.length > 0 ? formData.highlights : undefined,
        specifications:
          formData.specifications.length > 0
            ? formData.specifications
            : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        isTrending: formData.isTrending,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
      };

      // Remove undefined fields
      Object.keys(productData).forEach((key) => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to update product");

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
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

      // Prepare duplicate product data using current form data
      const duplicateData = {
        name: newName,
        slug: newSlug,
        description: formData.description || "",
        shortDescription: formData.shortDescription || "",
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: {
          main: formData.category,
        },
        brand: formData.brand || "",
        status: "draft", // Set as draft so user can review before publishing
        sku: "", // Will be auto-generated
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions:
          formData.dimensions.length && formData.dimensions.width && formData.dimensions.height
            ? {
                length: parseFloat(formData.dimensions.length),
                width: parseFloat(formData.dimensions.width),
                height: parseFloat(formData.dimensions.height),
              }
            : undefined,
        tags: formData.tags || [],
        highlights: formData.highlights || [],
        specifications: formData.specifications || [],
        images: formData.images || [],
        isTrending: false, // Reset flags
        isNewArrival: false,
        isBestSeller: false,
      };

      // Create the duplicate product
      const createResponse = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
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
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={duplicateProduct}
                    disabled={isDuplicating}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {isDuplicating ? "Duplicating..." : "Duplicate"}
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
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
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={6}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shortDescription">
                          Short Description
                        </Label>
                        <Textarea
                          id="shortDescription"
                          value={formData.shortDescription}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shortDescription: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Brief product summary..."
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="costPrice">Cost Price (GHS)</Label>
                          <Input
                            id="costPrice"
                            type="number"
                            step="0.01"
                            value={formData.costPrice}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                costPrice: e.target.value,
                              })
                            }
                            placeholder="0.00"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Purchase cost
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="price">Selling Price (GHS) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Customer price
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="stock">Stock *</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                stock: e.target.value,
                              })
                            }
                            required
                          />
                          {formData.costPrice && formData.price && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <div className="font-medium">Profit Margin:</div>
                              <div>
                                GHS{" "}
                                {(
                                  parseFloat(formData.price) -
                                  parseFloat(formData.costPrice)
                                ).toFixed(2)}{" "}
                                (
                                {(
                                  ((parseFloat(formData.price) -
                                    parseFloat(formData.costPrice)) /
                                    parseFloat(formData.price)) *
                                  100
                                ).toFixed(1)}
                                %)
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) =>
                            setFormData({ ...formData, brand: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Images Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Images</CardTitle>
                      <CardDescription>
                        Add image URLs (Cloudinary or external URLs)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addImage();
                            }
                          }}
                        />
                        <Button type="button" onClick={addImage}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {formData.images.map((url, index) => (
                            <div
                              key={index}
                              className="relative group border rounded-lg overflow-hidden"
                            >
                              <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.svg";
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(url)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tags Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                            >
                              {tag}
                              <button
                                title="Remove tag"
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Highlights Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add highlight"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addHighlight();
                            }
                          }}
                        />
                        <Button type="button" onClick={addHighlight}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.highlights.length > 0 && (
                        <ul className="space-y-2">
                          {formData.highlights.map((highlight, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-muted px-3 py-2 rounded"
                            >
                              <span>{highlight}</span>
                              <button
                                title="Remove highlight"
                                type="button"
                                onClick={() => removeHighlight(highlight)}
                                className="text-muted-foreground hover:text-foreground ml-2"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>

                  {/* Specifications Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Label"
                          value={newSpecLabel}
                          onChange={(e) => setNewSpecLabel(e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSpecification();
                            }
                          }}
                        />
                      </div>
                      <Button type="button" onClick={addSpecification}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Specification
                      </Button>
                      {formData.specifications.length > 0 && (
                        <div className="space-y-2">
                          {formData.specifications.map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-muted px-3 py-2 rounded"
                            >
                              <span className="text-sm">
                                <strong>{spec.label}:</strong> {spec.value}
                              </span>
                              <button
                                title="Remove specification"
                                type="button"
                                onClick={() => removeSpecification(index)}
                                className="text-muted-foreground hover:text-foreground ml-2"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isTrending">Trending Product</Label>
                          <Switch
                            id="isTrending"
                            checked={formData.isTrending}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                isTrending: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isNewArrival">New Arrival</Label>
                          <Switch
                            id="isNewArrival"
                            checked={formData.isNewArrival}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                isNewArrival: checked,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isBestSeller">Best Seller</Label>
                          <Switch
                            id="isBestSeller"
                            checked={formData.isBestSeller}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                isBestSeller: checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Dimensions & Weight</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weight: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="length">Length</Label>
                          <Input
                            id="length"
                            type="number"
                            step="0.01"
                            value={formData.dimensions.length}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dimensions: {
                                  ...formData.dimensions,
                                  length: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="width">Width</Label>
                          <Input
                            id="width"
                            type="number"
                            step="0.01"
                            value={formData.dimensions.width}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dimensions: {
                                  ...formData.dimensions,
                                  width: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            type="number"
                            step="0.01"
                            value={formData.dimensions.height}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dimensions: {
                                  ...formData.dimensions,
                                  height: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Link href="/admin/products">
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
