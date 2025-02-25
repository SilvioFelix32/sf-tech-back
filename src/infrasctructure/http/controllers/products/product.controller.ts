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
import { IsPublic } from 'src/infrasctructure/security/auth/decorators/is-public.decorator';
import { IHeaders } from '../../../types/IHeaders';
import { ProductService } from '../../../../domain/services/products/product.service';
import { Product } from '../../../../domain/entities/products/product.entity';
import { CreateProductDto } from '../../../../application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../../../application/dtos/products/update-product.dto';
import { IQueryPaginate } from '../../../../shared/paginator/i-query-paginate';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Headers() header: IHeaders, @Body() dto: CreateProductDto) {
    const { category_id } = header;
    this.validateHeaders(header);

    return this.productService.create(category_id, {
      ...dto,
      urlBanner: dto.urlBanner ?? 'https://i.imgur.com/2HFGvvT.png',
    });
  }

  @Get()
  @IsPublic()
  async findAll(@Query() query: IQueryPaginate) {
    return this.productService.findAll(query);
  }

  @Get()
  @IsPublic()
  async search(@Query('query') query: string): Promise<Product[]> {
    return this.productService.search(query);
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
