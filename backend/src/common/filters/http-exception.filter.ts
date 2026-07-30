import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiError } from '../errors/api-errors';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApiError) {
      response.status(exception.statusCode).json({
        error: exception.errorCode,
        message: exception.message,
        ...(exception.details ? { details: exception.details } : {}),
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      // NestJS ValidationPipe throws BadRequestException with an object payload.
      if (status === HttpStatus.BAD_REQUEST) {
        const message =
          typeof body === 'string'
            ? body
            : Array.isArray((body as any)?.message)
              ? (body as any).message.join('; ')
              : ((body as any)?.message ?? 'Validation failed.');

        response.status(400).json({
          error: 'VALIDATION_ERROR',
          message,
          details: typeof body === 'object' ? body : undefined,
        });
        return;
      }

      response.status(status).json({
        error: 'HTTP_ERROR',
        message: typeof body === 'string' ? body : ((body as any)?.message ?? exception.message),
      });
      return;
    }

    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
    response.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    });
  }
}
