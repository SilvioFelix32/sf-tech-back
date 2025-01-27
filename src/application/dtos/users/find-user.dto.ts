import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPaginateDto } from '../../../shared/paginator/query-paginate.dto';

export class FindUserDto extends QueryPaginateDto {
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
  declare name: string;

  @IsString()
  @IsOptional()
  declare lastName: string;

  @IsEmail()
  @IsOptional()
  @IsString()
  declare email: string;
}
