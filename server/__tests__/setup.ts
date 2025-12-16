/**
 * Test Setup and Utilities for NexusAIFirst Testing Framework
 * Provides shared test utilities for all test suites
 */

export interface MockRequest {
  body: any;
  headers: any;
  method: string;
  url: string;
}

export interface MockResponse {
  status: number;
  json: any;
  headers: any;
}

/**
 * Mock Zod validation for testing
 */
export const createMockSchema = (validator: (data: any) => boolean) => ({
  parse: (data: any) => {
    if (!validator(data)) throw new Error('Validation failed');
    return data;
  },
  safeParse: (data: any) => ({
    success: validator(data),
    data: validator(data) ? data : null,
    error: validator(data) ? null : new Error('Validation failed'),
  }),
});

/**
 * Generate mock request ID for testing
 */
export const generateMockRequestId = (): string => {
  return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Test data fixtures
 */
export const testFixtures = {
  invoice: {
    invoiceNumber: 'INV-TEST-001',
    customerId: 'CUST-TEST-001',
    amount: '1000.00',
    status: 'draft',
  },
  lead: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    source: 'web',
  },
  user: {
    email: 'testuser@example.com',
    passwordHash: '$2b$10$mock_hash',
    role: 'user',
  },
};

/**
 * Assert helper functions
 */
export const testAssertions = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidUUID: (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid),
  isValidGLCode: (code: string) => /^GL-\d{4}$/.test(code),
};
