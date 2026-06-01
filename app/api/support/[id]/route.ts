import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { SupportTicket } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";
import { addEmailJob } from "@/lib/jobs/queue";

const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/support/[id] - Get single ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid ticket ID format");
    }

    const ticket = await SupportTicket.findById(id).lean();

    if (!ticket) {
      throw new NotFoundError("Support ticket");
    }

    const isAdmin = (session.user as any).role === "admin";

    // Check access: user can only see their own tickets, admin can see all
    if (
      !isAdmin &&
      (!ticket.userId ||
        ticket.userId.toString() !== session.user.id ||
        ticket.email !== session.user.email)
    ) {
      throw new ForbiddenError("You don't have access to this ticket");
    }

    logRequest(
      "GET",
      "/api/support/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(ticket);
  } catch (error) {
    logger.error("Support ticket detail failed", error as Error, {
      endpoint: "/api/support/[id]",
    });
    logRequest(
      "GET",
      "/api/support/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * PUT /api/support/[id] - Update ticket (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    // Only admins can update tickets
    if ((session.user as any).role !== "admin") {
      throw new ForbiddenError("Only admins can update tickets");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid ticket ID format");
    }

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      throw new NotFoundError("Support ticket");
    }

    const validatedData = updateTicketSchema.parse(body);
    const oldStatus = ticket.status;

    if (validatedData.status) {
      ticket.status = validatedData.status as any;
      if (
        validatedData.status === "resolved" ||
        validatedData.status === "closed"
      ) {
        ticket.resolvedAt = new Date();
      }
    }

    if (validatedData.priority) {
      ticket.priority = validatedData.priority as any;
    }

    if (validatedData.assignedTo !== undefined) {
      ticket.assignedTo = validatedData.assignedTo || null;
    }

    if (validatedData.tags) {
      ticket.tags = validatedData.tags;
    }

    await ticket.save();

    // Send email notification if status changed
    if (validatedData.status && validatedData.status !== oldStatus) {
      await addEmailJob("support_ticket_status_update", {
        email: ticket.email,
        ticketNumber: ticket.ticketNumber,
        status: validatedData.status,
        firstName: ticket.firstName,
      });
    }

    logRequest(
      "PUT",
      "/api/support/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(ticket.toObject());
  } catch (error) {
    logger.error("Support ticket update failed", error as Error, {
      endpoint: "/api/support/[id]",
    });
    logRequest(
      "PUT",
      "/api/support/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
