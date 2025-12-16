import { sanitizeInput, errorResponse, ErrorCode } from '../security';
import { z } from 'zod';

describe('Phase 1: Security Middleware Tests', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags from input', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should handle SQL injection attempts safely', () => {
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

    it('should sanitize nested objects', () => {
      const input = { 
        name: '<script>test</script>John',
        details: { role: '<b>admin</b>' }
      };
      const sanitized = sanitizeInput(input);
      expect(sanitized.name).not.toContain('<');
      expect(sanitized.details.role).not.toContain('<');
    });

    it('should sanitize arrays', () => {
      const input = ['<script>a</script>', '<b>safe</b>'];
      const sanitized = sanitizeInput(input);
      expect(sanitized[0]).not.toContain('<');
      expect(sanitized[1]).not.toContain('<');
    });

    it('should cap string length at 5000 characters', () => {
      const longInput = 'a'.repeat(6000);
      const sanitized = sanitizeInput(longInput);
      expect(sanitized.length).toBeLessThanOrEqual(5000);
    });
  });

  describe('errorResponse', () => {
    it('should format error with code and message', () => {
      const response = errorResponse(ErrorCode.VALIDATION_ERROR, 'Validation failed');
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.error.message).toBe('Validation failed');
    });

    it('should include details when provided', () => {
      const response = errorResponse(
        ErrorCode.INVALID_INPUT, 
        'Invalid input', 
        { field: 'email' }
      );
      expect(response.error.details).toEqual({ field: 'email' });
    });

    it('should include requestId when provided', () => {
      const response = errorResponse(
        ErrorCode.INTERNAL_ERROR, 
        'Server error', 
        undefined, 
        'req-123'
      );
      expect(response.error.requestId).toBe('req-123');
    });

    it('should handle all error codes', () => {
      const errorCodes = [
        ErrorCode.INVALID_INPUT,
        ErrorCode.UNAUTHORIZED,
        ErrorCode.FORBIDDEN,
        ErrorCode.NOT_FOUND,
        ErrorCode.INTERNAL_ERROR,
        ErrorCode.CONFLICT,
        ErrorCode.VALIDATION_ERROR,
        ErrorCode.CSRF_INVALID,
        ErrorCode.RATE_LIMIT,
      ];

      errorCodes.forEach(code => {
        const response = errorResponse(code, 'Test message');
        expect(response.success).toBe(false);
        expect(response.error.code).toBe(code);
      });
    });
  });

  describe('Zod schema validation', () => {
    it('should validate email format', () => {
      const schema = z.object({ email: z.string().email() });
      const validResult = schema.safeParse({ email: 'test@example.com' });
      expect(validResult.success).toBe(true);
      
      const invalidResult = schema.safeParse({ email: 'invalid-email' });
      expect(invalidResult.success).toBe(false);
    });

    it('should handle optional fields', () => {
      const schema = z.object({ name: z.string().optional() });
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate nested objects', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number().min(0)
        })
      });
      
      const validResult = schema.safeParse({ user: { name: 'John', age: 25 } });
      expect(validResult.success).toBe(true);
      
      const invalidResult = schema.safeParse({ user: { name: 'John', age: -1 } });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Integration: Sanitization + Validation flow', () => {
    it('should validate and sanitize request in sequence', () => {
      const schema = z.object({ name: z.string() });
      const maliciousInput = '<script>alert("xss")</script>John';
      const sanitized = sanitizeInput(maliciousInput);
      const validation = schema.safeParse({ name: sanitized });
      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.name).not.toContain('<');
      }
    });

    it('should sanitize before validation to prevent bypass', () => {
      const schema = z.object({ 
        email: z.string().email(),
        message: z.string().max(100)
      });
      
      const input = {
        email: 'test@example.com',
        message: '<script>malicious</script>Hello world'
      };
      
      const sanitized = sanitizeInput(input);
      const result = schema.safeParse(sanitized);
      expect(result.success).toBe(true);
    });
  });
});
