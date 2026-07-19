import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from '../entities/operation_log.entity';
import { OperationLogService } from './operation_log.service';
import { OperationLogController } from './operation_log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  providers: [OperationLogService],
  controllers: [OperationLogController],
  exports: [OperationLogService],
})
export class OperationLogModule {}