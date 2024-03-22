import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductCategory } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from '../../../shared/infraestructure/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { categoryResponse } from '../dto/category-response';
import { FindCategoryDto } from '../dto/find-category.dto';
import { RedisService } from '../../../shared/infraestructure/cache/redis';
import { Category } from '../entities/category.entity';
import { IResult } from 'src/exceptions/result';
import { ResultSuccess } from 'src/exceptions/result-success';
import { ResultError } from 'src/exceptions/result-error';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private validateCompany(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No company_id informed');
    }
  }

  private async validateProduct(category_id: string) {
    const verifyIfProductExists =
      await this.prismaService.productCategory.findUnique({
        where: { category_id },
      });

    if (!verifyIfProductExists) {
      throw new NotFoundException('Product not found');
    }
  }

  async create(
    company_id: string,
    dto: CreateCategoryDto,
  ): Promise<Category | unknown> {
    this.validateCompany(company_id);

    const data: Prisma.ProductCategoryCreateInput = {
      company: { connect: { company_id } },
      ...dto,
    };

    return this.prismaService.productCategory.create({
      data,
    });
  }

  async findAll(
    company_id: string,
    query: FindCategoryDto,
  ): Promise<IResult<ProductCategory>> {
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const key = 'productCategory';
    const cacheExpiryTime = 60;
    const currentTime = Math.floor(Date.now() / 1000);
    const cachedData = await this.redisService
      .get(key)
      .then((data) => JSON.parse(data));

    if (
      !cachedData.data ||
      currentTime - cachedData.timestamp > cacheExpiryTime
    ) {
      try {
        const dbData = await paginate<
          ProductCategory,
          Prisma.ProductCategoryFindManyArgs
        >(
          this.prismaService.productCategory,
          {
            select: {
              ...categoryResponse,
            },
            where: {
              company_id,
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

        return new ResultSuccess(dbData as unknown as ProductCategory);
      } catch (error) {
        return new ResultError('Error on fetch users');
      }
    }

    return new ResultSuccess(cachedData.data);
  }

  async findOne(category_id: string): Promise<Category> {
    await this.validateProduct(category_id);

    const response = await this.prismaService.productCategory.findUnique({
      where: {
        category_id,
      },
    });
    return response;
  }

  async update(category_id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.validateProduct(category_id);

    const response = await this.prismaService.productCategory.update({
      data: {
        ...dto,
      },
      where: {
        category_id,
      },
    });
    return response;
  }

  async remove(category_id: string): Promise<Category> {
    await this.validateProduct(category_id);

    const response = await this.prismaService.productCategory.delete({
      where: {
        category_id,
      },
    });
    return response;
  }
}
