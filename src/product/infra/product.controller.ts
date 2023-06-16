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
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import { IHeaders } from '../../shared/IHeaders';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductDto } from '../dto/find-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService) { }

  @Post(':category_id')
  @IsPublic()
  create(
    @Headers() header: IHeaders,
    @Param('category_id') category_id: string,
    @Body() dto: CreateProductDto,
  ) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    if (!category_id) {
      throw new BadRequestException('Product needs a category_id');
    }

    let { url_banner } = dto;
    if (url_banner === null || undefined) {
      dto.url_banner = 'https://i.imgur.com/2HFGvvT.png';
    }

    return this.productService.create(company_id, category_id, dto);
  }

  @Get()
  @IsPublic()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800) // Tempo de expiração do cache em segundos (1800 = 30min)
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
    @Query('q') query: string,
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
