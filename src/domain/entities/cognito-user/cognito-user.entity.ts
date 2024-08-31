import { Role } from '@prisma/client';

export class CognitoUser {
  company_id: string;
  email: string;
  password: string;
  name: string;
  lastName: string;
  role: Role;
}

export class UpdateCognitoUser {
  user_id: string;
  company_id: string;
  email?: string;
  password?: string;
  name?: string;
  lastName?: string;
  role?: Role;
}
