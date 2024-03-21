import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { PrismaService } from './infraestructure/prisma/prisma.service';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { ProductModule } from './product/modules/product.module';
import { SalesModule } from './sales/modules/sales.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RedisService } from './infraestructure/cache/redis';
import { CategoryModule } from './productCategory/modules/category.module';

@Module({
  controllers: [AppController],
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
  ],
  providers: [
    AppService,
    PrismaService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
