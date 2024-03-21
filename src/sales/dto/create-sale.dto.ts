import { IsNumber, IsString } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  sale_id: string;

  @IsString()
  company_id: string;

  @IsString()
  user_id: string;

  @IsNumber()
  total: number;
}
