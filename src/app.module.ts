import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SharedServicesModule } from './modules/shared-services.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CategoryModule, CompaniesModule, ProductModule } from './modules';
import { GlobalExceptionFilter } from './application/exceptions/exceptions-filter';
import { CognitoAuthGuard } from './infrastructure/security/auth/guards/cognito-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/security/auth/strategies/jwt.strategy';

@Module({
  controllers: [],
  exports: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    CompaniesModule,
    CategoryModule,
    ProductModule,
    SharedServicesModule,
  ],
  providers: [
    JwtStrategy,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: CognitoAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
