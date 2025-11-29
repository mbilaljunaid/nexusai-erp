import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventsService } from '../../modules/events/events.service';

@Injectable()
export class EventsMiddleware implements NestMiddleware {
  constructor(private eventsService: EventsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    (req as any).startTime = Date.now();
    
    // Log request completion
    const originalSend = res.send.bind(res);
    res.send = function (data: any) {
      if (req.tenantId && res.statusCode < 400) {
        const duration = Date.now() - ((req as any).startTime || 0);
        console.log(`[Event] HTTP request completed: ${req.method} ${req.path} (${duration}ms)`);
      }
      return originalSend(data);
    };

    next();
  }
}
