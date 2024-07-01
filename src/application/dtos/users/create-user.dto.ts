import { ApiHideProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role, User } from '../../../domain/entities/users/user.entity';

export class CreateUserDto extends User {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  role?: Role;

  @IsString()
  @ApiHideProperty()
  password: string;

  @ApiHideProperty()
  @IsOptional()
  createdAt?: Date | string;

  @ApiHideProperty()
  @IsOptional()
  updatedAt?: Date | string;
}
