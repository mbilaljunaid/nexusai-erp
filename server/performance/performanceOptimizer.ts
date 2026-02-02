/**
 * Performance Optimizer - Phase 7
 * Request/response optimization and monitoring
 */

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  timestamp: Date;
  statusCode: number;
  payloadSize: number;
}

export interface PerformanceReport {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowRequests: number;
  totalRequests: number;
  avgPayloadSize: number;
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetric[] = [];
  private slowThreshold: number = 1000; // ms

  /**
   * Record metric
   */
  recordMetric(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    payloadSize: number
  ): void {
    this.metrics.push({
      endpoint,
      method,
      responseTime,
      timestamp: new Date(),
      statusCode,
      payloadSize,
    });

    // Keep only last 10000 metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000);
    }
  }

  /**
   * Compress response payload
   */
  compressPayload(data: any): { compressed: string; originalSize: number; compressedSize: number } {
    const original = JSON.stringify(data);
    const originalSize = original.length;

    // Simple compression (in production would use gzip)
    const compressed = Buffer.from(original).toString("base64");
    const compressedSize = compressed.length;

    return { compressed, originalSize, compressedSize };
  }

  /**
   * Paginate results
   */
  paginate<T>(items: T[], page: number = 1, pageSize: number = 20): { items: T[]; total: number; pages: number } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: items.slice(start, end),
      total: items.length,
      pages: Math.ceil(items.length / pageSize),
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(endpoint?: string, minutes: number = 60): PerformanceReport {
    const cutoff = new Date(Date.now() - minutes * 60000);
    let metrics = this.metrics.filter((m) => m.timestamp > cutoff);

    if (endpoint) {
      metrics = metrics.filter((m) => m.endpoint === endpoint);
    }

    if (metrics.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        slowRequests: 0,
        totalRequests: 0,
        avgPayloadSize: 0,
      };
    }

    const times = metrics.map((m) => m.responseTime).sort((a, b) => a - b);
    const sizes = metrics.map((m) => m.payloadSize);

    return {
      avgResponseTime: times.reduce((a, b) => a + b, 0) / times.length,
      p95ResponseTime: times[Math.floor(times.length * 0.95)],
      p99ResponseTime: times[Math.floor(times.length * 0.99)],
      slowRequests: metrics.filter((m) => m.responseTime > this.slowThreshold).length,
      totalRequests: metrics.length,
      avgPayloadSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
    };
  }

  /**
   * Identify bottlenecks
   */
  identifyBottlenecks(minutes: number = 60): { endpoint: string; avgTime: number }[] {
    const cutoff = new Date(Date.now() - minutes * 60000);
    const recent = this.metrics.filter((m) => m.timestamp > cutoff);

    const grouped: { [key: string]: number[] } = {};
    for (const m of recent) {
      if (!grouped[m.endpoint]) grouped[m.endpoint] = [];
      grouped[m.endpoint].push(m.responseTime);
    }

    return Object.entries(grouped)
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
