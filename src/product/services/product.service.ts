import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductDto } from '../dto/find-product.dto';
import { productReponse } from '../dto/product-response';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateProduct(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('No company ID informed');
    }
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

  findAll(
    company_id: string,
    dto: FindProductDto,
  ): Promise<Product[] | unknown> {
    return this.prisma.product.findMany({
      where: {
        company_id,
        ...dto,
      },
      select: {
        ...productReponse,
      },
    });
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
