import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.getResponse() as { message: string } | string;

    response.status(status).json({
      code: status,
      message: typeof message === 'string' ? message : message.message || '请求失败',
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
}