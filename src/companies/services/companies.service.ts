import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCreation(data: CreateCompanyDto) {
    const { name, document, email } = data;

    const comanyEmail = await this.prisma.company.findUnique({
      where: { email },
    });

    if (comanyEmail) {
      throw new BadRequestException('Company with email already informed');
    }

    const companyDocument = await this.prisma.company.findUnique({
      where: { document },
    });

    if (companyDocument) {
      throw new BadRequestException('Company with document already informed');
    }

    const companyName = await this.prisma.company.findUnique({
      where: { name },
    });

    if (companyName) {
      throw new BadRequestException('Company with name already informed');
    }
  }

  async create(data: CreateCompanyDto) {
    await Promise.all([this.validateCreation(data)]);

    return await this.prisma.company.create({ data });
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async findOne(company_id: string): Promise<Company> {
    const company = this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(company_id: string, data: UpdateCompanyDto) {
    const { document } = data;

    if (document) {
      const findCompanyDocument = await this.prisma.company.findUnique({
        where: { document },
      });

      if (findCompanyDocument && findCompanyDocument.id !== company_id) {
        throw new HttpException(
          'document already exists in the database',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const findCompanyUpdate = await this.findOne(company_id);

    if (!findCompanyUpdate) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.company.update({ where: { id: company_id }, data });
  }

  async remove(company_id: string) {
    return this.prisma.company.delete({ where: { id: company_id } });
  }
}
