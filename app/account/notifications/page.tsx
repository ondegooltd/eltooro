"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Loader2,
  ArrowLeft,
  Save,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
  });

  useEffect(() => {
    if (session) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profile");
      const data = await response.json();
      if (data.success && data.data?.preferences?.notifications) {
        setPreferences({
          email: data.data.preferences.notifications.email ?? true,
          sms: data.data.preferences.notifications.sms ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
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
          preferences: {
            notifications: preferences,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update preferences",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
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
                Notification Preferences
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Choose how you want to receive updates from us
              </p>
            </div>

            <div className="bg-card border rounded-lg p-4 sm:p-6 max-w-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-iherb-green" />
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive order updates, promotions, and newsletters via
                        email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email"
                    checked={preferences.email}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-iherb-green" />
                    <div>
                      <Label
                        htmlFor="sms"
                        className="text-base font-semibold cursor-pointer"
                      >
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive order updates and important alerts via SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="sms"
                    checked={preferences.sms}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, sms: checked })
                    }
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
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
