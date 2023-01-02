import { Company } from '../entities/company.entity';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateCompanyParamsDto } from './create-company-params.dto';
import { Type } from 'class-transformer';

export class CreateCompanyDto extends Company {
  @IsUUID()
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsOptional()
  @IsString()
  fantasy_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  cellphone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyParamsDto)
  company_params?: any;

  @IsOptional()
  @IsString()
  @IsDate()
  created_at?: string | Date;

  @IsOptional()
  @IsString()
  @IsDate()
  updated_at?: string | Date;
}
