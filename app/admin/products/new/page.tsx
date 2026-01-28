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
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminProductCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

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
    images: [] as string[],
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
    isTrending: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (formData.images.includes(url)) {
      setNewImageUrl("");
      return;
    }
    setFormData({ ...formData, images: [...formData.images, url] });
    setNewImageUrl("");
  };

  const removeImage = (url: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img !== url),
    });
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag) return;
    if (formData.tags.includes(tag)) {
      setNewTag("");
      return;
    }
    setFormData({ ...formData, tags: [...formData.tags, tag] });
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const addHighlight = () => {
    const highlight = newHighlight.trim();
    if (!highlight) return;
    if (formData.highlights.includes(highlight)) {
      setNewHighlight("");
      return;
    }
    setFormData({
      ...formData,
      highlights: [...formData.highlights, highlight],
    });
    setNewHighlight("");
  };

  const removeHighlight = (highlight: string) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((h) => h !== highlight),
    });
  };

  const addSpecification = () => {
    const label = newSpecLabel.trim();
    const value = newSpecValue.trim();
    if (!label || !value) return;
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { label, value }],
    });
    setNewSpecLabel("");
    setNewSpecValue("");
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        // API expects category as an object: { main, sub? }
        category: { main: formData.category },
        brand: formData.brand || undefined,
        status: formData.status,
        images: formData.images.length > 0 ? formData.images : undefined,
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
        isTrending: formData.isTrending,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
      };

      // Remove undefined fields to keep payload clean
      Object.keys(productData).forEach((key) => {
        if (productData[key] === undefined) delete productData[key];
      });

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to create product");

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        router.push(`/admin/products/${data.data._id}/edit`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
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
              <Link href="/admin/products">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Create New Product</h1>
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
                        <Label htmlFor="name" className="mb-2">
                          Product Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="e.g. Organic Hair Booster"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug" className="mb-2">
                          Slug *
                        </Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                          placeholder="e.g. organic-hair-booster"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="mb-2">
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Write a detailed product description..."
                          rows={6}
                          required
                        />
                      </div>
                    <div>
                      <Label htmlFor="shortDescription" className="mb-2">
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
                          <Label htmlFor="costPrice" className="mb-2">
                            Cost Price (GHS)
                          </Label>
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
                          <Label htmlFor="price" className="mb-2">
                            Selling Price (GHS) *
                          </Label>
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
                            placeholder="0.00"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Customer price
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="stock" className="mb-2">
                            Stock *
                          </Label>
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
                            placeholder="e.g. 50"
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
                        <Label htmlFor="category" className="mb-2">
                          Category *
                        </Label>
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
                        <Label htmlFor="brand" className="mb-2">
                          Brand
                        </Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) =>
                            setFormData({ ...formData, brand: e.target.value })
                          }
                          placeholder="e.g. Eltooro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku" className="mb-2">
                          SKU
                        </Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                          placeholder="e.g. ELT-HAIR-001"
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
                          onKeyDown={(e) => {
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
                              key={`${url}-${index}`}
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
                          onKeyDown={(e) => {
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
                          onKeyDown={(e) => {
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
                          onKeyDown={(e) => {
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
                        <Label htmlFor="status" className="mb-2">
                          Status
                        </Label>
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Flags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="isTrending">Trending Product</Label>
                          <Switch
                            id="isTrending"
                            checked={formData.isTrending}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isTrending: checked })
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
                      <CardTitle className="mb-2">
                        Dimensions & Weight
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="weight" className="mb-2">
                          Weight (kg)
                        </Label>
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
                          placeholder="e.g. 0.25"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="length" className="mb-2">
                            Length
                          </Label>
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
                            placeholder="e.g. 10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="width" className="mb-2">
                            Width
                          </Label>
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
                            placeholder="e.g. 5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="mb-2">
                            Height
                          </Label>
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
                            placeholder="e.g. 3"
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
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Product"}
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
