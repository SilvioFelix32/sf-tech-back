import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from '../../infraestructure/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { productResponse } from '../dto/product-response';
import { FindProductDto } from '../dto/find-product.dto';
import { RedisService } from '../../infraestructure/cache/redis';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private validateCompany(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No company_id informed');
    }
  }

  private async validateProduct(product_id: string) {
    const verifyIfProductExists = await this.prismaService.product.findUnique({
      where: { product_id },
    });

    if (!verifyIfProductExists) {
      throw new NotFoundException('Product not found');
    }
  }

  async create(
    company_id: string,
    dto: CreateProductDto,
  ): Promise<Product | unknown> {
    this.validateCompany(company_id);

    const data: Prisma.ProductCreateInput = {
      company: { connect: { company_id } },
      ...dto,
    };

    return this.prismaService.product.create({
      data,
    });
  }

  async findAll(company_id: string, query: FindProductDto) {
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const key = 'product';
    const cacheExpiryTime = 60;
    const currentTime = Math.floor(Date.now() / 1000);
    const cachedData = await this.redisService
      .get(key)
      .then((data) => JSON.parse(data));

    if (!cachedData || currentTime - cachedData.timestamp > cacheExpiryTime) {
      const dbData = await paginate<Product, Prisma.ProductFindManyArgs>(
        this.prismaService.product,
        {
          select: {
            ...productResponse,
          },
          where: {
            company_id: company_id,
          },
        },
        { page },
      );

      await this.redisService.set(
        key,
        JSON.stringify({ data: dbData, timestamp: currentTime }),
        'EX',
        60 * 60 * 24 * 7,
      );

      return dbData;
    }

    return cachedData.data;
  }

  async search(company_id: string, query: string) {
    const response = await this.prismaService.product.findMany({
      where: {
        company_id: company_id,
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

    const response = await this.prismaService.product.findUnique({
      where: {
        product_id,
      },
    });
    return response;
  }

  async update(product_id: string, dto: UpdateProductDto): Promise<Product> {
    await this.validateProduct(product_id);

    const response = await this.prismaService.product.update({
      data: {
        ...dto,
      },
      where: {
        product_id,
      },
    });
    return response;
  }

  async remove(product_id: string): Promise<Product> {
    await this.validateProduct(product_id);

    const response = await this.prismaService.product.delete({
      where: {
        product_id,
      },
    });
    return response;
  }
}
