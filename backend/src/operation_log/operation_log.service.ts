import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog, OperationType } from '../entities/operation_log.entity';

interface CreateLogDto {
  user_id?: number;
  username?: string;
  operation: OperationType;
  module: string;
  description: string;
  params?: any;
  result?: any;
  ip?: string;
  user_agent?: string;
  status?: number;
}

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private operationLogRepository: Repository<OperationLog>,
  ) {}

  async create(dto: CreateLogDto) {
    const data: Partial<OperationLog> = {
      operation: dto.operation,
      module: dto.module,
      description: dto.description,
    };

    if (dto.user_id !== undefined) data.user_id = dto.user_id;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.params !== undefined) data.params = JSON.stringify(dto.params);
    if (dto.result !== undefined) data.result = JSON.stringify(dto.result);
    if (dto.ip !== undefined) data.ip = dto.ip;
    if (dto.user_agent !== undefined) data.user_agent = dto.user_agent;
    if (dto.status !== undefined) data.status = dto.status;

    const log = this.operationLogRepository.create(data);
    return this.operationLogRepository.save(log);
  }

  async findAll(page: number = 1, pageSize: number = 10, operation?: OperationType, module?: string, username?: string) {
    const query = this.operationLogRepository.createQueryBuilder('log');

    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (operation) {
      conditions.push('log.operation = :operation');
      params.operation = operation;
    }

    if (module) {
      conditions.push('log.module LIKE :module');
      params.module = `%${module}%`;
    }

    if (username) {
      conditions.push('log.username LIKE :username');
      params.username = `%${username}%`;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), params);
    }

    query.orderBy('log.created_at', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    return this.operationLogRepository.findOne({ where: { id } });
  }
}