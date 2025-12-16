import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export enum AddressType {
  House = 'House',
  Work = 'Work',
  Temporary = 'Temporary',
}

export class CreateAddressDto {
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

