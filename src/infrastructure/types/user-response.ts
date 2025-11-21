import { PaginatedResult } from 'prisma-pagination';
import { IPaginatedResult } from './paginate-data';

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

export interface ICachedData {
  timestamp: number;
  data: IPaginatedResult<IUserResponse>;
}
