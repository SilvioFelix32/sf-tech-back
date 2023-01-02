import { ApiHideProperty } from '@nestjs/swagger';

export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
export class User {
  user_id?: string;

  @ApiHideProperty()
  company_id: string;
  document: string;
  name: string;
  last_name: string;
  sex_type?: Sex;
  birth_date?: Date;
  celphone?: string | null;
  email: string;
  cep?: string | null;
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  role?: Role;
  @ApiHideProperty()
  active?: boolean | null;
  @ApiHideProperty()
  password: string;

  @ApiHideProperty()
  created_at?: Date | string;
  @ApiHideProperty()
  updated_at?: Date | string;
}
