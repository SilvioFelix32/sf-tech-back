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
import { IPaginateDto } from '../../shared/paginator/paginate.interface.dto';
import { IsPublic } from '../../auth/decorators/is-public.decorator';
import { IHeaders } from '../../shared/IHeaders';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUserDto } from '../dto/find-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
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
  findAll(
    @Headers() header: IHeaders,
    @Query() query: FindUserDto,
  ): Promise<IPaginateDto | unknown> {
    const { company_id } = header;

    if (!company_id) {
      throw new BadRequestException('No Company informed');
    }

    return this.usersService.findAll(company_id, query);
  }

  @Get('email')
  @IsPublic()
  @ApiResponse({ status: 200, type: User })
  findByUserEmail(@Body('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
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
