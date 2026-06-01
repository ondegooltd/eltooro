import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { SupportTicket, AdminSettings } from "@/lib/models";
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

const addResponseSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().default(false), // Internal notes (admin only)
});

/**
 * POST /api/support/[id]/response - Add response to ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid ticket ID format");
    }

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      throw new NotFoundError("Support ticket");
    }

    const isAdmin = (session.user as any).role === "admin";
    const validatedData = addResponseSchema.parse(body);

    // Check access
    if (
      !isAdmin &&
      (!ticket.userId ||
        ticket.userId.toString() !== session.user.id ||
        ticket.email !== session.user.email)
    ) {
      throw new ForbiddenError("You don't have access to this ticket");
    }

    // Internal notes are admin-only
    if (validatedData.isInternal && !isAdmin) {
      throw new ForbiddenError("Only admins can add internal notes");
    }

    // Add response to ticket
    ticket.responses.push({
      message: validatedData.message,
      isInternal: validatedData.isInternal || false,
      createdAt: new Date(),
      createdBy: session.user.id,
    } as any);

    // Auto-update status if customer responds
    if (!isAdmin && ticket.status !== "open") {
      ticket.status = "open";
    }

    await ticket.save();

    // Send email notification
    if (!validatedData.isInternal) {
      // Get admin settings for support email
      const adminSettings = await AdminSettings.findOne({}).lean();
      const supportEmail =
        adminSettings?.business?.email || "info@toroglo.com";

      // Notify the other party
      const recipientEmail = isAdmin ? ticket.email : supportEmail;

      await addEmailJob("support_ticket_response", {
        email: recipientEmail,
        ticketNumber: ticket.ticketNumber,
        message: validatedData.message,
        isFromAdmin: isAdmin,
        firstName: isAdmin ? ticket.firstName : "Support Team",
      });
    }

    const updatedTicket = ticket.toObject();

    logRequest(
      "POST",
      "/api/support/[id]/response",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(updatedTicket);
  } catch (error) {
    logger.error("Support ticket response failed", error as Error, {
      endpoint: "/api/support/[id]/response",
    });
    logRequest(
      "POST",
      "/api/support/[id]/response",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
