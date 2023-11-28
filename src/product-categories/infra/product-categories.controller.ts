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
import { IPaginateDto } from '../../shared/paginator/paginate.interface.dto';
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import { IHeaders } from '../../shared/IHeaders';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { FindProductCategoryDto } from '../dto/find-product-categoru.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';
import { ProductCategoriesService } from '../services/product-categories.service';
import { Product } from 'src/product/entities/product.entity';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @IsPublic()
  create(@Headers() header: IHeaders, @Body() dto: CreateProductCategoryDto) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productCategoriesService.create(company_id, dto);
  }

  @Get()
  @IsPublic()
  findAll(
    @Headers() header: IHeaders,
    @Query() query: FindProductCategoryDto,
  ): Promise<IPaginateDto | unknown> {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productCategoriesService.findAll(company_id, query);
  }

  @Get()
  async search(
    @Headers() header: IHeaders,
    @Query('query') query: string,
  ): Promise<Product[]> {
    if (!header.company_id || !query) {
      throw new BadRequestException('No Company or query informed');
    }
    const { company_id } = header;

    try {
      const result = await this.productCategoriesService.search(
        company_id,
        query,
      );
      return result;
    } catch (error) {
      // Trate o erro de alguma forma
      console.error('Erro na busca:', error);
      throw new BadRequestException('error', error);
    }
  }

  @Get(':id')
  @IsPublic()
  findOne(@Param('id') category_id: string) {
    return this.productCategoriesService.findOne(category_id);
  }

  @Patch(':id')
  @IsPublic()
  update(
    @Headers() header: IHeaders,
    @Param('id') category_id: string,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productCategoriesService.update(category_id, dto);
  }

  @Delete(':id')
  remove(@Param('id') category_id: string) {
    return this.productCategoriesService.remove(category_id);
  }
}
