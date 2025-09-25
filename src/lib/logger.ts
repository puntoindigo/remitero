import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  details?: any;
  endpoint?: string;
  userId?: string;
  session?: any;
}

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(entry: LogEntry) {
    const logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(entry) + '\n';
    
    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  error(message: string, details?: any, endpoint?: string, session?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      details,
      endpoint,
      userId: session?.user?.id,
      session: session ? { user: session.user, hasSession: !!session } : null
    };

    console.error(`[ERROR] ${message}`, details);
    this.writeLog(entry);
  }

  warn(message: string, details?: any, endpoint?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      details,
      endpoint
    };

    console.warn(`[WARN] ${message}`, details);
    this.writeLog(entry);
  }

  info(message: string, details?: any, endpoint?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      details,
      endpoint
    };

    console.info(`[INFO] ${message}`, details);
    this.writeLog(entry);
  }

  debug(message: string, details?: any, endpoint?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message,
      details,
      endpoint
    };

    console.debug(`[DEBUG] ${message}`, details);
    this.writeLog(entry);
  }
}

export const logger = new Logger();
