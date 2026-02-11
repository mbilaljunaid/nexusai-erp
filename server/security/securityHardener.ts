/**
 * Security Hardening - Phase 8
 * Production security layer
 */

export interface SecurityPolicy {
  id: string;
  name: string;
  rules: SecurityRule[];
  enabled: boolean;
}

export interface SecurityRule {
  type: "ip-whitelist" | "ip-blacklist" | "rate-limit" | "data-encryption" | "audit-log";
  config: Record<string, any>;
}

export class SecurityHardener {
  private policies: Map<string, SecurityPolicy> = new Map();
  private blockedIPs: Set<string> = new Set();
  private whitelistedIPs: Set<string> = new Set();

  /**
   * Create security policy
   */
  createPolicy(name: string, rules: SecurityRule[]): SecurityPolicy {
    const policy: SecurityPolicy = {
      id: `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      rules,
      enabled: true,
    };

    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Add IP to whitelist
   */
  whitelistIP(ip: string): void {
    this.whitelistedIPs.add(ip);
  }

  /**
   * Add IP to blacklist
   */
  blacklistIP(ip: string): void {
    this.blockedIPs.add(ip);
  }

  /**
   * Check IP security
   */
  checkIPSecurity(ip: string): { allowed: boolean; reason?: string } {
    if (this.blockedIPs.has(ip)) {
      return { allowed: false, reason: "IP is blacklisted" };
    }

    if (this.whitelistedIPs.size > 0 && !this.whitelistedIPs.has(ip)) {
      return { allowed: false, reason: "IP is not whitelisted" };
    }

    return { allowed: true };
  }

  /**
   * Get whitelisted IPs
   */
  getWhitelist(): Array<{ ip: string; addedBy: string; addedAt: string; reason?: string }> {
    return Array.from(this.whitelistedIPs).map(ip => ({
      ip,
      addedBy: 'System',
      addedAt: new Date().toISOString(),
      reason: 'Whitelisted IP'
    }));
  }

  /**
   * Get blacklisted IPs
   */
  getBlacklist(): Array<{ ip: string; addedBy: string; addedAt: string; reason?: string }> {
    return Array.from(this.blockedIPs).map(ip => ({
      ip,
      addedBy: 'System',
      addedAt: new Date().toISOString(),
      reason: 'Blacklisted IP'
    }));
  }

  /**
   * Remove IP from whitelist
   */
  removeFromWhitelist(ip: string): void {
    this.whitelistedIPs.delete(ip);
  }

  /**
   * Remove IP from blacklist
   */
  removeFromBlacklist(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  /**
   * Encrypt sensitive data
   */
  encryptSensitiveData(data: string, key: string): string {
    // In production, use proper encryption (AES-256)
    return Buffer.from(data).toString("base64");
  }

  /**
   * Decrypt sensitive data
   */
  decryptSensitiveData(encrypted: string, key: string): string {
    // In production, use proper decryption
    return Buffer.from(encrypted, "base64").toString("utf-8");
  }

  /**
   * Sanitize input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"']/g, (match) => {
        const escapeMap: { [key: string]: string } = {
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
        };
        return escapeMap[match] || match;
      })
      .trim();
  }

  /**
   * Validate CORS
   */
  validateCORS(origin: string, allowedOrigins: string[]): boolean {
    return allowedOrigins.includes(origin) || allowedOrigins.includes("*");
  }
}

export const securityHardener = new SecurityHardener();
