import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SalesService } from '../../../../domain/services/sales/sales.service';
import { CreateSaleDto } from '../../../../application/dtos/sales/create-sale.dto';
import { UpdateSaleDto } from '../../../../application/dtos/sales/update-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') sale_id: string) {
    return this.salesService.findOne(sale_id);
  }

  @Patch(':id')
  update(@Param('id') sale_id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(sale_id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') sale_id: string) {
    return this.salesService.remove(sale_id);
  }
}
