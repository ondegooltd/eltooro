"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(redirectTo || "/login");
      return;
    }

    if (
      requireAdmin &&
      session?.user &&
      (session.user as any).role !== "admin"
    ) {
      router.push("/account");
      return;
    }
  }, [session, status, requireAdmin, router, redirectTo]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-iherb-green" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (requireAdmin && (session?.user as any)?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
