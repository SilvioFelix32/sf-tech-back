import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  Headers,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { IsPublic } from '../../../security/auth/decorators/is-public.decorator';
import { IHeaders } from '../../../types/IHeaders';
import { CreateUserDto } from '../../../../application/dtos/users/create-user.dto';
import { UpdateUserDto } from '../../../../application/dtos/users/update-user.dto';
import { User } from '../../../../domain/entities/users/user.entity';
import { UsersService } from '../../../../domain/services/users/users.service';
import { IQueryPaginate } from '../../../../shared/paginator/i-query-paginate';
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({
    description: 'User successfully created.',
    status: 201,
    type: User,
  })
  @IsPublic()
  create(@Headers() header: IHeaders, @Body() createUserDto: CreateUserDto) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.usersService.create(company_id, createUserDto);
  }

  @Get()
  @IsPublic()
  @ApiResponse({ status: 200, type: [User] })
  findAll(@Headers() header: IHeaders, @Query() query: IQueryPaginate) {
    const { company_id } = header;
    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.usersService.findAll(query);
  }

  @Get('email')
  @IsPublic()
  @ApiResponse({ status: 200, type: User })
  findByUserEmail(@Body('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @IsPublic()
  @ApiResponse({ status: 200, type: User })
  findOne(@Param('id') user_id: string) {
    return this.usersService.findOne(user_id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, type: User })
  update(
    @Headers() header: IHeaders,
    @Param('id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.usersService.update(company_id, user_id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, type: User })
  remove(@Param('id') user_id: string) {
    return this.usersService.remove(user_id);
  }
}
