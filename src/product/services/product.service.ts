import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { productResponse } from '../dto/product-response';
import { FindProductDto } from '../dto/find-product.dto';
import { RedisService } from '../../shared/cache/redis';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private validateCompany(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No company ID informed');
    }
  }

  private async updateCacheOnDb(
    key: string,
    data: any,
    expirationInSeconds: number,
  ) {
    const cachedData = await this.redis.get(key);

    if (!cachedData) {
      await this.redis.set(
        key,
        JSON.stringify(data),
        'EX',
        expirationInSeconds,
      );
    }

    return JSON.parse(cachedData || JSON.stringify(data));
  }

  async create(
    company_id: string,
    category_id: string,
    dto: CreateProductDto,
  ): Promise<Product | unknown> {
    this.validateCompany(company_id);

    const data: Prisma.ProductCreateInput = {
      company_id,
      category_id,
      ...dto,
    };

    return this.prisma.product.create({
      data,
    });
  }

  async findAll(company_id: string, query: FindProductDto) {
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const key = 'product';
    const cachedProducts = await this.redis.get(key);

    if (!cachedProducts || cachedProducts.length === 0) {
      const response = await paginate<Product, Prisma.ProductFindManyArgs>(
        this.prisma.product,
        {
          where: {
            company_id,
          },
          select: {
            ...productResponse,
          },
        },
        { page },
      );

      await this.redis.set(key, JSON.stringify(response), 'EX', 3600);

      return response;
    }

    return cachedProducts;
  }

  async search(company_id: string, query: string) {
    this.validateCompany(company_id);

    return this.prisma.product.findMany({
      where: {
        company_id,
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
  }

  async findOne(product_id: string): Promise<Product | unknown> {
    return this.prisma.product.findUnique({
      where: {
        product_id,
      },
      select: {
        ...productResponse,
      },
    });
  }

  async update(
    product_id: string,
    dto: UpdateProductDto,
  ): Promise<Product | unknown> {
    const updateProduct = await this.findOne(product_id);
    if (!updateProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: {
        product_id,
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(product_id: string): Promise<Product | unknown> {
    const deleteProduct = await this.findOne(product_id);
    if (!deleteProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: {
        product_id,
      },
    });
  }
}
