import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { CompaniesService } from '../../companies/services/companies.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { productCategoryReponse } from '../dto/product-category-response';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';
import { ProductCategory } from '../entities/product-category.entity';
import { RedisService } from '../../shared/cache/redis';
import { FindProductCategoryDto } from '../dto/find-product-categoru.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
    private readonly redis: RedisService,
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

  async findAll(company_id: string, query: FindProductCategoryDto) {
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const cachedProductCategories = await this.redis.get('productCategory');

    if (!cachedProductCategories || cachedProductCategories.length === 0) {
      const response = await paginate<
        ProductCategory,
        Prisma.ProductCategoryFindManyArgs
      >(
        this.prisma.productCategory,
        {
          where: {
            company_id,
          },
          select: {
            ...productCategoryReponse,
          },
        },
        { page },
      );

      await this.redis.set(
        'productCategory',
        JSON.stringify(response),
        'EX',
        3600,
      );

      return response;
    }

    return JSON.parse(cachedProductCategories);
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
    const { category_id: dtoCategoryId, products, ...updateData } = dto;

    return this.prisma.productCategory.update({
      where: {
        category_id,
      },
      data: updateData,
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
