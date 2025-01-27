import { Company } from '../../../domain/entities/company/company.entity';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsOptional()
  @IsString()
  declare fantasyName?: string;

  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @IsOptional()
  @IsString()
  declare urlBanner?: string;
}
