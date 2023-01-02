import { SaleStatus } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  @IsOptional()
  sale_id: string;

  @IsString()
  @IsOptional()
  company_id: string;

  @IsString()
  user_id: string;

  @IsString()
  session: string;

  @IsString()
  status: SaleStatus;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  cellphone: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  cep: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  address_number?: string;

  @IsString()
  @IsOptional()
  address_complement?: string;

  @IsNumber()
  subtotal: number;

  @IsString()
  @IsOptional()
  descount_voucher?: string;

  @IsNumber()
  @IsOptional()
  descount_percentage?: number;

  @IsNumber()
  @IsOptional()
  descount_value?: number;

  @IsNumber()
  total: number;
  // items               ItemSales[]
  //sales_history       SalesHistory[]
}
