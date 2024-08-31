import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { CognitoQueryPaginateDto } from '../../../shared/paginator/query-paginate.dto';

export class FindUserDto extends CognitoQueryPaginateDto {
  @IsString()
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEmail()
  @IsOptional()
  @IsString()
  email: string;
}
