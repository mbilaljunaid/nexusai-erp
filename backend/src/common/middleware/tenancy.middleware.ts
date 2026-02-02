import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      userId?: string;
      userRole?: string;
    }
  }
}

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from header, subdomain, or JWT claims
    const tenantId = req.headers['x-tenant-id'] as string || 
                    req.get('host')?.split('.')[0] ||
                    req.query.tenantId as string;

    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  }
}
