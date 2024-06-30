import { Module } from '@nestjs/common';
import { SalesService } from '../domain/services/sales/sales.service';
import { SalesController } from '../infrasctructure/http/controllers/sales/sales.controller';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
