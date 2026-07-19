import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperationLogService } from './operation_log.service';
import { OperationType } from '../entities/operation_log.entity';
import { Request } from 'express';

interface LogMetadata {
  operation: OperationType;
  module: string;
  description: string;
}

export function LogOperation(metadata: LogMetadata) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('log_operation', metadata, target.constructor, propertyKey);
  };
}

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(private readonly operationLogService: OperationLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const controller = context.getClass();
    const handler = context.getHandler();

    const metadata: LogMetadata = Reflect.getMetadata('log_operation', controller, handler.name);
    if (!metadata) {
      return next.handle();
    }

    const user = (request as any).user;
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: (result) => {
          this.operationLogService.create({
            user_id: user?.id,
            username: user?.username,
            operation: metadata.operation,
            module: metadata.module,
            description: metadata.description,
            params: request.body,
            result: result,
            ip,
            user_agent: userAgent,
          }).catch(() => {});
        },
        error: (error) => {
          this.operationLogService.create({
            user_id: user?.id,
            username: user?.username,
            operation: metadata.operation,
            module: metadata.module,
            description: metadata.description,
            params: request.body,
            result: { error: error.message },
            ip,
            user_agent: userAgent,
            status: 0,
          }).catch(() => {});
        },
      }),
    );
  }
}