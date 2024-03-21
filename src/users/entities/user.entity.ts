import { ApiHideProperty } from '@nestjs/swagger';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}
export class User {
  user_id?: string;

  @ApiHideProperty()
  company_id: string;
  name: string;
  lastName: string;
  email: string;
  role?: Role;

  @ApiHideProperty()
  password: string;
  @ApiHideProperty()
  createdAt?: Date | string;
  @ApiHideProperty()
  updatedAt?: Date | string;
}
