import { Controller, Get, Post, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('备份管理')
@Controller('api/backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  async createBackup() {
    const filePath = await this.backupService.createBackup();
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
    return {
      success: true,
      message: '备份创建成功',
      fileName,
      filePath,
      downloadUrl: `/api/backup/download/${fileName}`,
    };
  }

  @Get('list')
  getBackupList() {
    const files = this.backupService.getBackupFiles();
    return {
      success: true,
      data: files,
    };
  }

  @Get('download/:fileName')
  downloadBackup(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const filePath = this.backupService.getBackupFilePath(fileName);
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      fileStream.pipe(res);
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}