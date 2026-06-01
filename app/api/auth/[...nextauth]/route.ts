import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongodb";
import bcrypt from "bcryptjs";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          logger.warn("NextAuth: No credentials provided");
          return null;
        }

        if (!credentials.password) {
          logger.warn("NextAuth: No password provided");
          return null;
        }

        try {
          await initModels();

          let user: any = null;

          // Try email/password login
          if (credentials.email && credentials.password) {
            const emailToSearch = credentials.email.toLowerCase().trim();
            
            if (process.env.NODE_ENV === "development") {
              logger.debug("NextAuth: Searching for user with email", { email: emailToSearch });
            }

            user = await User.findOne({
              email: emailToSearch,
            }).lean();

            // Also try exact match (case-sensitive) as fallback
            if (!user) {
              user = await User.findOne({
                email: credentials.email.trim(),
              }).lean();
            }

            if (user) {
              if (!user.password) {
                logger.warn("NextAuth: User found but no password set", { userId: user._id });
                return null;
              }
              const passwordHash = String(user.password);
              const password = String(credentials.password);
              const isValid = await bcrypt.compare(password, passwordHash);
              if (!isValid) {
                logger.warn("NextAuth: Invalid password for email login", { email: emailToSearch });
                return null;
              }
            }
          }

          // Try phone/password login
          if (credentials.phone && credentials.password && !user) {
            try {
              // Only normalize if phone is not empty/undefined
              if (!credentials.phone || credentials.phone.trim() === "") {
                // Skip phone login if phone is empty
              } else {
                const normalizedPhone = normalizePhoneNumber(
                  String(credentials.phone)
                );
                
                if (process.env.NODE_ENV === "development") {
                  logger.debug("NextAuth: Searching for user with phone", { phone: normalizedPhone });
                }

                user = await User.findOne({
                  phone: normalizedPhone,
                }).lean();

                if (user) {
                  if (!user.password) {
                    logger.warn("NextAuth: User found but no password set", { userId: user._id });
                    return null;
                  }
                  const passwordHash = String(user.password);
                  const isValid = await bcrypt.compare(
                    String(credentials.password),
                    passwordHash
                  );
                  if (!isValid) {
                    logger.warn("NextAuth: Invalid password for phone login", { phone: normalizedPhone });
                    return null;
                  }
                }
              }
            } catch (phoneError) {
              logger.error("NextAuth: Phone normalization error", phoneError as Error);
              // Continue without phone login if normalization fails
            }
          }

          if (!user) {
            logger.warn("NextAuth: User not found");
            return null;
          }

          // Update lastLogin timestamp
          try {
            await User.findByIdAndUpdate(
              user._id,
              { lastLogin: new Date() },
              { new: false } // Don't return updated doc, just update
            );
          } catch (updateError) {
            // Log but don't fail login if lastLogin update fails
            logger.warn("NextAuth: Failed to update lastLogin", {
              error: updateError instanceof Error ? updateError.message : String(updateError),
              userId: user._id.toString(),
            });
          }

          logger.info("NextAuth: User authenticated successfully", {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
          });

          return {
            id: user._id.toString(),
            email: user.email,
            phone: user.phone,
            name: user.name
              ? `${user.name.first} ${user.name.last}`
              : undefined,
            role: user.role || "customer",
          };
        } catch (error) {
          logger.error("NextAuth: Authorize error", error as Error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "customer";
        token.email = user.email;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "customer";
        if (token.email) session.user.email = token.email;
        if (token.phone) (session.user as any).phone = token.phone;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow same-origin absolute URLs
      if (new URL(url).origin === baseUrl) return url;
      // Fallback to baseUrl
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// NextAuth v4 App Router handler
// For App Router, we need to handle the request properly
async function handler(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
): Promise<NextResponse> {
  try {
    // Resolve params
    const params = await context.params;

    // Call NextAuth - it will handle the request internally
    // NextAuth v4 supports App Router when called this way
    const response = await (NextAuth as any)(req, context, authOptions);
    return response;
  } catch (error) {
    logger.error("NextAuth: Handler error", error as Error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
