import {
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { DatabaseService } from '../database/database.service';
import { Product } from '../../entities/products/product.entity';
import { CreateProductDto } from '../../../application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../../application/dtos/products/update-product.dto';
import { IProductResponse } from '../../../infrastructure/types/product-response';
import { ErrorHandler } from '../../../shared/errors/error-handler';
import { IQueryPaginate } from '../../../shared/paginator/i-query-paginate';
import { CacheService } from '../cache/cache.service';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
  ) { }

  async create(category_id: string, dto: CreateProductDto): Promise<string> {
    try {
      await this.validateCategory(category_id);

      const data: Prisma.ProductCreateInput = {
        ...dto,
        product_category: { connect: { category_id } },
      };
      const result = await this.databaseService.product.create({ data });

      this.updateCache();

      this.logger.info(
        `ProductService.create() - Product ${result.product_id} created successfully`,
        { metadata: { product_id: result.product_id, category_id } },
      );
      return `Product ${result.product_id} created successfully`;
    } catch (error) {
      this.logger.error(
        `ProductService.create() - Error creating product`,
        { error: error instanceof Error ? error : new Error(String(error)) },
      );
      throw this.validateError(error);
    }
  }

  async findAll(query: IQueryPaginate): Promise<IProductResponse> {
    const { page, limit } = query;

    const cacheKey = 'product';
    const cacheExpiryTime = 60 * 60 * 24; //24 HOURS
    const currentTime = Math.floor(Date.now() / 1000);

    try {
      const cachedData = await this.getCache(cacheKey);
      if (!cachedData || currentTime - cachedData.timestamp > cacheExpiryTime) {
        const dbData = await this.fetchAndCacheProducts(
          page,
          limit,
          cacheKey,
          cacheExpiryTime,
        );

        this.logger.info(
          `ProductService.findAll() - Products retrieved from database`,
          { metadata: { page, limit, total: dbData.meta.total } },
        );
        return {
          message: 'Products retrieved from database',
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
        `ProductService.findAll() - Products retrieved from cache`,
        { metadata: { page, limit, total: paginatedCacheData.meta.total } },
      );
      return {
        message: 'Products retrieved from cache',
        data: paginatedCacheData.data,
        meta: paginatedCacheData.meta,
      };
    } catch (error) {
      this.logger.error(
        `ProductService.findAll() - Error retrieving products`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { page, limit },
        },
      );
      throw this.validateError(error);
    }
  }

  async search(query: string): Promise<Product[]> {
    try {
      const products = (await this.databaseService.product.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
      })) as Product[];
      this.logger.info(
        `ProductService.search() - Found ${products.length} products for query: ${query}`,
        { metadata: { query, count: products.length } },
      );
      return products;
    } catch (error) {
      this.logger.error(
        `ProductService.search() - Error searching products`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { query },
        },
      );
      throw this.validateError(error);
    }
  }

  async findOne(product_id: string): Promise<Product> {
    try {
      const product = await this.validateProduct(product_id);
      this.logger.info(
        `ProductService.findOne() - Product ${product_id} retrieved successfully`,
        { metadata: { product_id } },
      );
      return product;
    } catch (error) {
      this.logger.error(
        `ProductService.findOne() - Error retrieving product ${product_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { product_id },
        },
      );
      throw this.validateError(error);
    }
  }

  async update(product_id: string, dto: UpdateProductDto): Promise<string> {
    await this.validateProduct(product_id);

    try {
      const result = await this.databaseService.product.update({
        data: { ...dto },
        where: { product_id },
      });
      this.updateCache();

      this.logger.info(
        `ProductService.update() - Product ${result.product_id} updated successfully`,
        { metadata: { product_id: result.product_id } },
      );
      return `Product ${result.product_id} updated successfully`;
    } catch (error) {
      this.logger.error(
        `ProductService.update() - Error updating product ${product_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { product_id },
        },
      );
      throw this.validateError(error);
    }
  }

  async remove(product_id: string): Promise<string> {
    await this.validateProduct(product_id);

    try {
      const result = await this.databaseService.product.delete({
        where: { product_id },
      });
      this.updateCache();

      this.logger.info(
        `ProductService.remove() - Product ${result.product_id} deleted successfully`,
        { metadata: { product_id: result.product_id } },
      );
      return `Product ${result.product_id} deleted successfully`;
    } catch (error) {
      this.logger.error(
        `ProductService.remove() - Error deleting product ${product_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { product_id },
        },
      );
      throw this.validateError(error);
    }
  }

  private async validateProduct(product_id: string): Promise<Product> {
    const product = await this.databaseService.product.findUnique({
      where: { product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product as Product;
  }

  private async validateCategory(category_id: string): Promise<void> {
    const category = await this.databaseService.productCategory.findUnique({
      where: { category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async getCache(key: string) {
    const cachedData = await this.cacheService.getCache<
      PaginatedResult<Product> & { timestamp: number }
    >(key);
    this.logger.info(`ProductService.getCache() - Retrieved cache for key: ${key}`);
    return cachedData;
  }

  private async setCache(key: string, data: any, ttl: number) {
    this.logger.info(
      `ProductService.setCache() - Setting cache for key: ${key}`,
      { metadata: { key, dataLength: data.data.length, ttl } },
    );
    await this.cacheService.setCache(key, data, ttl);
  }

  private async fetchAndCacheProducts(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Product>> {
    try {
      const products = await this.databaseService.product.findMany();
      const paginatedData: PaginatedResult<Product> = this.paginateData(
        products as Product[],
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
      this.logger.error(
        `ProductService.fetchAndCacheProducts() - Error fetching and caching products`,
        { error: error instanceof Error ? error : new Error(String(error)) },
      );
      throw this.validateError(error);
    }
  }

  private updateCache(): void {
    setTimeout(() => {
      this.fetchAndCacheProducts(1, 20, 'product', 60 * 60 * 24); //24 HOURS
      this.logger.info('ProductService.updateCache() - Cache update scheduled');
    }, 0);
  }

  private paginateData(
    data: Product[] | undefined,
    page: number,
    limit: number,
  ): PaginatedResult<Product> {
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
