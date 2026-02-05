import "reflect-metadata";
import express, { type Request, Response, NextFunction } from "express";
// Trigger restart for Phase 4 verification (Route Reorder)
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { requestIdMiddleware, securityHeaders } from "./security";
import { errorHandler } from "./middleware/error";
import { auditMiddleware } from "./middleware/audit";
import { rlsMiddleware } from "./middleware/rls";
import { initCronJobs } from "./cron/sweeper";
import { JobRunnerService } from "./services/JobRunnerService";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
    id?: string;
  }
}

// Security headers first
app.use(securityHeaders);

// Request ID tracking
app.use(requestIdMiddleware);

// JSON parsing with size limits
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
    limit: "10mb",
  }),
);

// URL-encoded with size limits
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Structured logging (console.log only in development)
export function log(message: string, source = "express") {
  if (process.env.NODE_ENV === "development") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Tenant Context
import { tenantContext } from "./middleware/tenant";
app.use(tenantContext);

// Audit logging for mutations
app.use(auditMiddleware);

// RLS / Security Context (Mock Auth)
app.use(rlsMiddleware);

// Initialize Cron Jobs (Autonomous Background Tasks)
// initCronJobs();
// JobRunnerService.start();

console.log("DEBUG: NODE_ENV =", process.env.NODE_ENV);

app.use((req, res, next) => {
  console.log(`DEBUG: Request ${req.method} ${req.url} - Before registerRoutes`);
  next();
});

await registerRoutes(httpServer, app);

app.use((req, res, next) => {
  console.log(`DEBUG: Request ${req.method} ${req.url} - After registerRoutes`);
  next();
});

// Centralized Error Handling
app.use(errorHandler);

try {
  log('Starting NestJS Bridge...');
  const { NestFactory } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');
  const { AppModule } = await import('../backend/src/app.module');

  const nestApp = await NestFactory.create(
    AppModule,
    { logger: ['error', 'warn', 'log', 'debug', 'verbose'] }
  );

  // Initialize NestJS (starts the container, resolves dependencies)
  log('Initializing NestJS container...');
  await nestApp.init();

  // Mount the NestJS Express instance into the main app
  const nestHandler = nestApp.getHttpAdapter().getInstance();
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      nestHandler(req, res, next);
    } else {
      next();
    }
  });

  log('NestJS Bridge Initialized');
} catch (err) {
  console.error('Failed to initialize NestJS Bridge:', err);
}
// END: NestJS Bridge

// importantly only setup vite in development and after
// setting up all the other routes so the catch-all route
// doesn't interfere with the other routes
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  log('Starting Vite setup...');
  const { setupVite } = await import("./vite");
  await setupVite(httpServer, app);
  log('Vite setup completed');
}

// ALWAYS serve the app on the port specified in the environment variable PORT
// Other ports are firewalled. Default to 5000 if not specified.
// this serves both the API and the client.
// It is the only port that is not firewalled.
const port = parseInt(process.env.PORT || "5001", 10);
httpServer.listen(
  {
    port,
    host: "0.0.0.0",
  },
  () => {
    log(`serving on port ${port}`);
  },
);

