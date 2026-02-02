import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode || err.status || 500;

    // Default error response
    let errorResponse = {
        status: "error",
        statusCode,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: "fail",
            statusCode: 400,
            message: "Validation Error",
            errors: err.errors,
        });
    }

    // Handle Operational Errors (AppError)
    if (err instanceof AppError) {
        return res.status(statusCode).json(errorResponse);
    }

    // Log unknown errors in production
    if (process.env.NODE_ENV !== "development") {
        console.error("UNKNOWN ERROR:", err);
        errorResponse.message = "Something went wrong";
    }

    res.status(statusCode).json(errorResponse);
};
