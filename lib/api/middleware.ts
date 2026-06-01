import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors/api-error";
import { errorResponse } from "@/lib/api/response";
import { getToken } from "next-auth/jwt";

export async function requireAuth(request: NextRequest) {
  // For NextAuth v4 with App Router, we use getToken from next-auth/jwt
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.sub) {
    throw new UnauthorizedError("Authentication required");
  }

  // Return a session-like object
  return {
    user: {
      id: token.sub,
      email: token.email,
      role: token.role || "customer",
    },
    token,
  };
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request);
  if ((session.user as any).role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error as any);
    }
  };
}
