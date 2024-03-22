import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../shared/infraestructure/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUserDto } from '../dto/find-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { userResponse } from '../dto/user-response.dto';
import { createPaginator } from 'prisma-pagination';
import { RedisService } from '../../../shared/infraestructure/cache/redis';
import { IResult } from 'src/exceptions/result';
import { ResultSuccess } from 'src/exceptions/result-success';
import { ResultError } from 'src/exceptions/result-error';
import { IUserResponse } from '../types/user-response';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async isEmailTakenInCompany(company_id: string, email: string) {
    const usersWithEmail = await this.prisma.user.findMany({
      where: {
        company_id,
        email,
      },
    });

    return usersWithEmail.length > 0;
  }

  private async validateCreateLocalUser(
    company_id: string,
    data: CreateUserDto,
  ) {
    const { email } = data;

    if (!company_id) {
      throw new BadRequestException('User needs a company ID');
    }

    if (await this.isEmailTakenInCompany(company_id, email)) {
      throw new BadRequestException(
        'User with this email already exists in this company',
      );
    }
  }

  private async validateUpdateLocalUser(
    company_id: string,
    dto: UpdateUserDto,
    updateUser: User | null,
  ) {
    if (!updateUser) {
      throw new NotFoundException('User not found');
    }

    if (updateUser.company_id !== company_id) {
      throw new BadRequestException('User does not belong to this company');
    }

    const { email } = dto;

    if (
      email &&
      email !== updateUser.email &&
      (await this.isEmailTakenInCompany(company_id, email))
    ) {
      throw new BadRequestException(
        'User with this email already exists in this company',
      );
    }
  }

  async create(
    company_id: string,
    dto: CreateUserDto,
  ): Promise<IResult<IUserResponse> | unknown> {
    await this.validateCreateLocalUser(company_id, dto);

    const encryptedPassword = await bcrypt.hash(dto.password, 10);

    const data: Prisma.UserCreateInput = {
      company_id,
      password: encryptedPassword,
      ...dto,
    };

    return this.prisma.user.create({
      data,
      select: {
        ...userResponse,
      },
    });
  }

  async findByEmail(email: string): Promise<IResult<IUserResponse> | unknown> {
    const user = await this.prisma.user.findUnique({
      select: {
        ...userResponse,
      },
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOne(user_id: string): Promise<IResult<IUserResponse> | unknown> {
    const user = await this.prisma.user.findUnique({
      select: {
        ...userResponse,
      },
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(
    company_id: string,
    query: FindUserDto,
  ): Promise<User[] | unknown> {
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const key = 'user';
    const cachedUsers = await this.redis.get(key);

    if (!cachedUsers) {
      const response = await paginate<User, Prisma.UserFindManyArgs>(
        this.prisma.user,
        {
          select: {
            ...userResponse,
          },
          where: {
            company_id,
          },
        },
        { page },
      );

      await this.redis.set(
        key,
        JSON.stringify(response),
        'EX',
        7 * 24 * 60 * 60,
      ); //7 days
      return response;
    }

    return JSON.parse(cachedUsers);
  }

  async update(
    company_id: string,
    user_id: string,
    dto: UpdateUserDto,
  ): Promise<User | unknown> {
    const updateUser = await this.findOne(user_id);
    await this.validateUpdateLocalUser(company_id, dto, updateUser as User);

    return this.prisma.user.update({
      data: {
        ...dto,
      },
      select: {
        ...userResponse,
      },
      where: { user_id },
    });
  }

  async remove(user_id: string): Promise<IResult<string>> {
    const user = await this.findOne(user_id);
    if (!user) {
      return new ResultError(`User ${user_id} don't exists`);
    }

    try {
      await this.prisma.user.delete({ where: { user_id } });
      return new ResultSuccess('User deleted');
    } catch (error) {
      return new ResultError(`Failed to delete user ${user_id}`);
    }
  }
}
