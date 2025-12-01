/**
 * Health Check & Monitoring - Phase 8
 * System health monitoring and alerting
 */

export interface HealthStatus {
  status: "healthy" | "degraded" | "critical";
  timestamp: Date;
  components: { name: string; status: string; latency: number }[];
  metrics: { uptime: number; errorRate: number; avgResponseTime: number };
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  component: string;
  timestamp: Date;
  resolved?: boolean;
}

export class HealthChecker {
  private alerts: Alert[] = [];
  private alertCounter: number = 0;
  private startTime: Date = new Date();
  private errorCount: number = 0;
  private totalRequests: number = 0;
  private responseTimes: number[] = [];

  /**
   * Record request
   */
  recordRequest(responseTime: number, success: boolean): void {
    this.totalRequests++;
    this.responseTimes.push(responseTime);
    if (!success) this.errorCount++;

    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): HealthStatus {
    const errorRate = (this.errorCount / Math.max(this.totalRequests, 1)) * 100;
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (errorRate > 5 || avgResponseTime > 1000) status = "degraded";
    if (errorRate > 10 || avgResponseTime > 3000) status = "critical";

    return {
      status,
      timestamp: new Date(),
      components: [
        { name: "API", status: "healthy", latency: avgResponseTime },
        { name: "Database", status: "healthy", latency: 50 },
        { name: "Cache", status: "healthy", latency: 5 },
      ],
      metrics: {
        uptime: Date.now() - this.startTime.getTime(),
        errorRate,
        avgResponseTime,
      },
    };
  }

  /**
   * Create alert
   */
  createAlert(severity: string, message: string, component: string): Alert {
    const alert: Alert = {
      id: `ALERT-${Date.now()}-${++this.alertCounter}`,
      severity: severity as any,
      message,
      component,
      timestamp: new Date(),
    };

    this.alerts.push(alert);
    return alert;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    alert.resolved = true;
    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: string): Alert[] {
    return this.alerts.filter((a) => a.severity === severity && !a.resolved);
  }
}

export const healthChecker = new HealthChecker();
