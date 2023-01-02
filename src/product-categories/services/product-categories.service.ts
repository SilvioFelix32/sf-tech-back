import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CompaniesService } from 'src/companies/services/companies.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { productCategoryReponse } from '../dto/product-category-response';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';
import { ProductCategory } from '../entities/product-category.entity';

@Injectable()
export class ProductCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
  ) {}

  private async validateProduct(company_id: string) {
    const company = await this.companiesService.findOne(company_id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  async create(
    company_id: string,
    dto: CreateProductCategoryDto,
  ): Promise<ProductCategory | unknown> {
    await this.validateProduct(company_id);

    const { product_type } = dto;

    if (!product_type) {
      throw new BadRequestException('No product type informed');
    }

    const data: Prisma.ProductCategoryCreateInput = {
      company_id,
      ...dto,
    };

    return this.prisma.productCategory.create({ data });
  }

  async findAll(
    company_id: string,
    dto: any,
  ): Promise<ProductCategory[] | unknown> {
    return this.prisma.productCategory.findMany({
      where: {
        company_id,
        ...dto,
      },
      select: {
        ...productCategoryReponse,
      },
    });
  }

  async findOne(category_id: string): Promise<ProductCategory | unknown> {
    return this.prisma.productCategory.findUnique({
      where: {
        category_id,
      },
      select: {
        ...productCategoryReponse,
      },
    });
  }

  async update(
    category_id: string,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory | unknown> {
    delete dto.category_id;
    delete dto.products;
    
    return this.prisma.productCategory.update({
      where: {
        category_id,
      },
      data: {
        ...dto,
      },
    });
  }

  remove(category_id: string): Promise<ProductCategory | unknown> {
    return this.prisma.productCategory.delete({
      where: {
        category_id,
      },
    });
  }
}
