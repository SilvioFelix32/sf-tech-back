import { ApiHideProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role, User } from '../../../domain/entities/users/user.entity';

export class CreateUserDto extends User {
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsString()
  @IsNotEmpty()
  declare lastName: string;

  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @IsString()
  @IsOptional()
  declare role?: Role;

  @IsString()
  @ApiHideProperty()
  declare password: string;

  @ApiHideProperty()
  @IsOptional()
  declare createdAt?: Date | string;

  @ApiHideProperty()
  @IsOptional()
  declare updatedAt?: Date | string;
}
