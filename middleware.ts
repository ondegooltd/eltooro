import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = (token as any)?.role === "admin";
    const pathname = req.nextUrl.pathname;

    // Redirect admin users to dashboard if they try to access account page
    if (pathname.startsWith("/account") && isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Redirect non-admin users to account if they try to access admin pages
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/account", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require auth
        const publicRoutes = [
          "/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-otp",
          "/products",
          "/product",
          "/cart",
          "/wishlist",
          "/contact",
          "/about",
          "/privacy",
          "/terms",
          "/shipping",
          "/returns",
          "/help",
          "/blog",
        ];

        // Check if route is public
        if (
          publicRoutes.some(
            (route) => pathname === route || pathname.startsWith(route + "/")
          )
        ) {
          return true;
        }

        // Protected routes require auth
        if (
          pathname.startsWith("/account") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/checkout") ||
          pathname.startsWith("/orders")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
  ],
};
