import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../entities/company.entity';
import { IResult } from '../../../exceptions/result';
import { ResultSuccess } from '../../../exceptions/result-success';
import { ResultError } from '../../../exceptions/result-error';
import { PrismaService } from '../../../shared/infraestructure/prisma-service/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyDto) {
    const { name, email } = data;

    try {
      const [emailTaken, nameTaken] = await Promise.all([
        this.isEmailTaken(email),
        this.isNameTaken(name),
      ]);

      if (emailTaken) {
        throw new ConflictException('Company with this email already exists');
      }

      if (nameTaken) {
        throw new ConflictException('Company with this name already exists');
      }

      return await this.prisma.company.create({ data });
    } catch (error) {
      console.error('Failed to create company', error);
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
      throw new InternalServerErrorException('Failed to fetch company');
    }
  }

  async update(
    company_id: string,
    data: UpdateCompanyDto,
  ): Promise<IResult<string>> {
    await this.validateCompany(company_id);

    try {
      await this.prisma.company.update({ data, where: { company_id } });
      return new ResultSuccess(`Company ${company_id} updated!`);
    } catch (error) {
      return new ResultError(`Failed to update company ${company_id}`);
    }
  }

  async remove(company_id: string): Promise<IResult<string>> {
    await this.validateCompany(company_id);

    try {
      await this.prisma.company.delete({ where: { company_id } });
      return new ResultSuccess(`Company ${company_id} deleted!`);
    } catch (error) {
      return new ResultError(`Failed to delete company ${company_id}`);
    }
  }

  private async validateCompany(company_id: string) {
    const company = await this.prisma.company.findUnique({
      where: { company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const companyWithEmail = await this.prisma.company.findUnique({
      where: { email },
    });

    if (!companyWithEmail) {
      return false;
    }
    return true;
  }

  private async isNameTaken(name: string): Promise<boolean> {
    const companyWithName = await this.prisma.company.findUnique({
      where: { name },
    });

    if (!companyWithName) {
      return false;
    }
    return true;
  }
}
