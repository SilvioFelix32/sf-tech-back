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

      const message = this.errorMessage(errorResponse);
      const cause = this.errorCause(errorResponse);

      const errorBody = {
        statusCode: status,
        cause,
        message,
      };

      console.error('GlobalExceptionFilter.catch()', errorBody);
      return response.status(status).json(errorBody);
    }

    console.error(
      'GlobalExceptionFilter.catch() - Unhandled exception:',
      exception,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private errorMessage(error: unknown): string {
    return (
      (error as { message: string }).message ||
      (error as Error).message ||
      'An error occurred'
    );
  }

  private errorCause(error: unknown): string {
    const errorName =
      (error as { name?: string; error?: string }).name ||
      (error as { error?: string }).error ||
      'UnknownError';

    const causeMap: Record<string, string> = {
      Unauthorized: 'UnauthorizedException',
      'Not Found': 'NotFoundException',
      NotFound: 'NotFoundException',
      Conflict: 'ConflictException',
      'Bad Request': 'BadRequestException',
      Forbidden: 'ForbiddenException',
      Gone: 'GoneException',
    };

    for (const key in causeMap) {
      if (new RegExp(key, 'i').test(errorName)) {
        return causeMap[key] ?? 'InternalServerErrorException';
      }
    }
    return 'InternalServerErrorException';
  }
}
