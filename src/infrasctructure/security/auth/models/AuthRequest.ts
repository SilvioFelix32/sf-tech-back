import { Request } from 'express';
import { User } from '../../../../domain/entities/users/user.entity';

export interface AuthRequest extends Request {
  user: User;
}
