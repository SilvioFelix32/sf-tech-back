import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../products/product.service';
import { Category } from '../../entities/categories/category.entity';
import { CreateCategoryDto } from '../../../application/dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '../../../application/dtos/categories/update-category.dto';
import {
  categoryResponse,
  ICategoryResponse,
} from '../../../infrasctructure/types/category-response';
import { ErrorHandler } from '../../../shared/errors/error-handler';
import { IQueryPaginate } from '../../../shared/paginator/i-query-paginate';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly errorHandler: ErrorHandler,
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
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
      this.updateCache();

      return `Category ${result.category_id} created successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async findAll(
    company_id: string,
    query: IQueryPaginate,
  ): Promise<ICategoryResponse> {
    const { page, limit } = query;

    const cacheKey = 'category';
    const cacheExpiryTime = 60 * 60 * 24; //24 HOURS
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
          data: dbData.data,
          meta: dbData.meta,
        };
      }
      const paginatedCacheData = this.paginateData(
        cachedData.data,
        page,
        limit,
      );

      return {
        message: 'Categories retrieved from cache',
        data: paginatedCacheData.data,
        meta: paginatedCacheData.meta,
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

      this.updateCache();

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
      this.updateCache();

      return `Category ${response.category_id} deleted successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  private async validateCategory(category_id: string) {
    const productExists = await this.prismaService.productCategory.findUnique({
      where: { category_id },
    });

    if (!productExists) {
      throw new NotFoundException('Category of products not found');
    }
  }

  private async validateCompany(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }
  }

  private async getCache(key: string) {
    const cachedData = await this.cacheService.getCache<
      PaginatedResult<Category> & { timestamp: number }
    >(key);
    console.info(`Retrieved cache for key: ${key}`);
    return cachedData;
  }

  private async setCache(key: string, data: any, ttl: number) {
    console.info(`Setting cache for key: ${key}, data:`, data.data.length);
    await this.cacheService.setCache(key, data, ttl);
  }

  private async fetchAndCacheCategories(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Category>> {
    try {
      const categories = await this.prismaService.productCategory.findMany({
        select: categoryResponse,
      });

      const paginatedData: PaginatedResult<Category> = this.paginateData(
        categories as Category[],
        page,
        limit,
      );

      const dataToCache = {
        ...paginatedData,
        timestamp: Math.floor(Date.now() / 1000),
      };

      await this.setCache(cacheKey, dataToCache, cacheExpiryTime);

      return paginatedData;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error);
      }
      throw new InternalServerErrorException(error);
    }
  }

  private updateCache(): void {
    setTimeout(() => {
      this.fetchAndCacheCategories(1, 20, 'category', 60 * 60 * 24); //24 HOURS
      console.info('CategoryService.updateCache: Cache updated!');
    }, 0);
  }

  private paginateData(
    data: Category[],
    page: number,
    limit: number,
  ): PaginatedResult<Category> {
    const safeData = data ?? [];
    const totalItems = safeData.length;
    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 0;
    const offset = (page - 1) * limit;
    const paginatedData = safeData.slice(offset, offset + limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data: paginatedData,
      meta: {
        total: totalItems,
        lastPage: totalPages,
        currentPage: page,
        perPage: limit ?? 20,
        prev: prevPage,
        next: nextPage,
      },
    };
  }

  private validateError(error: unknown): Error {
    if (error instanceof HttpException) {
      return error;
    }

    return this.errorHandler.handle(error);
  }
}
