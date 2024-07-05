import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../infrasctructure/security/auth/auth.controller';
import { AuthService } from '../infrasctructure/security/auth/auth.service';
import { JwtStrategy } from '../infrasctructure/security/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../infrasctructure/security/auth/strategies/local.strategy';
import { LoginValidationMiddleware } from '../infrasctructure/security/auth/middlewares/login-validation.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '.';

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
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login');
  }
}
