import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/services/users.service';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(user: User): Promise<UserToken> {
    const dbUser: Partial<User> = await this.userService.findByEmail(
      user.email,
    );

    await this.validatePassword(user.password, dbUser.password);
    if (dbUser) {
      const payload: UserPayload = {
        email: dbUser.email,
        name: dbUser.name,
        sub: dbUser.user_id,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          email: dbUser.email,
          lastName: dbUser.lastName,
          name: dbUser.name,
          role: dbUser.role,
          user_id: dbUser.user_id,
        },
      };
    }
  }

  async validateUser(email: string, dbPassword: string): Promise<User | null> {
    const user: Partial<User> | null = await this.userService.findByEmail(
      email,
    );
    await this.validatePassword(user.password, dbPassword);

    if (user) {
      delete user.password;
      return { ...(user as User) };
    }

    throw new BadRequestException(
      'Email address or password provided is incorrect.',
    );
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ) {
    if (plainPassword != hashedPassword) {
      throw new BadRequestException('Password provided is incorrect.');
    }
  }
}
