import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCompanyDto } from '../../../application/dtos/company/create-company.dto';
import { UpdateCompanyDto } from '../../../application/dtos/company/update-company.dto';
import { Company } from '../../entities/company/company.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandler } from 'src/shared/errors/error-handler';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorHandler: ErrorHandler,
  ) {}

  async create(data: CreateCompanyDto): Promise<string> {
    const { name, email } = data;
    try {
      await this.companyExists(email, name);

      const result = await this.prismaService.company.create({ data });
      return `Company ${result.company_id} created successfully`;
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      return (await this.prismaService.company.findMany()) as Company[];
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  async findOne(company_id: string): Promise<Company> {
    try {
      const company = await this.prismaService.company.findUnique({
        where: { company_id },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      return company as Company;
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  async update(company_id: string, data: UpdateCompanyDto): Promise<string> {
    try {
      await Promise.all([
        this.companyIdExists(company_id),
        this.companyExists(String(data.email), String(data.name)),
      ]);

      const result = await this.prismaService.company.update({
        data,
        where: { company_id },
      });

      return `Company ${result.company_id} updated!`;
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  async remove(company_id: string): Promise<string> {
    try {
      await this.companyIdExists(company_id);
      await this.prismaService.company.delete({ where: { company_id } });
      return `Company ${company_id} deleted!`;
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  private async companyIdExists(company_id: string): Promise<void> {
    const response = await this.prismaService.company.findFirst({
      where: { company_id },
    });

    if (!response) {
      throw new NotFoundException('Company not found');
    }
    return;
  }

  private async companyExists(email: string, name: string): Promise<void> {
    const [validateEmail, validateName] = await Promise.all([
      this.prismaService.company.findUnique({
        where: {
          email,
        },
      }),
      this.prismaService.company.findUnique({
        where: {
          name,
        },
      }),
    ]);

    if (validateEmail || validateName) {
      throw new ConflictException(
        `Company with this ${validateEmail ? 'email' : 'name'} already exists`,
      );
    }
  }
}
