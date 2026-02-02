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
// Request validation middleware factory with test overload
export function validateRequest(schema: ZodSchema, target?: "body" | "query" | "params"): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export function validateRequest(data: any, schema: ZodSchema): { success: boolean; data?: any; error?: any };
export function validateRequest(arg1: any, arg2?: any): any {
  // Overload: validateRequest(data: any, schema: ZodSchema) - used in tests
  if (arg2 && (typeof arg2.safeParse === 'function' || typeof arg2.safeParseAsync === 'function')) {
    const data = arg1;
    const schema = arg2 as ZodSchema;
    // We'll use synchronous parsing if possible or handle async promise return
    try {
      const result = schema.safeParse(data);
      return result;
    } catch (e) {
      // Fallback or explicit check if schema is strictly async
      // For unit tests in this project, specific schemas are sync.
      return { success: false, error: { flatten: () => ({ fieldErrors: { error: ["Schema validation error"] } }) } };
    }
  }

  // Overload: validateRequest(schema: ZodSchema, target?: string) - used as middleware
  const schema = arg1 as ZodSchema;
  const target = (arg2 || "body") as "body" | "query" | "params";

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req[target]);

      if (!result.success) {
        const errors = result.error.flatten();
        return res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: `Validation failed for ${target}`,
            details: errors.fieldErrors,
            requestId: (req as any).id,
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
          message: `Invalid request format for ${target}`,
          requestId: (req as any).id,
        },
      } as ApiErrorResponse);
    }
  };
}


// Direct validation helper
export async function validateData<T>(schema: ZodSchema<T>, data: any): Promise<{ success: true; data: T } | { success: false; error: any }> {
  const result = await schema.safeParseAsync(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error.flatten() };
  }
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
  code: ErrorCode | string,
  errorOrMessage: any,
  errorTypeOrDetails?: string | Record<string, any>,
  requestIdOrDetails?: string | Record<string, any>
): ApiErrorResponse {
  // Determine actual parameters based on types
  let message: string;
  let details: Record<string, any> | undefined;
  let requestId: string | undefined;

  if (errorOrMessage instanceof Error) {
    message = errorOrMessage.message;
    // errorTypeOrDetails may be a string representing error type
    if (typeof errorTypeOrDetails === 'string') {
      details = { errorType: errorTypeOrDetails };
    } else if (typeof errorTypeOrDetails === 'object') {
      details = errorTypeOrDetails;
    }
    if (typeof requestIdOrDetails === 'string') {
      requestId = requestIdOrDetails;
    } else if (typeof requestIdOrDetails === 'object') {
      details = { ...(details || {}), ...requestIdOrDetails };
    }
  } else {
    // errorOrMessage is a string message
    message = errorOrMessage;
    if (typeof errorTypeOrDetails === 'object') {
      details = errorTypeOrDetails;
    }
    if (typeof requestIdOrDetails === 'string') {
      requestId = requestIdOrDetails;
    } else if (typeof requestIdOrDetails === 'object') {
      details = { ...(details || {}), ...requestIdOrDetails };
    }
  }

  return {
    success: false,
    error: {
      code: code as any,
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
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: ws:;");
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
