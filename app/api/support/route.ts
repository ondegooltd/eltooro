import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { SupportTicket, AdminSettings } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError, ForbiddenError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";
import { addEmailJob } from "@/lib/jobs/queue";

const createTicketSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  orderNumber: z.string().optional(),
  subject: z.enum([
    "order",
    "shipping",
    "return",
    "product",
    "account",
    "other",
  ]),
  message: z.string().min(10),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  response: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/support - List support tickets
 * - Public: Can only see their own tickets (if authenticated)
 * - Admin: Can see all tickets with filters
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const { searchParams } = new URL(request.url);

    // Try to get user session (optional for public access)
    let userId: string | null = null;
    let isAdmin = false;

    try {
      const session = await requireAuth(request);
      userId = session.user.id;
      isAdmin = (session.user as any).role === "admin";
    } catch {
      // Not authenticated - can only access if ticket ID is provided
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const subject = searchParams.get("subject");
    const ticketId = searchParams.get("id");

    // If ticket ID is provided, return single ticket
    if (ticketId) {
      if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new ValidationError("Invalid ticket ID format");
      }

      const ticket = await SupportTicket.findById(ticketId).lean();

      if (!ticket) {
        throw new ValidationError("Ticket not found");
      }

      // Check access: user can only see their own tickets, admin can see all
      if (!isAdmin && ticket.userId?.toString() !== userId) {
        throw new ForbiddenError("You don't have access to this ticket");
      }

      logRequest(
        "GET",
        "/api/support",
        200,
        Date.now() - startTime,
        userId || undefined
      );
      return successResponse(ticket);
    }

    // Build query
    const query: any = {};

    // Non-admin users can only see their own tickets
    if (!isAdmin) {
      if (!userId) {
        throw new ForbiddenError("Authentication required to view tickets");
      }
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (subject) {
      query.subject = subject;
    }

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query),
    ]);

    logRequest(
      "GET",
      "/api/support",
      200,
      Date.now() - startTime,
      userId || undefined
    );
    return successResponse(tickets, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Support tickets list failed", error as Error, {
      endpoint: "/api/support",
    });
    logRequest(
      "GET",
      "/api/support",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * POST /api/support - Create a new support ticket
 * - Public: Anyone can create a ticket
 * - Authenticated: Links ticket to user account
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const body = await request.json();

    const validatedData = createTicketSchema.parse(body);

    // Try to get user session (optional)
    let userId: string | null = null;
    try {
      const session = await requireAuth(request);
      userId = session.user.id;
    } catch {
      // Guest ticket - no user ID
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    // Create ticket
    const ticket = new SupportTicket({
      ticketNumber,
      userId: userId || null,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      orderNumber: validatedData.orderNumber,
      subject: validatedData.subject,
      message: validatedData.message,
      priority: validatedData.priority,
      status: "open",
      assignedTo: null,
      responses: [],
      tags: [],
      resolvedAt: null,
    });

    await ticket.save();

    // Send confirmation email via background job
    await addEmailJob("support_ticket_created", {
      email: validatedData.email,
      ticketNumber,
      firstName: validatedData.firstName,
      subject: validatedData.subject,
    });

    // Notify admin via email (if configured)
    const adminSettings = await AdminSettings.findOne({}).lean();
    if (adminSettings?.business?.email) {
      await addEmailJob("admin_ticket_notification", {
        email: adminSettings.business.email,
        ticketNumber,
        subject: validatedData.subject,
        priority: validatedData.priority,
        customerEmail: validatedData.email,
      });
    }

    const createdTicket = ticket.toObject();

    logRequest(
      "POST",
      "/api/support",
      201,
      Date.now() - startTime,
      userId?.toString()
    );
    return successResponse(createdTicket, {}, 201);
  } catch (error) {
    logger.error("Support ticket creation failed", error as Error, {
      endpoint: "/api/support",
    });
    logRequest(
      "POST",
      "/api/support",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
