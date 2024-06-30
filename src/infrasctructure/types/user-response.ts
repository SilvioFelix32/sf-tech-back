import { PaginatedResult } from 'prisma-pagination';

export interface IUserResponse {
  user_id: string;
  company_id: string;
  name: string;
  lastName: string;
  email: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IPaginatedUserResponse {
  message: string;
  data: PaginatedResult<IUserResponse>;
}
