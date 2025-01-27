import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from '../categories/category.service';
import { RedisService } from '../redis/redis.service';
import { Product } from '../../entities/products/product.entity';
import { CreateProductDto } from '../../../application/dtos/products/create-product.dto';
import { UpdateProductDto } from '../../../application/dtos/products/update-product.dto';
import { IProductResponse } from '../../../infrasctructure/types/product-response';
import { ErrorHandler } from '../../../shared/errors/error-handler';
import { IQueryPaginate } from '../../../shared/paginator/i-query-paginate';

@Injectable()
export class ProductService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
    private readonly errorHandler: ErrorHandler,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(category_id: string, dto: CreateProductDto): Promise<string> {
    await this.validateCategory(category_id);

    try {
      const data: Prisma.ProductCreateInput = {
        ...dto,
        product_category: { connect: { category_id } },
      };

      const result = await this.prismaService.product.create({ data });
      return `Product ${result.product_id} created successfully`;
    } catch (error) {
      this.errorHandler.handle(error as Error);
    }
  }

  // TODO: pensar numa maneira de remover o data.data
  async findAll(query: IQueryPaginate): Promise<IProductResponse> {
    const { page, limit } = query;

    const cacheKey = 'product';
    // TODO: 1 minuto - aumentar o tempo de duração para 60 * 60 = 1 hora
    const cacheExpiryTime = 60 * 5;
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
          data: dbData,
        };
      }

      const paginatedCacheData = this.paginateData(
        cachedData.data,
        page,
        limit,
      );

      return {
        message: 'Products retrieved from cache',
        data: paginatedCacheData,
      };
    } catch (error) {
      this.errorHandler.handle(error as Error);
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
      this.errorHandler.handle(error as Error);
    }
  }

  async findOne(product_id: string): Promise<Product> {
    try {
      return await this.validateProduct(product_id);
    } catch (error) {
      this.errorHandler.handle(error as Error);
    }
  }

  async update(product_id: string, dto: UpdateProductDto): Promise<string> {
    await this.validateProduct(product_id);

    try {
      const result = await this.prismaService.product.update({
        data: { ...dto },
        where: { product_id },
      });

      return `Product ${result.product_id} updated successfully`;
    } catch (error) {
      this.errorHandler.handle(error as Error);
    }
  }

  async remove(product_id: string): Promise<string> {
    await this.validateProduct(product_id);

    try {
      const result = await this.prismaService.product.delete({
        where: { product_id },
      });

      return `Product ${result.product_id} deleted successfully`;
    } catch (error) {
      this.errorHandler.handle(error as Error);
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

  private async validateCategory(category_id: string) {
    const category = await this.prismaService.productCategory.findUnique({
      where: { category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async getCache(key: string) {
    const cachedData = await this.redisService.get(key);
    console.info(`Retrieved cache for key: ${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setCache(key: string, data: any, ttl: number) {
    console.info(`Setting cache for key: ${key}, data:`, data.data.length);
    await this.redisService.set(key, JSON.stringify(data), 'EX', ttl);
  }

  private async fetchAndCacheProducts(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<Product>> {
    try {
      const dbData = await this.prismaService.product.findMany();
      await this.setCache(
        cacheKey,
        { data: dbData, timestamp: Math.floor(Date.now() / 1000) },
        cacheExpiryTime,
      );

      const paginatedDbData = this.paginateData(
        dbData as Product[],
        page,
        limit,
      );

      return paginatedDbData;
    } catch (error) {
      console.error('Error fetching and caching products', error as Error);
      this.errorHandler.handle(error as Error);
    }
  }
  private paginateData(
    data: Product[],
    page: number,
    limit: number,
  ): PaginatedResult<Product> {
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
