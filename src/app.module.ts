import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { SharedServicesModule } from './modules/shared-services.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  CategoryModule,
  CompaniesModule,
  ProductModule,
  SalesModule,
  UsersModule,
} from './modules';
import { AuthModule } from './modules/auth.module';
import { GlobalExceptionFilter } from './application/exceptions/exceptions-filter';
import { CognitoAuthGuard } from './infrasctructure/security/auth/guards/cognito-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './infrasctructure/security/auth/strategies/jwt.strategy';

@Module({
  controllers: [AppController],
  exports: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    CompaniesModule,
    UsersModule,
    CategoryModule,
    ProductModule,
    SalesModule,
    AuthModule,
    SharedServicesModule,
  ],
  providers: [
    AppService,
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
