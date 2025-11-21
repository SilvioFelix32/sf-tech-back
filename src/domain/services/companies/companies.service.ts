import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCompanyDto } from '../../../application/dtos/company/create-company.dto';
import { UpdateCompanyDto } from '../../../application/dtos/company/update-company.dto';
import { Company } from '../../entities/company/company.entity';
import { DatabaseService } from '../database/database.service';
import { ErrorHandler } from 'src/shared/errors/error-handler';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly errorHandler: ErrorHandler,
  ) { }

  async create(data: CreateCompanyDto): Promise<string> {
    const { name, email } = data;
    try {
      await this.companyExists(email, name);

      const result = await this.databaseService.company.create({ data });
      return `Company ${result.company_id} created successfully`;
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      return (await this.databaseService.company.findMany()) as Company[];
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  async findOne(company_id: string): Promise<Company> {
    try {
      const company = await this.databaseService.company.findUnique({
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

      const result = await this.databaseService.company.update({
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
      await this.databaseService.company.delete({ where: { company_id } });
      return `Company ${company_id} deleted!`;
    } catch (error) {
      throw this.errorHandler.handle(error);
    }
  }

  private async companyIdExists(company_id: string): Promise<void> {
    const response = await this.databaseService.company.findFirst({
      where: { company_id },
    });

    if (!response) {
      throw new NotFoundException('Company not found');
    }
    return;
  }

  private async companyExists(email: string, name: string): Promise<void> {
    const [validateEmail, validateName] = await Promise.all([
      this.databaseService.company.findUnique({
        where: {
          email,
        },
      }),
      this.databaseService.company.findUnique({
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
