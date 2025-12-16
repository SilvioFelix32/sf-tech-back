import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { IsPublic } from 'src/infrastructure/security/auth/decorators/is-public.decorator';
import { CreateSfTechUserDto } from '../../../../application/dtos/sftech-user/create-sftech-user.dto';
import { UpdateSfTechUserDto } from '../../../../application/dtos/sftech-user/update-sftech-user.dto';
import { SfTechUserService } from '../../../../domain/services/sftech-user/sftech-user.service';

@Controller('sftech-users')
export class SfTechUserController {
  constructor(private readonly sfTechUserService: SfTechUserService) {}

  @Post()
  @IsPublic()
  async create(@Body() data: CreateSfTechUserDto) {
    return await this.sfTechUserService.create(data);
  }

  @Get(':id')
  @IsPublic()
  async findById(@Param('id') user_id: string) {
    return await this.sfTechUserService.findById(user_id);
  }

  @Patch(':id')
  @IsPublic()
  async update(
    @Param('id') user_id: string,
    @Body() data: UpdateSfTechUserDto,
  ) {
    return await this.sfTechUserService.update(user_id, data);
  }
}

