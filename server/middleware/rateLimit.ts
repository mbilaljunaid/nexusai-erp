import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    }
}

const store: RateLimitStore = {};

/**
 * Simple In-Memory Rate Limiter
 * @param windowMs Time window in milliseconds
 * @param max Max requests per window
 */
export const rateLimiter = (windowMs: number, max: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const key = `${req.path}:${ip}`;
        const now = Date.now();

        if (!store[key] || now > store[key].resetTime) {
            store[key] = {
                count: 1,
                resetTime: now + windowMs
            };
            return next();
        }

        store[key].count++;

        if (store[key].count > max) {
            console.warn(`[RateLimit] Blocked request from ${ip} to ${req.path}`);
            return res.status(429).json({
                error: "Too many requests. Please try again later.",
                retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
            });
        }

        next();
    };
};
