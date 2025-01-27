import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  declare title: string;

  @IsString()
  @IsOptional()
  declare description?: string;

  @IsOptional()
  declare products?: any;
}
