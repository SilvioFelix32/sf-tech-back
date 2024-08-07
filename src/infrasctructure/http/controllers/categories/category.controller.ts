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
import { IsPublic } from '../../../security/auth/decorators/is-public.decorator';
import { IHeaders } from '../../../types/IHeaders';
import { CategoryService } from '../../../../domain/services/categories/category.service';
import { CreateCategoryDto } from '../../../../application/dtos/categories/create-category.dto';
import { FindCategoryDto } from '../../../../application/dtos/categories/find-category.dto';
import { UpdateCategoryDto } from '../../../../application/dtos/categories/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @IsPublic()
  create(@Headers() header: IHeaders, @Body() dto: CreateCategoryDto) {
    const { company_id } = header;
    this.validateHeaders(header);

    return this.categoryService.create(company_id, dto);
  }

  @Get()
  @IsPublic()
  async findAll(@Headers() header: IHeaders, @Query() query: FindCategoryDto) {
    const { company_id } = header;
    this.validateHeaders(header);

    return this.categoryService.findAll(company_id, query);
  }

  @Get(':id')
  @IsPublic()
  findOne(@Param('id') category_id: string) {
    return this.categoryService.findOne(category_id);
  }

  @Patch(':id')
  @IsPublic()
  update(
    @Headers() header: IHeaders,
    @Param('id') category_id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    this.validateHeaders(header);

    return this.categoryService.update(category_id, dto);
  }

  @Delete(':id')
  remove(@Param('id') category_id: string) {
    return this.categoryService.remove(category_id);
  }

  private validateHeaders(header: IHeaders) {
    const { company_id } = header;
    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }
  }
}
