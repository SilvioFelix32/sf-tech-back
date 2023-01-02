import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompaniesService } from '../services/companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @IsPublic()
  async create(@Body() data: CreateCompanyDto) {
    return await this.companiesService.create(data);
  }

  @Get()
  @IsPublic()
  async findAll() {
    return await this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') company_id: string) {
    return await this.companiesService.findOne(company_id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateCompanyDto) {
    return await this.companiesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.companiesService.remove(id);

    return;
  }
}
