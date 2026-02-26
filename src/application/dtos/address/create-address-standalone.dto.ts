import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { AddressPreference, AddressType } from '../sftech-user/create-address.dto';

export class CreateAddressStandaloneDto {
  @IsString()
  @IsNotEmpty()
  declare user_id: string;

  @IsEnum(AddressType)
  @IsNotEmpty()
  declare address_type: AddressType;

  @IsEnum(AddressPreference)
  @IsNotEmpty()
  declare address_preference: AddressPreference;

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

