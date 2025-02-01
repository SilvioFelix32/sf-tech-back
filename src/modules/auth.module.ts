import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../infrasctructure/securty[deprecated]/auth/auth.controller';
import { AuthService } from '../infrasctructure/securty[deprecated]/auth/auth.service';

import { LoginValidationMiddleware } from '../infrasctructure/securty[deprecated]/auth/middlewares/login-validation.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '.';
import { JwtStrategy } from 'src/infrasctructure/security/auth/strategies/jwt.strategy';
import { LocalStrategy } from 'src/infrasctructure/securty[deprecated]/auth/strategies/local.strategy';
import { CacheService } from 'src/domain/services/cache/cache.service';
import { RedisService } from 'src/domain/services/redis/redis.service';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    CacheService,
    RedisService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login');
  }
}
