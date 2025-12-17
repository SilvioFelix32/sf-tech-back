import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { IsPublic } from 'src/infrastructure/security/auth/decorators/is-public.decorator';
import { CreateAddressStandaloneDto } from '../../../../application/dtos/address/create-address-standalone.dto';
import { UpdateAddressDto } from '../../../../application/dtos/address/update-address.dto';
import { AddressService } from '../../../../domain/services/address/address.service';
import { Address } from '../../../../domain/entities/address/address.entity';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @IsPublic()
  async create(@Body() data: CreateAddressStandaloneDto) {
    return await this.addressService.create(data);
  }

  @Get('user/:user_id')
  @IsPublic()
  async findAll(@Param('user_id') user_id: string): Promise<Address[]> {
    return await this.addressService.findAll(user_id);
  }

  @Get(':id')
  @IsPublic()
  async findOne(@Param('id') address_id: string): Promise<Address> {
    return await this.addressService.findOne(address_id);
  }

  @Patch(':id')
  @IsPublic()
  async update(
    @Param('id') address_id: string,
    @Body() data: UpdateAddressDto,
  ) {
    return await this.addressService.update(address_id, data);
  }

  @Delete(':id')
  @IsPublic()
  async remove(@Param('id') address_id: string) {
    return await this.addressService.remove(address_id);
  }
}

