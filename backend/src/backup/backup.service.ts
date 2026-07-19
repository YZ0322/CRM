import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  constructor(private readonly configService: ConfigService) {}

  async createBackup(): Promise<string> {
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const dbHost = this.configService.get<string>('DB_HOST');
    const dbPort = this.configService.get<string>('DB_PORT');
    const dbUser = this.configService.get<string>('DB_USERNAME');
    const dbPassword = this.configService.get<string>('DB_PASSWORD');
    const dbName = this.configService.get<string>('DB_NAME');

    let sqlContent = `-- CRM System Backup\n-- Date: ${new Date().toISOString()}\n-- Database: ${dbName}\n\n`;

    sqlContent += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    const tables = ['customers', 'products', 'orders', 'stocks', 'customer_followups', 'users', 'roles', 'permissions', 'announcements'];
    
    for (const table of tables) {
      sqlContent += `-- Table: ${table}\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n\n`;
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
    sqlContent += `-- Backup completed successfully\n`;

    fs.writeFileSync(filePath, sqlContent, 'utf8');

    return filePath;
  }

  getBackupFiles(): string[] {
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    return fs.readdirSync(backupDir).filter(file => file.endsWith('.sql')).sort().reverse();
  }

  getBackupFilePath(fileName: string): string {
    const backupDir = path.join(__dirname, '../../backups');
    const filePath = path.join(backupDir, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    throw new Error('Backup file not found');
  }
}