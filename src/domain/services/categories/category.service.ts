import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ProductService } from '../products/product.service';
import { Category } from '../../entities/categories/category.entity';
import { CreateCategoryDto } from '../../../application/dtos/categories/create-category.dto';
import { FindCategoryDto } from '../../../application/dtos/categories/find-category.dto';
import { UpdateCategoryDto } from '../../../application/dtos/categories/update-category.dto';
import { ICategoryResponse } from '../../../infrasctructure/types/category-response';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(
    company_id: string,
    dto: CreateCategoryDto,
  ): Promise<Category | unknown> {
    const data: Prisma.ProductCategoryCreateInput = {
      ...dto,
      company: { connect: { company_id } },
    };

    try {
      return this.prismaService.productCategory.create({
        data,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(
    company_id: string,
    query: FindCategoryDto,
  ): Promise<ICategoryResponse> {
    await this.validateCompany(company_id);
    const { page, limit } = query;
    const cacheKey = 'category';
    const cacheExpiryTime = 60;
    const currentTime = Math.floor(Date.now() / 1000);

    try {
      const cachedData = await this.getCache(cacheKey);
      if (!cachedData || currentTime - cachedData.timestamp > cacheExpiryTime) {
        const dbData = await this.fetchAndCacheCategories(
          page,
          limit,
          cacheKey,
          cacheExpiryTime,
        );

        return {
          message: 'Categories retrieved from database',
          data: dbData,
        };
      }
      const paginatedCacheData = this.paginateData(
        cachedData.data,
        page,
        limit,
      );

      return {
        message: 'Categories retrieved from cache',
        data: paginatedCacheData,
      };
    } catch (error) {
      console.error('Error retrieving categories from cache', error as Error);
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(category_id: string): Promise<Category> {
    await this.validateCategory(category_id);

    try {
      return await this.prismaService.productCategory.findUnique({
        where: {
          category_id,
        },
      });
    } catch (error) {
      console.error('Error on find category', error);
      throw new InternalServerErrorException('Error on find category');
    }
  }

  async update(category_id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.validateCategory(category_id);

    try {
      const response = await this.prismaService.productCategory.update({
        data: {
          ...dto,
        },
        where: {
          category_id,
        },
      });
      return response;
    } catch (error) {
      console.error('Error on update category', error);
      throw new InternalServerErrorException('Error on update category');
    }
  }

  async remove(category_id: string): Promise<Category> {
    await this.validateCategory(category_id);

    try {
      const response = await this.prismaService.productCategory.delete({
        where: {
          category_id,
        },
      });
      return response;
    } catch (error) {
      console.error('Error on delete category', error);
      throw new InternalServerErrorException('Error on delete category');
    }
  }

  private async validateCategory(category_id: string) {
    const verifyIfProductExists =
      await this.prismaService.productCategory.findUnique({
        where: { category_id },
      });

    if (!verifyIfProductExists) {
      throw new NotFoundException('Product not found');
    }
  }

  private async validateCompany(company_id: string) {
    const verifyIfCompanyExists = await this.prismaService.company.findUnique({
      where: { company_id },
    });

    if (!verifyIfCompanyExists) {
      throw new NotFoundException('Company not found');
    }
  }

  private async getCache(key: string) {
    const cachedData = await this.redisService.get(key);
    console.log(`Retrieved cache for key: ${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setCache(key: string, data: any, ttl: number) {
    console.log(`Setting cache for key: ${key}, data:`, data.data.length);
    await this.redisService.set(key, JSON.stringify(data), 'EX', ttl);
  }

  private async fetchAndCacheCategories(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Category>> {
    try {
      const dbData = await this.prismaService.productCategory.findMany();
      await this.setCache(
        cacheKey,
        { data: dbData, timestamp: Math.floor(Date.now() / 1000) },
        cacheExpiryTime,
      );

      const paginatedDbData = this.paginateData(dbData, page, limit);

      return paginatedDbData;
    } catch (error) {
      console.error('Error fetching and caching products', error as Error);
      throw new InternalServerErrorException(
        'Error fetching and caching products',
      );
    }
  }
  private paginateData(
    data: Category[],
    page: number,
    limit: number,
  ): PaginatedResult<Category> {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data: paginatedData,
      meta: {
        total: totalItems,
        lastPage: totalPages,
        currentPage: page,
        perPage: limit ? limit : 20,
        prev: prevPage,
        next: nextPage,
      },
    };
  }
}
