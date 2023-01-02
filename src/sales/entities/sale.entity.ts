import { User } from 'src/users/entities/user.entity';

export enum SaleStatus {
  NEW = 'NEW',
  ABANDONED = 'ABANDONED',
  CHECKOUT = 'CHECKOUT',
  PAY = 'PAY',
  FAILURE = 'FAILURE',
  FINISHED = 'FINISHED',
}

export class Sale {
  sale_id: string;
  company_id: string;
  user: User;
  user_id: string;
  session: string;
  status: SaleStatus;
  name: string;
  last_name: string;
  cellphone: string;
  email: string;
  cep: string;
  state: string;
  city: string;
  address: string;
  address_number?: string;
  address_complement?: string;
  subtotal: number;
  descount_voucher?: string;
  descount_percentage?: number;
  descount_value?: number;
  total: number;
  // items               ItemSales[]
  //sales_history       SalesHistory[]
}
