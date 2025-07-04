import { promises as fs } from 'fs';
import path from 'path';

export class FileLogger {
  private logFilePath: string;
  private sessionId: string;
  
  constructor(logType: 'api' | 'client' = 'api') {
    this.sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const logsDir = path.join(process.cwd(), 'logs');
    this.logFilePath = path.join(logsDir, `${logType}-${this.sessionId}.log`);
    
    // Ensure logs directory exists
    this.ensureLogDirectory();
  }
  
  private async ensureLogDirectory() {
    const logsDir = path.dirname(this.logFilePath);
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }
  
  async log(level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      sessionId: this.sessionId
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      await fs.appendFile(this.logFilePath, logLine);
      
      // Also log to console
      const consoleMsg = `[${timestamp}] [${level}] ${message}`;
      if (data) {
        console.log(consoleMsg, data);
      } else {
        console.log(consoleMsg);
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
  
  async logPerformance(phase: string, duration: number, details?: any) {
    await this.log('INFO', `PERFORMANCE: ${phase} completed in ${duration}ms`, details);
  }
  
  async logError(error: any, context: string) {
    await this.log('ERROR', `Error in ${context}`, {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      details: error
    });
  }
  
  async logSummary(summary: any) {
    await this.log('INFO', '=== SESSION SUMMARY ===', summary);
  }
  
  getLogFilePath() {
    return this.logFilePath;
  }
}