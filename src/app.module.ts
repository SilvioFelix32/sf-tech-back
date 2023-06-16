import { Module } from '@nestjs/common';
import { CacheInterceptor, CacheModule, CacheStore } from '@nestjs/cache-manager'
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { PrismaService } from './shared/prisma/prisma.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { ProductModule } from './product/modules/product.module';
import { ProductCategoriesModule } from './product-categories/modules/product-categories.module';
import { SalesModule } from './sales/modules/sales.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      store: redisStore as unknown as CacheStore,
      url: 'https://sf-tech-back.vercel.app/v1',
      isGlobal: true
    }),
    HttpModule,
    CompaniesModule,
    UsersModule,
    ProductModule,
    ProductCategoriesModule,
    SalesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule { }
