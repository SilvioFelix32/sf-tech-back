import { PartialType } from '@nestjs/swagger';
import { CreateSfTechUserDto } from './create-sftech-user.dto';

export class UpdateSfTechUserDto extends PartialType(CreateSfTechUserDto) {}

