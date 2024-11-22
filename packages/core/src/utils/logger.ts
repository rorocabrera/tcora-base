// packages/core/src/utils/logger.ts
import chalk from 'chalk';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LoggerOptions {
  level?: LogLevel;
  enableTimestamp?: boolean;
  enableColors?: boolean;
}

export class Logger {
  private context: string;
  private level: LogLevel;
  private enableTimestamp: boolean;
  private enableColors: boolean;

  constructor(context: string, options: LoggerOptions = {}) {
    this.context = context;
    this.level = options.level ?? LogLevel.INFO;
    this.enableTimestamp = options.enableTimestamp ?? true;
    this.enableColors = options.enableColors ?? true;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
    const contextStr = this.context ? `[${this.context}]` : '';
    const argsStr = args.length ? this.formatArgs(args) : '';

    if (this.enableColors) {
      const timestampStr = chalk.gray(timestamp);
      const levelColor = this.getLevelColor(level);
      return `${timestampStr} ${levelColor(level.padEnd(5))} ${chalk.cyan(contextStr)} ${message} ${chalk.gray(argsStr)}`.trim();
    }

    return `${timestamp} ${level.padEnd(5)} ${contextStr} ${message} ${argsStr}`.trim();
  }

  private formatArgs(args: any[]): string {
    return args.map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (error) {
          return arg.toString();
        }
      }
      return arg;
    }).join(' ');
  }

  private getLevelColor(level: string): chalk.ChalkFunction {
    switch (level) {
      case 'ERROR':
        return chalk.red;
      case 'WARN':
        return chalk.yellow;
      case 'INFO':
        return chalk.green;
      case 'DEBUG':
        return chalk.blue;
      default:
        return chalk.white;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, ...args));
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }
}

// Singleton instance for global logging configuration
export class GlobalLogger {
  private static instance: GlobalLogger;
  private defaultOptions: LoggerOptions = {
    level: LogLevel.INFO,
    enableTimestamp: true,
    enableColors: true,
  };

  private constructor() {}

  static getInstance(): GlobalLogger {
    if (!GlobalLogger.instance) {
      GlobalLogger.instance = new GlobalLogger();
    }
    return GlobalLogger.instance;
  }

  setDefaultOptions(options: Partial<LoggerOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  createLogger(context: string, options?: LoggerOptions): Logger {
    return new Logger(context, { ...this.defaultOptions, ...options });
  }
}

// Create helper function for easy logger creation
export function createLogger(context: string, options?: LoggerOptions): Logger {
  return GlobalLogger.getInstance().createLogger(context, options);
}