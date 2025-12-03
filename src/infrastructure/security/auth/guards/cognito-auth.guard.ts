import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ErrorHandler } from 'src/shared/errors/error-handler';
import { Logger } from 'src/shared/logger/logger.service';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly errorHandler: ErrorHandler,
    private readonly jwtStrategy: JwtStrategy,
    private readonly logger: Logger,
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
      const route = `${request.method} ${request.path}`;

      this.logger.info(
        `CognitoAuthGuard.canActivate() - Validating authentication for route`,
        { metadata: { route } },
      );

      const token = this.extractTokenFromHeader(request);
      if (!token) {
        this.logger.error(
          `CognitoAuthGuard.canActivate() - Token not found in request`,
          { metadata: { route } },
        );
        throw new UnauthorizedException(
          'JwtAuthGuard.canActivate: Token not found',
        );
      }

      const isValid = await this.isTokenValid(token);
      if (isValid) {
        this.logger.info(
          `CognitoAuthGuard.canActivate() - Authentication successful`,
          { metadata: { route } },
        );
      }
      return isValid;
    } catch (error) {
      this.logger.error(
        `CognitoAuthGuard.canActivate() - Authentication failed`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: {
            route: context.switchToHttp().getRequest().path,
            method: context.switchToHttp().getRequest().method,
          },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const isValid = await this.jwtStrategy.validate(token);
      return isValid;
    } catch (error) {
      this.logger.error(
        `CognitoAuthGuard.isTokenValid() - Token validation failed`,
        { error: error instanceof Error ? error : new Error(String(error)) },
      );
      throw this.errorHandler.handle(error);
    }
  }
}
