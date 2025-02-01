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

  async login(user: User): Promise<UserToken | null> {
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
      } as UserToken;
    }
    return null;
  }

  async validateUser(email: string, dbPassword: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    await bcrypt.compare(user.password, dbPassword);

    if (!user) {
      throw new BadRequestException(
        'Email address or password provided is incorrect.',
      );
    }

    return this.buildUserResponse(user as User);
  }

  private buildUserResponse(user: User) {
    return {
      user_id: user.user_id,
      company_id: user.company_id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    } as User;
  }
}
