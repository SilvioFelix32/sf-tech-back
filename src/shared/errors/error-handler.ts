import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

export class ErrorHandler {
  public handle(error: Error): never {
    switch (error.name) {
      case 'NotFoundException':
        throw new NotFoundException(error.message);
      case 'ConflictException':
        throw new ConflictException(error.message);
      case 'BadRequestException':
        throw new BadRequestException(error.message);
      case 'UnauthorizedException':
        throw new UnauthorizedException(error.message);
      default:
        throw new InternalServerErrorException(error.message);
    }
  }
}
