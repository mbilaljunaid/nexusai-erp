/**
 * Logger - Phase 8
 * Comprehensive logging and error tracking
 */

export interface LogEntry {
  id: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  endpoint?: string;
  statusCode?: number;
  stackTrace?: string;
}

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100000;
  private logCounter: number = 0;

  /**
   * Log message
   */
  log(
    level: string,
    message: string,
    context?: Record<string, any>,
    userId?: string,
    endpoint?: string
  ): LogEntry {
    const entry: LogEntry = {
      id: `LOG-${Date.now()}-${++this.logCounter}`,
      level: level as any,
      message,
      context,
      timestamp: new Date(),
      userId,
      endpoint,
    };

    this.logs.push(entry);

    // Keep only max logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (level === "error" || level === "fatal") {
      console.error(`[${level.toUpperCase()}] ${message}`, context);
    }

    return entry;
  }

  /**
   * Log error with stack trace
   */
  logError(message: string, error: Error, userId?: string, endpoint?: string): LogEntry {
    const entry: LogEntry = {
      id: `LOG-${Date.now()}-${++this.logCounter}`,
      level: "error",
      message,
      context: { errorMessage: error.message },
      timestamp: new Date(),
      userId,
      endpoint,
      stackTrace: error.stack,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.error(`[ERROR] ${message}`, error);
    return entry;
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: string): LogEntry[] {
    return this.logs.filter((l) => l.level === level);
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string): LogEntry[] {
    return this.logs.filter((l) => l.userId === userId);
  }

  /**
   * Get logs by endpoint
   */
  getLogsByEndpoint(endpoint: string): LogEntry[] {
    return this.logs.filter((l) => l.endpoint === endpoint);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get error count
   */
  getErrorCount(minutes: number = 60): number {
    const cutoff = new Date(Date.now() - minutes * 60000);
    return this.logs.filter((l) => l.level === "error" && l.timestamp > cutoff).length;
  }
}

export const logger = new Logger();
