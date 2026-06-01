"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { SITE_PHONE_DISPLAY } from "@/lib/site";

interface Address {
  _id: string;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  region: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: "shipping" as "shipping" | "billing",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    region: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/addresses");
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 150);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      type: "shipping",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      region: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      apartment: address.apartment || "",
      city: address.city,
      region: address.region,
      postalCode: address.postalCode || "",
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        fetchAddresses();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete address",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const url = editingAddress
        ? `/api/users/addresses/${editingAddress._id}`
        : "/api/users/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: editingAddress
            ? "Address updated successfully"
            : "Address added successfully",
        });
        setIsDialogOpen(false);
        fetchAddresses();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save address",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
              <Loader2 className="h-8 w-8 animate-spin text-iherb-green" />
            </div>
          )}

          {/* Content with smooth fade-in */}
          <div
            className={`container mx-auto px-4 py-8 transition-opacity duration-500 ease-in-out ${
              showContent && !isLoading ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Account
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Addresses</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Manage your shipping and billing addresses
                </p>
              </div>
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-card border rounded-lg p-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first address to get started
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="bg-card border rounded-lg p-4 sm:p-6 relative"
                  >
                    {address.isDefault && (
                      <Badge className="absolute top-4 right-4 bg-iherb-green">
                        Default
                      </Badge>
                    )}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-iherb-green" />
                        <h3 className="font-semibold capitalize">
                          {address.type}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-sm mt-1">
                        {address.address}
                        {address.apartment && `, ${address.apartment}`}
                      </p>
                      <p className="text-sm">
                        {address.city}, {address.region}
                        {address.postalCode && ` ${address.postalCode}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Address Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAddress
                      ? "Update your address information"
                      : "Add a new shipping or billing address"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Address Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "shipping" | "billing") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apartment">
                      Apartment, suite, etc. (optional)
                    </Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) =>
                        setFormData({ ...formData, apartment: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="region">Region/State</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code (optional)</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder={SITE_PHONE_DISPLAY}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      title="Set as default address"
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDefault: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Set as default {formData.type} address
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Address
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
