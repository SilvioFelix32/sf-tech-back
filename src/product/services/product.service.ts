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

  private async validateProduct(product_id: string) {
    const verifyIfProductExists = await this.prisma.product.findUnique({
      where: { product_id },
    });

    if (!verifyIfProductExists) {
      throw new NotFoundException('Product not found');
    }
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

    if (!cachedProducts) {
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

      await this.redis.set(
        key,
        JSON.stringify(response),
        'EX',
        10,
        // 7 * 24 * 60 * 60,
      ); //7 days

      return response;
    }

    return JSON.parse(cachedProducts);
  }

  async search(company_id: string, query: any) {
    const response = await this.prisma.product.findMany({
      where: {
        company_id,
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
    return response;
  }

  async findOne(product_id: string): Promise<Product> {
    await this.validateProduct(product_id);

    const response = await this.prisma.product.findUnique({
      where: {
        product_id,
      },
      select: {
        ...productResponse,
      },
    });
    return response;
  }

  async update(product_id: string, dto: UpdateProductDto): Promise<Product> {
    await this.validateProduct(product_id);

    const response = await this.prisma.product.update({
      where: {
        product_id,
      },
      data: {
        ...dto,
      },
    });
    return response;
  }

  async remove(product_id: string): Promise<Product> {
    await this.validateProduct(product_id);

    const response = await this.prisma.product.delete({
      where: {
        product_id,
      },
    });
    return response;
  }
}
