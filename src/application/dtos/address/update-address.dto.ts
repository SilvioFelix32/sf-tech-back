import { PartialType } from '@nestjs/swagger';
import { CreateAddressStandaloneDto } from './create-address-standalone.dto';

export class UpdateAddressDto extends PartialType(CreateAddressStandaloneDto) {}

