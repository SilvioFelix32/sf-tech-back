import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role, User } from '../entities/user.entity';

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
  @ApiProperty()
  @ApiHideProperty()
  role?: Role;

  @IsString()
  @ApiProperty()
  @ApiHideProperty()
  password: string;

  @ApiProperty()
  @ApiHideProperty()
  createdAt?: Date | string;

  @ApiProperty()
  @ApiHideProperty()
  updatedAt?: Date | string;
}
