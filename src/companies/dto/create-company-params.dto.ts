import { Environment, CompanyParams } from '../entities/company-params.entity';
import { IsOptional, IsString } from 'class-validator';

export class CreateCompanyParamsDto extends CompanyParams {
  @IsString()
  environment: Environment;

  @IsOptional()
  @IsString()
  url_banner?: string;

  @IsOptional()
  @IsString()
  url_site?: string;

  @IsOptional()
  @IsString()
  url_facebook?: string;

  @IsOptional()
  @IsString()
  url_instagram?: string;

  @IsOptional()
  @IsString()
  url_linkedin?: string;

  @IsOptional()
  @IsString()
  obs_email?: string | null;

  @IsOptional()
  @IsString()
  obs_voucher?: string | null;

  @IsOptional()
  @IsString()
  privacy_policy?: string;
}
