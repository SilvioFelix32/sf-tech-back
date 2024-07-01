import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { SharedServicesModule } from './modules/shared-services.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './infrasctructure/security/auth/guards/jwt-auth.guard';

import {
  CategoryModule,
  CompaniesModule,
  ProductModule,
  SalesModule,
  UsersModule,
} from './modules';
import { AuthModule } from './infrasctructure/security/auth/auth.module';
import { GlobalExceptionFilter } from './application/exceptions/exceptions-filter';

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
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
