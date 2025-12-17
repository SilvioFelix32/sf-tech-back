import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { AddressType } from '../sftech-user/create-address.dto';

export class CreateAddressStandaloneDto {
  @IsString()
  @IsNotEmpty()
  declare user_id: string;

  @IsEnum(AddressType)
  @IsNotEmpty()
  declare address_type: AddressType;

  @IsEnum(AddressType)
  @IsNotEmpty()
  declare address_preference: AddressType;

  @IsString()
  @IsNotEmpty()
  declare street: string;

  @IsString()
  @IsNotEmpty()
  declare number: string;

  @IsString()
  @IsNotEmpty()
  declare neighborhood: string;

  @IsString()
  @IsNotEmpty()
  declare city: string;

  @IsString()
  @IsNotEmpty()
  declare cep: string;
}

