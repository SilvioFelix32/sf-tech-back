import { CompanyParams } from './company-params.entity';
export class Company {
  id?: string;
  name: string;
  fantasy_name?: string;
  document: string;
  phone?: string;
  cellphone: string;
  email: string;

  company_params?: CompanyParams;

  created_at?: string | Date;
  updated_at?: string | Date;
}
