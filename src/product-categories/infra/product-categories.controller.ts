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
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';
import { ProductCategoriesService } from '../services/product-categories.service';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @IsPublic()
  create(
    @RequestHeaders() header: IHeaders,
    @Body() dto: CreateProductCategoryDto,
  ) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productCategoriesService.create(company_id, dto);
  }

  @Get()
  @IsPublic()
  findAll(@RequestHeaders() header: IHeaders, @Param() dto: any) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.productCategoriesService.findAll(company_id, dto);
  }

  @Get(':id')
  findOne(@Param('id') category_id: string) {
    return this.productCategoriesService.findOne(category_id);
  }

  @Patch(':id')
  update(
    @RequestHeaders() header: IHeaders,
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
