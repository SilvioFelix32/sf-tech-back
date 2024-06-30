import { Company } from '../../../domain/entities/company/company.entity';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto extends Company {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  fantasyName?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  urlBanner?: string;
}
