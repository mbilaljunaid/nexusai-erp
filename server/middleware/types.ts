import { Request, Response, NextFunction } from "express";

// Canonical Express type augmentation for the ERP backend.
// All middleware should import from this file instead of declaring their own globals.
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      permissions: string[];
      tenantId: string;
    }
    interface Request {
      user?: User;
      tenantId?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
  tenantId?: string;
}

export type { Request, Response, NextFunction };
