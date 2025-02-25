import { ErrorHandler } from '../../../src/shared/errors/error-handler';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  GoneException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  it('Should return InternalServerErrorException when input is not an Error', () => {
    const nonErrorInput = 42;
    const result = errorHandler.handle(nonErrorInput);

    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(result.message).toBe('Unknown error occurred, Error: 42');
  });

  it('Should return NotFoundException for NotFoundException', () => {
    const error = new Error('Not found');
    error.name = 'NotFoundException';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(NotFoundException);
  });

  it('Should return ConflictException for ConflictException', () => {
    const error = new Error('Conflict');
    error.name = 'ConflictException';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(ConflictException);
  });

  it('Should return BadRequestException for BadRequestException', () => {
    const error = new Error('Bad request');
    error.name = 'BadRequestException';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(BadRequestException);
  });

  it('Should return UnauthorizedException for UnauthorizedException', () => {
    const error = new Error('Unauthorized');
    error.name = 'UnauthorizedException';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(UnauthorizedException);
  });

  it('Should return GoneException for GoneException', () => {
    const error = new Error('Gone');
    error.name = 'GoneException';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(GoneException);
  });

  it('Should return InternalServerErrorException for unknown errors', () => {
    const error = new Error('Unknown error');
    error.name = 'UnknownError';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(InternalServerErrorException);
  });

  it('Should return InternalServerErrorException for non-Error types', () => {
    const error = 'This is a string, not an Error';
    const result = errorHandler.handle(error);
    expect(result).toBeInstanceOf(InternalServerErrorException);
  });
});
