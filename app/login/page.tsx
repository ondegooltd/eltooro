"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoginForm } from "@/components/login-form";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if already logged in
    if (status === "authenticated" && session) {
      const isAdmin = (session.user as any)?.role === "admin";
      router.push(isAdmin ? "/admin/dashboard" : "/account");
      return;
    }

    // Show message from query params
    const message = searchParams.get("message");
    if (message) {
      toast({
        title: "Info",
        description: message,
      });
    }
  }, [session, status, router, searchParams, toast]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
