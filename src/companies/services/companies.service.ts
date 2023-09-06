import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private async isEmailTaken(email: string) {
    const companyWithEmail = await this.prisma.company.findUnique({
      where: { email },
    });
    return !!companyWithEmail;
  }

  private async isDocumentTaken(document: string) {
    const companyWithDocument = await this.prisma.company.findUnique({
      where: { document },
    });
    return !!companyWithDocument;
  }

  private async isNameTaken(name: string) {
    const companyWithName = await this.prisma.company.findUnique({
      where: { name },
    });
    return !!companyWithName;
  }

  async create(data: CreateCompanyDto) {
    const { name, document, email } = data;

    if (await this.isEmailTaken(email)) {
      throw new ConflictException('Company with this email already exists');
    }

    if (await this.isDocumentTaken(document)) {
      throw new ConflictException('Company with this document already exists');
    }

    if (await this.isNameTaken(name)) {
      throw new ConflictException('Company with this name already exists');
    }

    return await this.prisma.company.create({ data });
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async findOne(company_id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(company_id: string, data: UpdateCompanyDto) {
    const { document } = data;
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    if (
      document &&
      document !== existingCompany.document &&
      (await this.isDocumentTaken(document))
    ) {
      throw new ConflictException('Document already exists in the database');
    }

    return this.prisma.company.update({ where: { id: company_id }, data });
  }

  async remove(company_id: string) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.delete({ where: { id: company_id } });
  }
}
