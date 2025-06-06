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
import type { IHeaders } from '../../../types/IHeaders';
import { CategoryService } from '../../../../domain/services/categories/category.service';
import { CreateCategoryDto } from '../../../../application/dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '../../../../application/dtos/categories/update-category.dto';
import type { IQueryPaginate } from '../../../../shared/paginator/i-query-paginate.ts';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Headers() header: IHeaders, @Body() dto: CreateCategoryDto) {
    const { company_id } = header;
    this.validateCompany(company_id);

    return this.categoryService.create(company_id, dto);
  }

  @Get()
  @IsPublic()
  async findAll(@Headers() header: IHeaders, @Query() query: IQueryPaginate) {
    this.validateCompany(header.company_id);

    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @IsPublic()
  findOne(@Param('id') category_id: string) {
    return this.categoryService.findOne(category_id);
  }

  @Patch(':id')
  update(
    @Headers() header: IHeaders,
    @Param('id') category_id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    this.validateCompany(header.company_id);

    return this.categoryService.update(category_id, dto);
  }

  @Delete(':id')
  remove(@Param('id') category_id: string) {
    return this.categoryService.remove(category_id);
  }

  private validateCompany(company_id: string): void {
    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }
  }
}
