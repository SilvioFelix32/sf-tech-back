import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { productReponse } from '../dto/product-response';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { FindProductDto } from '../dto/find-product.dto';
import { RedisService } from '../../shared/cache/redis'

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService,
    private readonly redis: RedisService) { }

  private async validateProduct(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No company ID informed');
    }
  }

  private async updateCacheOnDb(cachedProducts: string) {
    JSON.parse(cachedProducts)

    const cachedData = await this.redis.get('product',);

    if (!cachedData) {
      await this.redis.set('product', JSON.stringify(cachedData))
    }

    return JSON.parse(cachedData)
  }

  async create(
    company_id: string,
    category_id: string,
    dto: CreateProductDto,
  ): Promise<Product | unknown> {
    await this.validateProduct(company_id);

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

    const cachedProducts = await this.redis.get('product');

    if (!cachedProducts) {
      const response = await paginate<Product, Prisma.ProductFindManyArgs>(
        this.prisma.product,
        {
          where: {
            company_id,
          },
          select: {
            ...productReponse,
          },
        },
        { page: page },
      );

      await this.redis.set(
        'product',
        JSON.stringify(response),
        'EX', 1800
      )
      return response;
    };

    return JSON.parse(cachedProducts);
  }

  async search(company_id: string, query: string) {
    const products = await this.prisma.product.findMany({
      where: {
        company_id,
        title: {
          contains: query, //o operador contains do Prisma para pesquisar por uma correspondência parcial do nome do produto
          //equals: query, //Se você quiser uma correspondência exata, pode usar o operador equals
          mode: 'insensitive',
        },
      },
    });
    return products;
  }

  findOne(product_id: string): Promise<Product | unknown> {
    return this.prisma.product.findUnique({
      where: {
        product_id,
      },
      select: {
        ...productReponse,
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
