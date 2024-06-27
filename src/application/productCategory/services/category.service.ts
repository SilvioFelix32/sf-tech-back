import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
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
import { ProductService } from 'src/application/product/services/product.service';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  //TODO: adicionar criação no redis também
  async create(
    company_id: string,
    dto: CreateCategoryDto,
  ): Promise<Category | unknown> {
    const data: Prisma.ProductCategoryCreateInput = {
      ...dto,
      company: { connect: { company_id } },
    };

    return this.prismaService.productCategory.create({
      data,
    });
  }

  async findAll(
    company_id: string,
    query: FindCategoryDto,
  ): Promise<ProductCategory | null> {
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

        return dbData.data as unknown as ProductCategory;
      } catch (error) {
        throw new InternalServerErrorException('Error on fetch users');
      }
    }

    return cachedData.data;
  }

  async findOne(category_id: string): Promise<Category> {
    await this.validateCategory(category_id);

    const response = await this.prismaService.productCategory.findUnique({
      where: {
        category_id,
      },
    });
    return response;
  }

  async update(category_id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.validateCategory(category_id);

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
    await this.validateCategory(category_id);

    const response = await this.prismaService.productCategory.delete({
      where: {
        category_id,
      },
    });
    return response;
  }

  private async validateCategory(category_id: string) {
    const verifyIfProductExists =
      await this.prismaService.productCategory.findUnique({
        where: { category_id },
      });

    if (!verifyIfProductExists) {
      throw new NotFoundException('Product not found');
    }
  }
}
