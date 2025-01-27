import { ApiHideProperty } from '@nestjs/swagger';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}
export class User {
  user_id?: string;

  @ApiHideProperty()
  declare company_id: string;
  declare name: string;
  declare lastName: string;
  declare email: string;
  role?: Role;

  @ApiHideProperty()
  declare password: string;
  @ApiHideProperty()
  createdAt?: Date | string;
  @ApiHideProperty()
  updatedAt?: Date | string;
}
