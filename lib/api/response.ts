import { NextResponse } from "next/server";
import { ApiError, ConflictError, ValidationError } from "@/lib/errors/api-error";
import { logger } from "@/lib/logger";

export function successResponse(data: any, meta?: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function errorResponse(error: ApiError) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && {
          details: error.details,
        }),
        ...(error instanceof ValidationError && { field: error.field }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: error.statusCode }
  );
}

export function handleApiError(error: unknown) {
  // Log error for monitoring
  if (error instanceof Error) {
    logger.error("API Error", error);
  } else {
    logger.error("API Error", new Error(String(error)));
  }

  if (error instanceof ApiError) {
    return errorResponse(error);
  }

  // MongoDB duplicate key → 409 with the conflicting field
  if (
    error &&
    typeof error === "object" &&
    (error as any).name === "MongoServerError" &&
    (error as any).code === 11000
  ) {
    const keyValue = (error as any).keyValue ?? {};
    const field = Object.keys(keyValue)[0];
    const message = field
      ? `${field} already in use`
      : "Duplicate value";
    return errorResponse(new ConflictError(message, { field }));
  }

  // Unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}
