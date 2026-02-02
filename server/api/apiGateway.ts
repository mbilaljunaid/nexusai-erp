/**
 * API Gateway - Phase 6
 * Centralized API management, versioning, and documentation
 */

export interface APIRoute {
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  handler: (req: any, res: any) => Promise<void>;
  description: string;
  version: string;
  auth?: boolean;
  rateLimit?: number;
  deprecated?: boolean;
}

export interface APIVersion {
  version: string;
  releaseDate: Date;
  routes: APIRoute[];
  breaking?: boolean;
  deprecations?: string[];
}

export class APIGateway {
  private routes: Map<string, APIRoute> = new Map();
  private versions: Map<string, APIVersion> = new Map();
  private currentVersion: string = "v1";

  /**
   * Register API route
   */
  registerRoute(route: APIRoute): void {
    const key = `${route.method} ${route.path} (${route.version})`;
    this.routes.set(key, route);
  }

  /**
   * Register API version
   */
  registerVersion(version: APIVersion): void {
    this.versions.set(version.version, version);
  }

  /**
   * Set current version
   */
  setCurrentVersion(version: string): void {
    if (this.versions.has(version)) {
      this.currentVersion = version;
    }
  }

  /**
   * Get API documentation
   */
  getDocumentation(): any {
    const docs: any = {
      title: "NexusAIFirst Enterprise API",
      currentVersion: this.currentVersion,
      versions: Array.from(this.versions.values()),
      routes: Array.from(this.routes.values()).map((r) => ({
        path: r.path,
        method: r.method,
        description: r.description,
        version: r.version,
        auth: r.auth,
        rateLimit: r.rateLimit,
        deprecated: r.deprecated,
      })),
      baseURL: "https://api.nexusaifirst.cloud",
      authentication: {
        type: "Bearer Token",
        header: "Authorization: Bearer <token>",
      },
    };

    return docs;
  }

  /**
   * Get routes by version
   */
  getRoutesByVersion(version: string): APIRoute[] {
    return Array.from(this.routes.values()).filter((r) => r.version === version);
  }

  /**
   * Get all active routes
   */
  getActiveRoutes(): APIRoute[] {
    return Array.from(this.routes.values()).filter((r) => !r.deprecated);
  }

  /**
   * Validate request
   */
  validateRequest(method: string, path: string, version: string): { valid: boolean; error?: string } {
    const key = `${method} ${path} (${version})`;
    if (!this.routes.has(key)) {
      return { valid: false, error: `Route not found: ${key}` };
    }
    return { valid: true };
  }
}

export const apiGateway = new APIGateway();
