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
import { CategoryService } from '../categories/category.service';
import { Product } from '../../entities/products/product.entity';
import { CreateProductDto } from '../../../application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../../application/dtos/products/update-product.dto';
import { IProductResponse } from '../../../infrasctructure/types/product-response';
import { ErrorHandler } from '../../../shared/errors/error-handler';
import { IQueryPaginate } from '../../../shared/paginator/i-query-paginate';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
    private readonly errorHandler: ErrorHandler,
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async create(category_id: string, dto: CreateProductDto): Promise<string> {
    try {
      await this.validateCategory(category_id);

      const data: Prisma.ProductCreateInput = {
        ...dto,
        product_category: { connect: { category_id } },
      };
      const result = await this.prismaService.product.create({ data });

      this.updateCache();

      return `Product ${result.product_id} created successfully`;
    } catch (error) {
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

      return {
        message: 'Products retrieved from cache',
        data: paginatedCacheData.data,
        meta: paginatedCacheData.meta,
      };
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async search(query: string): Promise<Product[]> {
    try {
      return (await this.prismaService.product.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
      })) as Product[];
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async findOne(product_id: string): Promise<Product> {
    try {
      return await this.validateProduct(product_id);
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async update(product_id: string, dto: UpdateProductDto): Promise<string> {
    await this.validateProduct(product_id);

    try {
      const result = await this.prismaService.product.update({
        data: { ...dto },
        where: { product_id },
      });
      this.updateCache();

      return `Product ${result.product_id} updated successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  async remove(product_id: string): Promise<string> {
    await this.validateProduct(product_id);

    try {
      const result = await this.prismaService.product.delete({
        where: { product_id },
      });
      this.updateCache();

      return `Product ${result.product_id} deleted successfully`;
    } catch (error) {
      throw this.validateError(error);
    }
  }

  private async validateProduct(product_id: string): Promise<Product> {
    const product = await this.prismaService.product.findUnique({
      where: { product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product as Product;
  }

  private async validateCategory(category_id: string): Promise<void> {
    const category = await this.prismaService.productCategory.findUnique({
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
    console.info(`Retrieved cache for key: ${key}`);
    return cachedData;
  }

  private async setCache(key: string, data: any, ttl: number) {
    console.info(`Setting cache for key: ${key}, data:`, data.data.length);
    await this.cacheService.setCache(key, data, ttl);
  }

  private async fetchAndCacheProducts(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Product>> {
    try {
      const products = await this.prismaService.product.findMany();
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
      console.error(
        'ProductService.fetchAndCacheProducts: Error fetching and caching products',
        (error as Error).message,
      );
      throw this.validateError(error);
    }
  }

  private updateCache(): void {
    setTimeout(() => {
      this.fetchAndCacheProducts(1, 20, 'product', 60 * 60 * 24); //24 HOURS
      console.info('ProductService.updateCache: Cache updated!');
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

    throw error;
  }
}
