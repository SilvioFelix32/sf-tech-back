import { IsNumber, IsString } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  declare sale_id: string;

  @IsString()
  declare company_id: string;

  @IsString()
  declare user_id: string;

  @IsNumber()
  declare total: number;
}
