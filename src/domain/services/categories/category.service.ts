import {
  HttpException,
  Inject,
  Injectable,
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
import { UpdateCategoryDto } from '../../../application/dtos/categories/update-category.dto';
import { categoryResponse } from '../../../infrasctructure/types/category-response';
import { ErrorHandler } from '../../../shared/errors/error-handler';
import { IQueryPaginate } from '../../../shared/paginator/i-query-paginate';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly errorHandler: ErrorHandler,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(company_id: string, dto: CreateCategoryDto): Promise<string> {
    try {
      const data: Prisma.ProductCategoryCreateInput = {
        ...dto,
        company: { connect: { company_id } },
      };

      const result = await this.prismaService.productCategory.create({
        data,
      });

      return `Category ${result.category_id} created successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async findAll(company_id: string, query: IQueryPaginate): Promise<any> {
    const { page, limit } = query;

    const cacheKey = 'category';
    // TODO: 1 minuto - aumentar o tempo de duração para 60 * 60 = 1 hora
    const cacheExpiryTime = 60 * 5;
    const currentTime = Math.floor(Date.now() / 1000);

    try {
      await this.validateCompany(company_id);

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
      throw this.validateError(error);
    }
  }

  async findOne(category_id: string): Promise<Category> {
    try {
      await this.validateCategory(category_id);

      return (await this.prismaService.productCategory.findUnique({
        where: {
          category_id,
        },
        select: categoryResponse,
      })) as Category;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async update(category_id: string, dto: UpdateCategoryDto): Promise<string> {
    try {
      await this.validateCategory(category_id);
      const response = await this.prismaService.productCategory.update({
        data: {
          ...dto,
        },
        where: {
          category_id,
        },
      });

      return `Category ${response.category_id} updated successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async remove(category_id: string): Promise<string> {
    try {
      await this.validateCategory(category_id);

      const response = await this.prismaService.productCategory.delete({
        where: {
          category_id,
        },
      });
      return `Category ${response.category_id} deleted successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  private async validateCategory(category_id: string) {
    const verifyIfProductExists =
      await this.prismaService.productCategory.findUnique({
        where: { category_id },
      });

    if (!verifyIfProductExists) {
      throw new NotFoundException('Category of products not found');
    }
  }

  private async validateCompany(company_id: string) {
    if (!company_id) {
      throw new NotFoundException('Company not found');
    }
  }

  //TODO: Trocar pelo CacheService
  private async getCache(key: string) {
    const cachedData = await this.redisService.get(key);
    console.info(`Retrieved cache for key: ${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  //TODO: Trocar pelo CacheService
  private async setCache(key: string, data: any, ttl: number) {
    console.info(`Setting cache for key: ${key}, data:`, data.data.length);
    await this.redisService.set(key, JSON.stringify(data), 'EX', ttl);
  }

  private async fetchAndCacheCategories(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Category>> {
    try {
      const dbData = await this.prismaService.productCategory.findMany({
        select: categoryResponse,
      });
      await this.setCache(
        cacheKey,
        { data: dbData, timestamp: Math.floor(Date.now() / 1000) },
        cacheExpiryTime,
      );

      const paginatedDbData = this.paginateData(
        dbData as Category[],
        page,
        limit,
      );

      return paginatedDbData;
    } catch (error) {
      throw this.errorHandler.handle(error);
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

  private validateError(error: unknown): Error {
    if (error instanceof HttpException) {
      return error;
    }

    throw this.errorHandler.handle(error);
  }
}
