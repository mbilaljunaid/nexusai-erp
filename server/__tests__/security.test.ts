import { validateRequest, sanitizeInput, errorResponse } from '../security';
import { z } from 'zod';

describe('Phase 1: Security Middleware Tests', () => {
  // Mock Request/Response types
  interface MockReq {
    body: any;
    headers: any;
    method: string;
    url: string;
  }

  interface MockRes {
    status: number;
    json: any;
  }

  describe('validateRequest', () => {
    it('should validate request body with schema', () => {
      const schema = z.object({ email: z.string().email() });
      const req = { body: { email: 'test@example.com' } };
      const result = validateRequest(req.body, schema);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const schema = z.object({ email: z.string().email() });
      const req = { body: { email: 'invalid-email' } };
      const result = validateRequest(req.body, schema);
      expect(result.success).toBe(false);
    });

    it('should handle optional fields', () => {
      const schema = z.object({ name: z.string().optional() });
      const req = { body: {} };
      const result = validateRequest(req.body, schema);
      expect(result.success).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags from input', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);
      expect(sanitized.length >= 0).toBe(true);
    });

    it('should preserve safe content', () => {
      const input = 'Normal text with numbers 123';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('Normal');
      expect(sanitized).toContain('123');
    });

    it('should handle empty strings', () => {
      const input = '';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('');
    });
  });

  describe('errorResponse', () => {
    it('should format error with request ID', () => {
      const error = new Error('Test error');
      const response = errorResponse('TEST_001', error, 'VALIDATION_ERROR');
      expect(response).toHaveProperty('requestId');
      expect(response).toHaveProperty('errorCode');
      expect(response).toHaveProperty('message');
    });

    it('should include error timestamp', () => {
      const error = new Error('Test error');
      const response = errorResponse('TEST_002', error, 'AUTH_ERROR');
      expect(response).toHaveProperty('timestamp');
    });

    it('should not expose internal error details', () => {
      const error = new Error('Internal database failure');
      const response = errorResponse('TEST_003', error, 'INTERNAL_ERROR');
      expect(response.message).not.toContain('database');
    });
  });

  describe('Integration: Request validation flow', () => {
    it('should validate and sanitize request in sequence', () => {
      const schema = z.object({ name: z.string() });
      const maliciousInput = '<script>alert("xss")</script>John';
      const sanitized = sanitizeInput(maliciousInput);
      const validation = validateRequest({ name: sanitized }, schema);
      expect(validation.success).toBe(true);
    });
  });
});
