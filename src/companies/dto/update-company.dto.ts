import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEmail, ValidateNested } from 'class-validator';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
