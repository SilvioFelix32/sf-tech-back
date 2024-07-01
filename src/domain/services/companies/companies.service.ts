import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCompanyDto } from '../../../application/dtos/company/create-company.dto';
import { UpdateCompanyDto } from '../../../application/dtos/company/update-company.dto';
import { Company } from '../../entities/company/company.entity';
import { IResult } from '../../../application/exceptions/result';
import { ResultSuccess } from '../../../application/exceptions/result-success';
import { ResultError } from '../../../application/exceptions/result-error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyDto): Promise<Company> {
    const { name, email } = data;

    try {
      const isCompanyExists = await this.validateCreateCompany(email, name);

      if (isCompanyExists.email) {
        throw new ConflictException('Company with this email already exists');
      }

      if (isCompanyExists.name) {
        throw new ConflictException('Company with this name already exists');
      }

      return await this.prisma.company.create({ data });
    } catch (error) {
      console.error('Failed to create company', error);
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create company');
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      return await this.prisma.company.findMany();
    } catch (error) {
      console.error('Failed to fetch companies', error);
      throw new InternalServerErrorException('Failed to fetch companies');
    }
  }

  async findOne(company_id: string): Promise<Company> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { company_id },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      return company;
    } catch (error) {
      console.error('Failed to fetch company', error);
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch company');
    }
  }

  async update(company_id: string, data: UpdateCompanyDto): Promise<Company> {
    await this.validateCompany(company_id);

    try {
      return await this.prisma.company.update({ data, where: { company_id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update company ${company_id}`,
      );
    }
  }

  async remove(company_id: string): Promise<string> {
    await this.validateCompany(company_id);

    try {
      await this.prisma.company.delete({ where: { company_id } });
      return `Company ${company_id} deleted!`;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete company ${company_id}`,
      );
    }
  }

  private async validateCompany(company_id: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  private async validateCreateCompany(
    email: string,
    name: string,
  ): Promise<{ email: boolean; name: boolean }> {
    const existingCompany = await this.prisma.company.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
      select: {
        email: true,
        name: true,
      },
    });

    return {
      email: !!existingCompany?.email,
      name: !!existingCompany?.name,
    };
  }
}
