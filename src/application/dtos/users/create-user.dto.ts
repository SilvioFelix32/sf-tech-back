import { ApiHideProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
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
  @ApiHideProperty()
  role?: Role;

  @IsString()
  @ApiHideProperty()
  password: string;

  @ApiHideProperty()
  createdAt?: Date | string;

  @ApiHideProperty()
  updatedAt?: Date | string;
}
