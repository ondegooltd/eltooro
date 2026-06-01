// Structured logging utility

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;

    const logObj = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    return JSON.stringify(logObj);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }

    // In production, send to logging service (Sentry, Datadog, etc.)
    if (process.env.NODE_ENV === "production" && level === LogLevel.ERROR) {
      // Send to error tracking service
      this.sendToErrorTracking(entry);
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // Integrate with Sentry, Datadog, or other error tracking service
    if (process.env.SENTRY_DSN) {
      // Example: Sentry.captureException(entry.error || new Error(entry.message), { extra: entry.context });
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
}

export const logger = new Logger();

/**
 * Request logger middleware helper
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string,
  ip?: string
): void {
  logger.info("API Request", {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    userId,
    ip,
  });
}

/**
 * Error logger helper
 */
export function logError(error: Error, context?: Record<string, any>): void {
  logger.error("Error occurred", error, context);
}
