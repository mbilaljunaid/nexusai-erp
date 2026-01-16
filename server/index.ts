import "reflect-metadata";
import express, { type Request, Response, NextFunction } from "express";
// Trigger restart for Phase 4 verification (Route Reorder)
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { requestIdMiddleware, securityHeaders } from "./security";
import { errorHandler } from "./middleware/error";
import { auditMiddleware } from "./middleware/audit";
import { initCronJobs } from "./cron/sweeper";

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

// Audit logging for mutations
app.use(auditMiddleware);

// Initialize Cron Jobs (Autonomous Background Tasks)
initCronJobs();

await registerRoutes(httpServer, app);

// Centralized Error Handling
app.use(errorHandler);

// START: NestJS Bridge
try {
  const { NestFactory } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');
  const { AppModule } = await import('../backend/src/app.module');

  // Create standalone NestJS app (Sub-App Strategy)
  // We disable bodyParser because the main app already handles it, 
  // but NestJS might need its own if mounted? Actually, mounted apps usually inherit?
  // Use bodyParser: true for safety, verify later.
  const nestApp = await NestFactory.create(
    AppModule,
    { logger: ['error', 'warn'] }
  );

  // Initialize NestJS (starts the container, resolves dependencies)
  await nestApp.init();

  // Mount the NestJS Express instance into the main app
  // This allows NestJS to handle its routes while sharing the port.
  // We wrap it to only handle /api requests so it doesn't 404 frontend routes.
  const nestHandler = nestApp.getHttpAdapter().getInstance();
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      nestHandler(req, res, next);
    } else {
      next();
    }
  });

  // Enable Global Prefix if needed, but CostController has explicit route
  // await nestApp.setGlobalPrefix('api'); 

  // Initialize (Registers routes) but DOES NOT Listen (we use httpServer below)
  await nestApp.init();
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
  const { setupVite } = await import("./vite");
  await setupVite(httpServer, app);
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

