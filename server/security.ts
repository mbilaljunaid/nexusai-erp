import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Standardized error response format
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Standard error codes
export enum ErrorCode {
  INVALID_INPUT = "INVALID_INPUT",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  CONFLICT = "CONFLICT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CSRF_INVALID = "CSRF_INVALID",
  RATE_LIMIT = "RATE_LIMIT",
}

// Sanitization utility
export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    // Remove potential XSS vectors
    return input
      .replace(/[<>]/g, "")
      .trim()
      .substring(0, 5000); // Cap string length
  }
  if (typeof input === "object" && input !== null) {
    if (Array.isArray(input)) {
      return input.map(sanitizeInput);
    }
    return Object.entries(input).reduce(
      (acc, [key, value]) => {
        acc[key] = sanitizeInput(value);
        return acc;
      },
      {} as Record<string, any>
    );
  }
  return input;
}

// Request validation middleware factory
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        const errors = result.error.flatten();
        return res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: "Request validation failed",
            details: errors.fieldErrors,
            requestId: req.id,
          },
        } as ApiErrorResponse);
      }

      // Attach validated data to request
      (req as any).validatedData = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: "Invalid request format",
          requestId: req.id,
        },
      } as ApiErrorResponse);
    }
  };
}

// Generate request ID for tracing
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Type-safe response helpers
export function successResponse<T>(data: T, req: any): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, any>,
  requestId?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(requestId && { requestId }),
    },
  };
}

// Request ID middleware
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  (req as any).id = generateRequestId();
  res.setHeader("X-Request-Id", (req as any).id);
  next();
}

// Security headers middleware
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

// Safe error handler for routes
export async function handleAsync(
  fn: (req: Request, res: Response) => Promise<void>
) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      const code = error.code || ErrorCode.INTERNAL_ERROR;
      const message = error.message || "Internal server error";
      const statusCode = error.statusCode || 500;

      res.status(statusCode).json(errorResponse(code, message, undefined, (req as any).id));
    }
  };
}
