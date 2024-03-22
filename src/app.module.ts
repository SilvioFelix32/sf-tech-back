import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { SharedServicesModule } from './shared/infraestructure/shared-services.module';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthModule,
  CategoryModule,
  CompaniesModule,
  ProductModule,
  SalesModule,
  UsersModule,
} from './application';
import { JwtAuthGuard } from './application/auth/guards/jwt-auth.guard';

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
  ],
})
export class AppModule {}
