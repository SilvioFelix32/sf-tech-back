import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      const message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as { message: string }).message ||
            'An error occurred';

      const cause =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as { error: string }).error || 'Unknown error';

      return response.status(status).json({
        statusCode: status,
        cause,
        message,
      });
    }

    console.error('Unhandled exception:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
