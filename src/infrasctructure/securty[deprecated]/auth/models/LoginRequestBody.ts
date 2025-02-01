import { IsEmail, IsString } from 'class-validator';

export class LoginRequestBody {
  @IsEmail()
  declare email: string;

  @IsString()
  declare password: string;
}
