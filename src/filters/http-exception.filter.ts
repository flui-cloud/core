import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message || exception.message
          : exception.message,
      error:
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).error || 'Error'
          : 'Error',
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
