import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

export interface AuthRequest extends Request {
  user: User;
}
