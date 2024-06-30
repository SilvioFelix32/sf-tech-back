import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { PrismaService } from '../../../infrasctructure/prisma/prisma.service';
import { CategoryService } from '../categories/category.service';
import { RedisService } from '../../../infrasctructure/cache/redis.service';
import { Product } from '../../entities/products/product.entity';
import { CreateProductDto } from '../../../application/dtos/products/create-product.dto';
import { FindProductDto } from '../../../application/dtos/products/find-product.dto';
import { UpdateProductDto } from '../../../application/dtos/products/update-product.dto';
import { IProductResponse } from '../../../infrasctructure/types/product-response';

@Injectable()
export class ProductService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(category_id: string, dto: CreateProductDto): Promise<Product> {
    await this.validateCategory(category_id);

    try {
      const data: Prisma.ProductCreateInput = {
        ...dto,
        product_category: { connect: { category_id } },
      };

      return this.prismaService.product.create({ data });
    } catch (error) {
      console.error('Error creating product', error as Error);
      throw new InternalServerErrorException('Error creating product');
    }
  }

  // Todo: pensar numa maneira de remover o data.data
  async findAll(query: FindProductDto): Promise<IProductResponse> {
    const { page, limit } = query;
    const cacheKey = 'product';
    const cacheExpiryTime = 60; // 1 minute - Todo: aumentar o tempo de duração para 60 * 60 = 1 hora
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
      console.error('Error retrieving products from cache', error as Error);
      throw new InternalServerErrorException('Error retrieving products');
    }
  }

  async search(query: string): Promise<Product[]> {
    try {
      return await this.prismaService.product.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
    } catch (error) {
      console.error('Error searching products', error as Error);
      throw new InternalServerErrorException('Error searching products');
    }
  }

  async findOne(product_id: string): Promise<Product> {
    try {
      return await this.validateProduct(product_id);
    } catch (error) {
      const err = error as Error;
      console.error('Error retrieving product:', err);
      if (err.message === 'Product not found') {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException('Error retrieving product');
    }
  }

  async update(product_id: string, dto: UpdateProductDto): Promise<Product> {
    await this.validateProduct(product_id);

    try {
      return await this.prismaService.product.update({
        data: { ...dto },
        where: { product_id },
      });
    } catch (error) {
      console.error('Error updating product', error as Error);
      throw new InternalServerErrorException('Error updating product');
    }
  }

  async remove(product_id: string): Promise<Product> {
    await this.validateProduct(product_id);

    try {
      return await this.prismaService.product.delete({
        where: { product_id },
      });
    } catch (error) {
      console.error('Error deleting product', error as Error);
      throw new InternalServerErrorException('Error deleting product');
    }
  }

  private async validateProduct(product_id: string): Promise<Product> {
    const product = await this.prismaService.product.findUnique({
      where: { product_id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
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
    console.log(
      `Retrieved cache for key: ${key}, data:`,
      JSON.parse(cachedData),
    );
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setCache(key: string, data: any, ttl: number) {
    console.log(`Setting cache for key: ${key}, data:`, data.data.length);
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
