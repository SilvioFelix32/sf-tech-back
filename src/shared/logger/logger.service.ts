import { Injectable } from '@nestjs/common';

export type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'log';

export interface LoggerContext {
  error?: Error;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class Logger {
  public info(message: string, context?: LoggerContext): void {
    this.writeLog('info', message, context);
  }

  public error(message: string, context?: LoggerContext): void {
    this.writeLog('error', message, context);
  }

  public warn(message: string, context?: LoggerContext): void {
    this.writeLog('warn', message, context);
  }

  public debug(message: string, context?: LoggerContext): void {
    this.writeLog('debug', message, context);
  }

  public log(message: string, context?: LoggerContext): void {
    this.writeLog('log', message, context);
  }

  private writeLog(level: LogLevel, message: string, context?: LoggerContext): void {
    const timestamp = new Date().toISOString();
    const logEntry: Record<string, unknown> = {
      timestamp,
      level,
      message,
    };

    if (context?.error) {
      logEntry.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack,
      };
    }

    if (context?.metadata) {
      logEntry.metadata = context.metadata;
    }

    const formattedMessage = this.formatMessage(timestamp, level, message);

    switch (level) {
      case 'error':
        console.error(formattedMessage, logEntry);
        break;
      case 'warn':
        console.warn(formattedMessage, logEntry);
        break;
      case 'debug':
        console.debug(formattedMessage, logEntry);
        break;
      case 'info':
        console.info(formattedMessage, logEntry);
        break;
      default:
        console.log(formattedMessage, logEntry);
    }
  }

  private formatMessage(timestamp: string, level: LogLevel, message: string): string {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }
}

