import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infraestructure/prisma/prisma.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../entities/company.entity';
import { IResult } from 'src/exceptions/result';
import { ResultSuccess } from 'src/exceptions/result-success';
import { ResultError } from 'src/exceptions/result-error';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private async isEmailTaken(email: string): Promise<boolean> {
    const companyWithEmail = await this.prisma.company.findUnique({
      where: { email },
    });
    return !!companyWithEmail;
  }

  private async isNameTaken(name: string): Promise<boolean> {
    const companyWithName = await this.prisma.company.findUnique({
      where: { name },
    });
    return !!companyWithName;
  }

  async create(data: CreateCompanyDto) {
    const { name, email } = data;

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
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async findOne(company_id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(
    company_id: string,
    data: UpdateCompanyDto,
  ): Promise<IResult<string>> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { company_id },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    try {
      await this.prisma.company.update({ data, where: { company_id } });
      return new ResultSuccess(`Company ${company_id} updated!`);
    } catch (error) {
      return new ResultError(`Failed to update company ${company_id}`);
    }
  }

  async remove(company_id: string): Promise<IResult<string>> {
    const existingCompany = await this.prisma.company.findUnique({
      where: { company_id },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    try {
      await this.prisma.company.delete({ where: { company_id } });
      return new ResultSuccess(`Company ${company_id} deleted!`);
    } catch (error) {
      return new ResultError(`Failed to delete company ${company_id}`);
    }
  }
}
