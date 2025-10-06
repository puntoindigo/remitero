import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface LogEntry {
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    // En Vercel, usamos /tmp para archivos temporales
    this.logDir = process.env.NODE_ENV === 'production' ? '/tmp' : './logs';
    this.logFile = join(this.logDir, 'user-actions.log');
    
    // Crear directorio si no existe
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const details = entry.details ? ` | ${entry.details}` : '';
    const resourceId = entry.resourceId ? ` (ID: ${entry.resourceId})` : '';
    const ip = entry.ip ? ` | IP: ${entry.ip}` : '';
    
    return `[${entry.timestamp}] ${entry.userName} (${entry.userEmail}) [${entry.userRole}] - ${entry.action} ${entry.resource}${resourceId}${details}${ip}`;
  }

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    const logLine = this.formatLogEntry(logEntry);
    
    try {
      appendFileSync(this.logFile, logLine + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  // Métodos específicos para diferentes acciones
  logLogin(user: { id: string; email: string; name: string; role: string }, ip?: string, userAgent?: string): void {
    this.log({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      resource: 'Sistema',
      ip,
      userAgent
    });
  }

  logLogout(user: { id: string; email: string; name: string; role: string }, ip?: string): void {
    this.log({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'LOGOUT',
      resource: 'Sistema',
      ip
    });
  }

  logCreate(user: { id: string; email: string; name: string; role: string }, resource: string, resourceId: string, details?: string): void {
    this.log({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE',
      resource,
      resourceId,
      details
    });
  }

  logUpdate(user: { id: string; email: string; name: string; role: string }, resource: string, resourceId: string, details?: string): void {
    this.log({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE',
      resource,
      resourceId,
      details
    });
  }

  logDelete(user: { id: string; email: string; name: string; role: string }, resource: string, resourceId: string, details?: string): void {
    this.log({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'DELETE',
      resource,
      resourceId,
      details
    });
  }

  logImpersonation(admin: { id: string; email: string; name: string; role: string }, targetUser: { id: string; email: string; name: string }): void {
    this.log({
      userId: admin.id,
      userEmail: admin.email,
      userName: admin.name,
      userRole: admin.role,
      action: 'IMPERSONATION_START',
      resource: 'Usuario',
      resourceId: targetUser.id,
      details: `Impersonando a ${targetUser.name} (${targetUser.email})`
    });
  }

  logImpersonationEnd(admin: { id: string; email: string; name: string; role: string }, targetUser: { id: string; email: string; name: string }): void {
    this.log({
      userId: admin.id,
      userEmail: admin.email,
      userName: admin.name,
      userRole: admin.role,
      action: 'IMPERSONATION_END',
      resource: 'Usuario',
      resourceId: targetUser.id,
      details: `Terminó impersonación de ${targetUser.name} (${targetUser.email})`
    });
  }

  // Método para obtener los logs (solo para superadmin)
  getLogs(): string {
    try {
      if (existsSync(this.logFile)) {
        return require('fs').readFileSync(this.logFile, 'utf8');
      }
      return 'No hay logs disponibles.';
    } catch (error) {
      console.error('Error reading log file:', error);
      return 'Error al leer los logs.';
    }
  }

  // Método para limpiar logs antiguos (mantener solo últimos 1000 registros)
  cleanOldLogs(): void {
    try {
      if (existsSync(this.logFile)) {
        const content = require('fs').readFileSync(this.logFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length > 1000) {
          const recentLines = lines.slice(-1000);
          writeFileSync(this.logFile, recentLines.join('\n') + '\n');
        }
      }
    } catch (error) {
      console.error('Error cleaning logs:', error);
    }
  }
}

export const logger = new Logger();
