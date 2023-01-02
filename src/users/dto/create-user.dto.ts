import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Role, Sex, User } from '../entities/user.entity';

export class CreateUserDto extends User {
  @IsUUID()
  @IsString()
  @IsOptional()
  @ApiProperty()
  user_id?: string;

  @IsUUID()
  @IsString()
  @IsOptional()
  company_id: string;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  name: string;

  @IsString()
  last_name: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birth_date?: Date | null;

  @IsOptional()
  @IsString()
  sex_type?: Sex | null;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  celphone?: string | null;

  @IsString()
  @IsOptional()
  cep?: string | null;

  @IsString()
  @IsOptional()
  state?: string | null;

  @IsString()
  @IsOptional()
  city?: string | null;

  @IsString()
  @IsOptional()
  neighborhood?: string | null;

  @IsString()
  @IsOptional()
  address?: string | null;

  @IsString()
  @IsOptional()
  address_number?: string | null;

  @IsString()
  @IsOptional()
  address_complement?: string | null;

  @IsBoolean()
  @IsOptional()
  active?: boolean | null;

  @IsString()
  @ApiProperty()
  @ApiHideProperty()
  role?: Role;

  @IsString()
  @ApiProperty()
  @ApiHideProperty()
  password: string;

  @ApiProperty()
  @ApiHideProperty()
  created_at?: Date | string;

  @ApiProperty()
  @ApiHideProperty()
  updated_at?: Date | string;
}
