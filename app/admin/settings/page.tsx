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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AdminSettings {
  deliveryFees: {
    winneba: number;
    mankesim: number;
    accra: number;
    capeCoast: number;
    takoradi: number;
    kumasi: number;
    sunyani: number;
    international: number;
  };
  serviceFees: {
    ghana: number;
    international: number;
  };
  settings: {
    currency: {
      default: string;
      supported: string[];
    };
    freeShippingThreshold: number;
    lowStockThreshold: number;
    orderPrefix: string;
    maintenanceMode: boolean;
    allowGuestCheckout: boolean;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
  };
  payment: {
    paystackPublicKey: string;
    paystackSecretKey: string;
    testMode: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    emailProvider: string;
    smsProvider: string;
  };
  business: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      region: string;
      country: string;
    };
  };
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading settings...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!settings) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Failed to load settings</div>
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
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Admin Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Configure system settings
                </p>
              </div>
              <Button onClick={saveSettings} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="business">Business Info</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Free Shipping Threshold</Label>
                        <Input
                          type="number"
                          value={settings.settings.freeShippingThreshold}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              settings: {
                                ...settings.settings,
                                freeShippingThreshold: parseFloat(
                                  e.target.value
                                ),
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Low Stock Threshold</Label>
                        <Input
                          type="number"
                          value={settings.settings.lowStockThreshold}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              settings: {
                                ...settings.settings,
                                lowStockThreshold: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Temporarily disable the site
                          </p>
                        </div>
                        <Switch
                          checked={settings.settings.maintenanceMode}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              settings: {
                                ...settings.settings,
                                maintenanceMode: checked,
                              },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Guest Checkout</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to checkout without an account
                          </p>
                        </div>
                        <Switch
                          checked={settings.settings.allowGuestCheckout}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              settings: {
                                ...settings.settings,
                                allowGuestCheckout: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Delivery Settings */}
              <TabsContent value="delivery">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Fees</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(settings.deliveryFees).map(
                        ([key, value]) => (
                          <div key={key}>
                            <Label className="capitalize">{key}</Label>
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  deliveryFees: {
                                    ...settings.deliveryFees,
                                    [key]: parseFloat(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Paystack Public Key</Label>
                      <Input
                        type="text"
                        value={settings.payment.paystackPublicKey}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              paystackPublicKey: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Paystack Secret Key</Label>
                      <Input
                        type="password"
                        value={settings.payment.paystackSecretKey}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              paystackSecretKey: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Test Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Use Paystack test environment
                        </p>
                      </div>
                      <Switch
                        checked={settings.payment.testMode}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            payment: {
                              ...settings.payment,
                              testMode: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable email notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailEnabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailEnabled: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable SMS notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsEnabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              smsEnabled: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Info */}
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Business Name</Label>
                      <Input
                        value={settings.business.name}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: {
                              ...settings.business,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={settings.business.email}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              business: {
                                ...settings.business,
                                email: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={settings.business.phone}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              business: {
                                ...settings.business,
                                phone: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        value={settings.business.address.street}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: {
                              ...settings.business,
                              address: {
                                ...settings.business.address,
                                street: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={settings.business.address.city}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              business: {
                                ...settings.business,
                                address: {
                                  ...settings.business.address,
                                  city: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Region</Label>
                        <Input
                          value={settings.business.address.region}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              business: {
                                ...settings.business,
                                address: {
                                  ...settings.business.address,
                                  region: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input
                          value={settings.business.address.country}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              business: {
                                ...settings.business,
                                address: {
                                  ...settings.business.address,
                                  country: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
