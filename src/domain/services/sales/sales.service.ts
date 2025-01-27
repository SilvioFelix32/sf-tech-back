import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from '../../../application/dtos/sales/create-sale.dto';
import { UpdateSaleDto } from '../../../application/dtos/sales/update-sale.dto';

@Injectable()
export class SalesService {
  create(createSaleDto: CreateSaleDto) {
    console.info(createSaleDto);
    return 'This action adds a new sale';
  }

  findAll() {
    return `This action returns all sales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sale`;
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    console.info(updateSaleDto);
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
