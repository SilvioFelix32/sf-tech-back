import { Address } from '../address/address.entity';

export class SfTechUser {
  user_id?: string;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare cpf: string;
  declare cellphone: string;
  declare birthdate: string;
  declare gender: 'Male' | 'Female' | 'Other';
  addresses?: Address[];

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

