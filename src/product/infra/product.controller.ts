import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { RequestHeaders } from 'src/shared/app.headers.dto';
import { IHeaders } from 'src/shared/IHeaders';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductDto } from '../dto/find-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post(':category_id')
  @IsPublic()
  create(
    @RequestHeaders() header: IHeaders,
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
  findAll(@RequestHeaders() header: IHeaders, @Param() dto: FindProductDto) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productService.findAll(company_id, dto);
  }

  @Get(':id')
  findOne(@Param('id') product_id: string) {
    return this.productService.findOne(product_id);
  }

  @Patch(':id')
  update(
    @RequestHeaders() header: IHeaders,
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
