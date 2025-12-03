import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { Category } from '../../entities/categories/category.entity';
import { CreateCategoryDto } from '../../../application/dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '../../../application/dtos/categories/update-category.dto';
import {
  categoryResponse,
  ICategoryResponse,
} from '../../../infrastructure/types/category-response';
import { ErrorHandler } from '../../../shared/errors/error-handler';
import { IQueryPaginate } from '../../../shared/paginator/i-query-paginate';
import { CacheService } from '../cache/cache.service';
import { DatabaseService } from '../database/database.service';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
  ) {}

  async create(company_id: string, dto: CreateCategoryDto): Promise<string> {
    try {
      const data: Prisma.ProductCategoryCreateInput = {
        ...dto,
        company: { connect: { company_id } },
      };

      const result = await this.databaseService.productCategory.create({
        data,
      });
      this.updateCache();

      this.logger.info(
        `CategoryService.create() - Category ${result.category_id} created successfully`,
        { metadata: { category_id: result.category_id, company_id } },
      );
      return `Category ${result.category_id} created successfully`;
    } catch (error) {
      this.logger.error(
        `CategoryService.create() - Error creating category`,
        { error: error instanceof Error ? error : new Error(String(error)) },
      );
      throw this.validateError(error);
    }
  }

  async findAll(query: IQueryPaginate): Promise<ICategoryResponse> {
    const { page, limit } = query;

    const cacheKey = 'category';
    const cacheExpiryTime = 60 * 60 * 24; //24 HOURS
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

        this.logger.info(
          `CategoryService.findAll() - Categories retrieved from database`,
          { metadata: { page, limit, total: dbData.meta.total } },
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

      this.logger.info(
        `CategoryService.findAll() - Categories retrieved from cache`,
        { metadata: { page, limit, total: paginatedCacheData.meta.total } },
      );
      return {
        message: 'Categories retrieved from cache',
        data: paginatedCacheData.data,
        meta: paginatedCacheData.meta,
      };
    } catch (error) {
      this.logger.error(
        `CategoryService.findAll() - Error retrieving categories`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { page, limit },
        },
      );
      throw this.validateError(error);
    }
  }

  async findOne(category_id: string): Promise<Category> {
    try {
      await this.validateCategory(category_id);

      const category = (await this.databaseService.productCategory.findUnique({
        where: {
          category_id,
        },
        select: categoryResponse,
      })) as Category;

      this.logger.info(
        `CategoryService.findOne() - Category ${category_id} retrieved successfully`,
        { metadata: { category_id } },
      );
      return category;
    } catch (error) {
      this.logger.error(
        `CategoryService.findOne() - Error retrieving category ${category_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { category_id },
        },
      );
      throw this.validateError(error);
    }
  }

  async update(category_id: string, dto: UpdateCategoryDto): Promise<string> {
    try {
      await this.validateCategory(category_id);
      const response = await this.databaseService.productCategory.update({
        data: {
          ...dto,
        },
        where: {
          category_id,
        },
      });

      this.updateCache();

      this.logger.info(
        `CategoryService.update() - Category ${response.category_id} updated successfully`,
        { metadata: { category_id: response.category_id } },
      );
      return `Category ${response.category_id} updated successfully`;
    } catch (error) {
      this.logger.error(
        `CategoryService.update() - Error updating category ${category_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { category_id },
        },
      );
      throw this.validateError(error);
    }
  }

  async remove(category_id: string): Promise<string> {
    try {
      await this.validateCategory(category_id);

      const response = await this.databaseService.productCategory.delete({
        where: {
          category_id,
        },
      });
      this.updateCache();

      this.logger.info(
        `CategoryService.remove() - Category ${response.category_id} deleted successfully`,
        { metadata: { category_id: response.category_id } },
      );
      return `Category ${response.category_id} deleted successfully`;
    } catch (error) {
      this.logger.error(
        `CategoryService.remove() - Error deleting category ${category_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { category_id },
        },
      );
      throw this.validateError(error);
    }
  }

  private async validateCategory(category_id: string) {
    const productExists = await this.databaseService.productCategory.findUnique({
      where: { category_id },
    });

    if (!productExists) {
      throw new NotFoundException('Category of products not found');
    }
  }

  private async getCache(key: string) {
    const cachedData = await this.cacheService.getCache<
      PaginatedResult<Category> & { timestamp: number }
    >(key);
    this.logger.info(`CategoryService.getCache() - Retrieved cache for key: ${key}`);
    return cachedData;
  }

  private async setCache(key: string, data: any, ttl: number) {
    this.logger.info(
      `CategoryService.setCache() - Setting cache for key: ${key}`,
      { metadata: { key, dataLength: data.data.length, ttl } },
    );
    await this.cacheService.setCache(key, data, ttl);
  }

  private async fetchAndCacheCategories(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Category>> {
    try {
      const categories = await this.databaseService.productCategory.findMany({
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
      this.logger.info('CategoryService.updateCache() - Cache update scheduled');
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
