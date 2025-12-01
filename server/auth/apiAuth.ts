/**
 * API Authentication & Rate Limiting - Phase 6
 * Secure API access with tokens and rate limiting
 */

export interface APIKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  permissions: string[];
  rateLimit: number; // requests per minute
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
}

export interface RateLimitBucket {
  keyId: string;
  requests: number;
  resetAt: Date;
}

export class APIAuthManager {
  private keys: Map<string, APIKey> = new Map();
  private rateLimitBuckets: Map<string, RateLimitBucket> = new Map();

  /**
   * Generate API key
   */
  generateAPIKey(
    userId: string,
    name: string,
    permissions: string[] = [],
    expiresAt?: Date
  ): APIKey {
    const key: APIKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key: this.generateSecureKey(),
      name,
      userId,
      permissions,
      rateLimit: 1000,
      createdAt: new Date(),
      expiresAt,
      active: true,
    };

    this.keys.set(key.key, key);
    return key;
  }

  /**
   * Validate API key
   */
  validateAPIKey(keyString: string): { valid: boolean; key?: APIKey; error?: string } {
    const key = this.keys.get(keyString);

    if (!key) {
      return { valid: false, error: "Invalid API key" };
    }

    if (!key.active) {
      return { valid: false, error: "API key is inactive" };
    }

    if (key.expiresAt && new Date() > key.expiresAt) {
      return { valid: false, error: "API key has expired" };
    }

    return { valid: true, key };
  }

  /**
   * Check rate limit
   */
  checkRateLimit(keyId: string, rateLimit: number): { allowed: boolean; remaining?: number } {
    const now = new Date();
    let bucket = this.rateLimitBuckets.get(keyId);

    // Create new bucket if doesn't exist or expired
    if (!bucket || bucket.resetAt < now) {
      bucket = {
        keyId,
        requests: 0,
        resetAt: new Date(now.getTime() + 60 * 1000), // Reset every minute
      };
      this.rateLimitBuckets.set(keyId, bucket);
    }

    if (bucket.requests >= rateLimit) {
      return { allowed: false };
    }

    bucket.requests++;
    return { allowed: true, remaining: rateLimit - bucket.requests };
  }

  /**
   * Revoke API key
   */
  revokeAPIKey(keyString: string): boolean {
    const key = this.keys.get(keyString);
    if (!key) return false;
    key.active = false;
    return true;
  }

  /**
   * Get user's API keys
   */
  getUserAPIKeys(userId: string): APIKey[] {
    return Array.from(this.keys.values()).filter((k) => k.userId === userId);
  }

  /**
   * Check permission
   */
  hasPermission(key: APIKey, requiredPermission: string): boolean {
    return key.permissions.length === 0 || key.permissions.includes("*") || key.permissions.includes(requiredPermission);
  }

  /**
   * Generate secure key
   */
  private generateSecureKey(): string {
    return `sk_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;
  }
}

export const apiAuthManager = new APIAuthManager();
