import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OperationLogService } from './operation_log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { OperationType } from '../entities/operation_log.entity';

@Controller('api/operation-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get()
  @Roles('super_admin', 'admin')
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('operation') operation?: OperationType,
    @Query('module') module?: string,
    @Query('username') username?: string,
  ) {
    return this.operationLogService.findAll(page, pageSize, operation, module, username);
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  async findOne(@Query('id') id: number) {
    return this.operationLogService.findOne(id);
  }
}