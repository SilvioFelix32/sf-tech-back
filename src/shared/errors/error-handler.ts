import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  GoneException,
  Injectable,
  HttpException,
} from '@nestjs/common';

@Injectable()
export class ErrorHandler {
  public handle(error: unknown): HttpException {
    if (!(error instanceof Error)) {
      error = new Error(
        String(error) || `Unknown error occurred, Error: ${error}`,
      );
    }

    switch ((error as Error).name) {
      case 'NotFoundException':
        return new NotFoundException(error);
      case 'ConflictException':
        return new ConflictException(error);
      case 'BadRequestException':
        return new BadRequestException(error);
      case 'UnauthorizedException':
        return new UnauthorizedException(error);
      case 'GoneException':
        return new GoneException(error);
      default:
        return new InternalServerErrorException(error);
    }
  }
}
