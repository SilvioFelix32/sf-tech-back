import { User } from '../../../../domain/entities/users/user.entity';
export interface UserToken {
  access_token: string;
  user: Partial<User>;
}
