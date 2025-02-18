import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ErrorHandler } from 'src/shared/errors/error-handler';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly errorHandler: ErrorHandler,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const request = context.switchToHttp().getRequest();

      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException(
          'JwtAuthGuard.canActivate: Token not found',
        );
      }

      return await this.isTokenValid(token);
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isTokenValid(token: string): Promise<boolean> {
    try {
      return this.jwtStrategy.validate(token);
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }
}
