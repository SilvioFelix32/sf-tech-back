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
import { IHeaders } from '../../../shared/IHeaders';
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
    const { category_id } = header;
    this.validateHeaders(header);

    const { urlBanner } = dto;
    if (urlBanner === null || undefined) {
      dto.urlBanner = 'https://i.imgur.com/2HFGvvT.png';
    }

    return this.productService.create(category_id, dto);
  }

  @Get()
  @IsPublic()
  async findAll(@Query() query: FindProductDto) {
    return this.productService.findAll(query);
  }

  @Get()
  async search(@Query('query') query: string): Promise<Product[]> {
    return this.productService.search(query);
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
    this.validateHeaders(header);

    return this.productService.update(product_id, dto);
  }

  @Delete(':id')
  remove(@Param('id') product_id: string) {
    return this.productService.remove(product_id);
  }

  private validateHeaders(header: IHeaders) {
    if (!header.category_id) {
      console.error('A category_id must be informed to create a new product');
      throw new BadRequestException(
        'A category_id must be informed to create a new product',
      );
    }
  }
}
