"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
  Loader2,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, ordersRes, wishlistRes] = await Promise.all([
          fetch("/api/users/profile"),
          fetch("/api/orders"),
          fetch("/api/wishlist"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserData(profileData.data);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.data || []);
        }

        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          setWishlist(wishlistData.data?.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
        // Smooth fade-in after a brief delay
        setTimeout(() => setShowContent(true), 150);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const handleEditProfile = () => {
    setProfileFormData({
      firstName: userData?.name?.first || "",
      lastName: userData?.name?.last || "",
      phone: userData?.phone || "",
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: {
            first: profileFormData.firstName,
            last: profileFormData.lastName,
          },
          phone: profileFormData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setIsEditingProfile(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        // Refresh user data
        const profileRes = await fetch("/api/users/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserData(profileData.data);
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const userName = userData?.name
    ? `${userData.name.first} ${userData.name.last}`
    : session?.user?.name || "User";
  const userEmail = userData?.email || session?.user?.email || "";

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
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
              My Account
            </h1>

            <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border rounded-lg p-4 sm:p-6 sticky top-4">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-10 w-10 text-iherb-green" />
                    </div>
                    <h2 className="font-semibold">{userName}</h2>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                    <Badge className="mt-2 bg-iherb-green">Member</Badge>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { icon: Package, label: "Orders", href: "/orders" },
                      { icon: Heart, label: "Wishlist", href: "/wishlist" },
                      {
                        icon: CreditCard,
                        label: "Payment Methods",
                        href: "/account/payments",
                      },
                      {
                        icon: MapPin,
                        label: "Addresses",
                        href: "/account/addresses",
                      },
                      {
                        icon: Bell,
                        label: "Notifications",
                        href: "/account/notifications",
                      },
                      {
                        icon: Settings,
                        label: "Settings",
                        href: "/account/settings",
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span>{item.label}</span>
                        <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors w-full text-left text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-card border w-full overflow-x-auto scrollbar-hide">
                    <div className="flex min-w-max">
                      <TabsTrigger
                        value="overview"
                        className="text-xs sm:text-sm px-3 sm:px-4"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="orders"
                        className="text-xs sm:text-sm px-3 sm:px-4"
                      >
                        Orders
                      </TabsTrigger>
                      <TabsTrigger
                        value="wishlist"
                        className="text-xs sm:text-sm px-3 sm:px-4"
                      >
                        Wishlist
                      </TabsTrigger>
                      <TabsTrigger
                        value="profile"
                        className="text-xs sm:text-sm px-3 sm:px-4"
                      >
                        Profile
                      </TabsTrigger>
                    </div>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-iherb-green">
                          {orders.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Orders
                        </div>
                      </div>
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-iherb-green">
                          {wishlist.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Wishlist Items
                        </div>
                      </div>
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-iherb-green">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Rewards Points
                        </div>
                      </div>
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-iherb-green">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Auto-Delivery
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Recent Orders</h3>
                        <Link
                          href="/orders"
                          className="text-iherb-green text-sm hover:underline"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {orders.length > 0 ? (
                          orders.slice(0, 3).map((order: any) => (
                            <div
                              key={order._id || order.orderNumber}
                              className="flex items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}{" "}
                                  • {order.items?.length || 0} items
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {order.pricing?.currency || "GHS"}{" "}
                                  {order.pricing?.total?.toFixed(2) || "0.00"}
                                </p>
                                <Badge
                                  variant={
                                    order.status === "delivered"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No orders yet
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders">
                    <div className="bg-card border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        Order History
                      </h3>
                      <div className="space-y-4">
                        {orders.length > 0 ? (
                          orders.map((order: any) => (
                            <div
                              key={order._id || order.orderNumber}
                              className="flex items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}{" "}
                                  • {order.items?.length || 0} items
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {order.pricing?.currency || "GHS"}{" "}
                                  {order.pricing?.total?.toFixed(2) || "0.00"}
                                </p>
                                <Badge
                                  variant={
                                    order.status === "delivered"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <Link
                                href={`/orders/${
                                  order._id || order.orderNumber
                                }`}
                              >
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No orders yet
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Wishlist Tab */}
                  <TabsContent value="wishlist">
                    <div className="bg-card border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        My Wishlist
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {wishlist.length > 0 ? (
                          wishlist.map((item: any) => (
                            <div
                              key={item.productId || item._id}
                              className="border rounded-lg p-4"
                            >
                              <p className="font-medium text-sm mb-2 line-clamp-2">
                                {item.name || "Product"}
                              </p>
                              <Link
                                href={`/product/${
                                  item.slug || item.productId || item._id
                                }`}
                              >
                                <Button
                                  className="w-full mt-3 bg-iherb-green hover:bg-iherb-green-dark"
                                  size="sm"
                                >
                                  View Product
                                </Button>
                              </Link>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8 col-span-3">
                            Your wishlist is empty
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Profile Tab */}
                  <TabsContent value="profile">
                    <div className="bg-card border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">
                          Personal Information
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditProfile}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={userData?.name?.first || ""}
                            className="mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={userData?.name?.last || ""}
                            className="mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={userData?.email || userEmail}
                            className="mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={userData?.phone || "Not provided"}
                            className="mt-1"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Edit Profile Dialog */}
                    <Dialog
                      open={isEditingProfile}
                      onOpenChange={setIsEditingProfile}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Update your personal information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileFormData.firstName}
                              onChange={(e) =>
                                setProfileFormData({
                                  ...profileFormData,
                                  firstName: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileFormData.lastName}
                              onChange={(e) =>
                                setProfileFormData({
                                  ...profileFormData,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={profileFormData.phone}
                              onChange={(e) =>
                                setProfileFormData({
                                  ...profileFormData,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+233XXXXXXXXX"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingProfile(false)}
                            disabled={isSavingProfile}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
