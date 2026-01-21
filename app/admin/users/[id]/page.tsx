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
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserAddress {
  _id: string;
  type: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  region: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  email?: string;
  phone?: string;
  name: {
    first: string;
    last: string;
  };
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  addresses: UserAddress[];
  preferences: {
    currency: string;
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUserDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      // Note: You'll need to create a /api/admin/users/[id] endpoint
      // For now, this is a placeholder
      const response = await fetch(`/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) {
        // Placeholder - in real app, fetch by user ID
        toast({
          title: "Error",
          description: "Failed to load user",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading user...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>User not found</div>
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
              <Link href="/admin/users">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">
                {user.name.first} {user.name.last}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="text-lg font-medium">
                        {user.name.first} {user.name.last}
                      </div>
                    </div>
                    {user.email && (
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                        <div>{user.email}</div>
                        <Badge
                          variant={user.emailVerified ? "default" : "outline"}
                          className="mt-1"
                        >
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    )}
                    {user.phone && (
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </div>
                        <div>{user.phone}</div>
                        <Badge
                          variant={user.phoneVerified ? "default" : "outline"}
                          className="mt-1"
                        >
                          {user.phoneVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Role
                      </div>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {user.addresses && user.addresses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Addresses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {user.addresses.map((address) => (
                        <div key={address._id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {address.firstName} {address.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {address.type}
                                {address.isDefault && (
                                  <Badge variant="outline" className="ml-2">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div>{address.address}</div>
                            {address.apartment && (
                              <div>{address.apartment}</div>
                            )}
                            <div>
                              {address.city}, {address.region}
                            </div>
                            {address.postalCode && (
                              <div>{address.postalCode}</div>
                            )}
                            <div className="mt-1">{address.phone}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Currency
                      </div>
                      <div>{user.preferences.currency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Language
                      </div>
                      <div>{user.preferences.language}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Notifications
                      </div>
                      <div className="space-y-1 mt-1">
                        <Badge
                          variant={
                            user.preferences.notifications.email
                              ? "default"
                              : "outline"
                          }
                        >
                          Email:{" "}
                          {user.preferences.notifications.email ? "On" : "Off"}
                        </Badge>
                        <Badge
                          variant={
                            user.preferences.notifications.sms
                              ? "default"
                              : "outline"
                          }
                          className="ml-2"
                        >
                          SMS:{" "}
                          {user.preferences.notifications.sms ? "On" : "Off"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Member Since
                      </div>
                      <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Last Login
                      </div>
                      <div>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
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
