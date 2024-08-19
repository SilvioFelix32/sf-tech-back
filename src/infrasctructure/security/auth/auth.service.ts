import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../domain/entities/users/user.entity';
import { UsersService } from '../../../domain/services/users/users.service';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(user: User): Promise<UserToken> {
    const dbUser = await this.userService.findByEmail(user.email);
    const isPasswordValid = await bcrypt.compare(
      user.password,
      dbUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (dbUser) {
      const payload: UserPayload = {
        email: dbUser.email,
        name: dbUser.name,
        sub: dbUser.user_id,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          user_id: dbUser.user_id,
          email: dbUser.email,
          lastName: dbUser.lastName,
          name: dbUser.name,
          role: dbUser.role,
        } as User,
      };
    }
  }

  async validateUser(email: string, dbPassword: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    await bcrypt.compare(user.password, dbPassword);

    if (user) {
      delete user.password;
      return { ...(user as User) };
    }

    throw new BadRequestException(
      'Email address or password provided is incorrect.',
    );
  }
}
