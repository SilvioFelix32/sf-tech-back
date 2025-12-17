import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from './create-address.dto';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export class CreateSfTechUserDto {
  @IsString()
  @IsNotEmpty()
  declare user_id: string;

  @IsString()
  @IsNotEmpty()
  declare first_name: string;

  @IsString()
  @IsNotEmpty()
  declare last_name: string;

  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @IsString()
  @IsNotEmpty()
  declare cpf: string;

  @IsString()
  @IsNotEmpty()
  declare cellphone: string;

  @IsString()
  @IsNotEmpty()
  declare birthdate: string;

  @IsEnum(Gender)
  @IsOptional()
  declare gender?: Gender;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  @IsOptional()
  declare addresses?: CreateAddressDto[];
}

