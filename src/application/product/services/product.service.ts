import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult, createPaginator } from 'prisma-pagination';
import { PrismaService } from '../../../shared/infraestructure/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { productResponse } from '../dto/product-response';
import { FindProductDto } from '../dto/find-product.dto';
import { RedisService } from '../../../shared/infraestructure/cache/redis';
import { Product } from '../entities/product.entity';
import { CategoryService } from 'src/application/productCategory/services/category.service';

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

  async findAll(query: FindProductDto): Promise<PaginatedResult<Product>> {
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const key = 'product';
    const cacheExpiryTime = 60;
    const currentTime = Math.floor(Date.now() / 1000);

    try {
      const cachedData = await this.getCache(key);
      if (!cachedData || currentTime - cachedData.timestamp > cacheExpiryTime) {
        const dbData = await paginate<Product, Prisma.ProductFindManyArgs>(
          this.prismaService.product,
          {
            select: {
              ...productResponse,
            },
          },
          { page },
        );

        await this.setCache(
          key,
          { data: dbData, timestamp: currentTime },
          cacheExpiryTime,
        );
        return dbData;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error retrieving products', error as Error);
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
    await this.validateProduct(product_id);

    try {
      return await this.prismaService.product.findUnique({
        where: { product_id },
      });
    } catch (error) {
      console.error('Error retrieving product', error as Error);
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

  private async validateProduct(product_id: string) {
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
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setCache(key: string, data: any, ttl: number) {
    await this.redisService.set(key, JSON.stringify(data), 'EX', ttl);
  }
}
