"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Loader2,
  ArrowLeft,
  Save,
  Globe,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    currency: "GHS" as "GHS" | "USD",
    language: "en",
  });

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profile");
      const data = await response.json();
      if (data.success && data.data?.preferences) {
        setSettings({
          currency: data.data.preferences.currency || "GHS",
          language: data.data.preferences.language || "en",
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 150);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: settings,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
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

            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Account Settings
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manage your account preferences and settings
              </p>
            </div>

            <div className="bg-card border rounded-lg p-4 sm:p-6 max-w-2xl space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-5 w-5 text-iherb-green" />
                <h2 className="text-xl font-semibold">Preferences</h2>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="currency">Currency</Label>
                  </div>
                  <Select
                    value={settings.currency}
                    onValueChange={(value: "GHS" | "USD") =>
                      setSettings({ ...settings, currency: value })
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS - Ghana Cedi</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Prices will be displayed in your selected currency
                  </p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="language">Language</Label>
                  </div>
                  <Select
                    value={settings.language}
                    onValueChange={(value) =>
                      setSettings({ ...settings, language: value })
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language for the interface
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
