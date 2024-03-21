import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import { IHeaders } from '../../shared/IHeaders';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductDto } from '../dto/find-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @IsPublic()
  create(@Headers() header: IHeaders, @Body() dto: CreateProductDto) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    const { urlBanner } = dto;
    if (urlBanner === null || undefined) {
      dto.urlBanner = 'https://i.imgur.com/2HFGvvT.png';
    }

    return this.productService.create(company_id, dto);
  }

  @Get()
  @IsPublic()
  async findAll(@Headers() header: IHeaders, @Query() query: FindProductDto) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productService.findAll(company_id, query);
  }

  @Get()
  async search(
    @Headers() header: IHeaders,
    @Query('query') query: string,
  ): Promise<Product[]> {
    const { company_id } = header;

    return this.productService.search(company_id, query);
  }

  @Get(':id')
  @IsPublic()
  findOne(@Param('id') product_id: string) {
    return this.productService.findOne(product_id);
  }

  @Patch(':id')
  @IsPublic()
  update(
    @Headers() header: IHeaders,
    @Param('id') product_id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }
    return this.productService.update(product_id, dto);
  }

  @Delete(':id')
  remove(@Param('id') product_id: string) {
    return this.productService.remove(product_id);
  }
}
