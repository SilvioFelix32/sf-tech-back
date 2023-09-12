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
    private readonly redis: RedisService,
  ) {}

  private validateCompany(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No company ID informed');
    }
  }

  private async validateCategory(category_id: string) {
    const verifyIfCategoryExists = await this.prisma.productCategory.findUnique(
      {
        where: { category_id },
      },
    );
    if (!verifyIfCategoryExists) {
      throw new NotFoundException('Category not found');
    }
  }

  async create(
    company_id: string,
    dto: CreateProductCategoryDto,
  ): Promise<ProductCategory | unknown> {
    this.validateCompany(company_id);

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

    const key = 'productCategory';
    const cachedProductCategories = await this.redis.get(key);

    if (!cachedProductCategories) {
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
        key,
        JSON.stringify(response),
        'EX',
        7 * 24 * 60 * 60, //7 days
      );

      return response;
    }

    return JSON.parse(cachedProductCategories);
  }

  async findOne(category_id: string): Promise<ProductCategory> {
    await this.validateCategory(category_id);

    const response = await this.prisma.productCategory.findUnique({
      where: {
        category_id,
      },
      select: {
        ...productCategoryReponse,
      },
    });
    return response as ProductCategory;
  }

  async update(
    category_id: string,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    await this.validateCategory(category_id);

    const response = await this.prisma.productCategory.update({
      where: {
        category_id,
      },
      data: dto,
    });
    return response as ProductCategory;
  }

  async remove(category_id: string): Promise<ProductCategory | unknown> {
    await this.validateCategory(category_id);
    const response = this.prisma.productCategory.delete({
      where: {
        category_id,
      },
    });
    return response;
  }
}
