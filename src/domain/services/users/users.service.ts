import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../../../application/dtos/users/create-user.dto';
import { FindUserDto } from '../../../application/dtos/users/find-user.dto';
import { UpdateUserDto } from '../../../application/dtos/users/update-user.dto';
import { userResponse } from '../../../application/dtos/users/user-response.dto';
import { PaginatedResult } from 'prisma-pagination';
import { RedisService } from '../redis/redis.service';
import {
  IPaginatedUserResponse,
  IUserResponse,
} from '../../../infrasctructure/types/user-response';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(company_id: string, dto: CreateUserDto): Promise<IUserResponse> {
    await this.validateCreateLocalUser(company_id, dto);

    try {
      const encryptedPassword = await bcrypt.hash(dto.password, 10);
      if (!encryptedPassword) {
        throw new InternalServerErrorException(
          'Failed to encrypt user password',
        );
      }

      const data: Prisma.UserCreateInput = {
        company_id,
        ...dto,
        password: encryptedPassword,
      };

      const createdUser = await this.prismaService.user.create({
        data,
        select: {
          ...userResponse,
        },
      });

      return createdUser;
    } catch (error) {
      console.error('Failed to create user', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<User> {
    console.log('userService.findByEmail', email);
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      console.error('Failed to find user by id', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findOne(user_id: string): Promise<IUserResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        select: {
          ...userResponse,
        },
        where: { user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      console.error('Failed to find user by id', error);
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find user by id');
    }
  }

  async findAll(query: FindUserDto): Promise<IPaginatedUserResponse> {
    const { page, limit } = query;
    const cacheKey = 'user';
    const cacheExpiryTime = 60 * 60; // 1 minute - Todo: aumentar o tempo de duração para 60 * 60 = 1 hora
    const currentTime = Math.floor(Date.now() / 1000);

    try {
      const cachedData = await this.getCache(cacheKey);
      if (!cachedData || currentTime - cachedData.timestamp > cacheExpiryTime) {
        const dbData = await this.fetchAndCacheUsers(
          page,
          limit,
          cacheKey,
          cacheExpiryTime,
        );

        return {
          message: 'Users retrieved from database',
          data: dbData,
        };
      }

      const paginatedCacheData = this.paginateData(
        cachedData.data,
        page,
        limit,
      );

      return {
        message: 'Users retrieved from cache',
        data: paginatedCacheData,
      };
    } catch (error) {
      console.error('Error retrieving Users from cache', error as Error);
      throw new Error('Error retrieving Users');
    }
  }

  async update(
    company_id: string,
    user_id: string,
    dto: UpdateUserDto,
  ): Promise<IUserResponse> {
    await this.validateUpdateLocalUser(user_id);

    try {
      return await this.prismaService.user.update({
        data: {
          ...dto,
          company_id,
          user_id,
        },
        select: {
          ...userResponse,
        },
        where: { user_id },
      });
    } catch (error) {
      console.error('Failed to update user', error);
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  async remove(user_id: string): Promise<string> {
    await this.validateUpdateLocalUser(user_id);

    try {
      await this.prismaService.user.delete({ where: { user_id } });
      return `User ${user_id} deleted`;
    } catch (error) {
      console.error('Failed to delete user', error);
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to delete user ${user_id}`);
    }
  }

  private async isEmailTakenInCompany(company_id: string, email: string) {
    const usersWithEmail = await this.prismaService.user.findMany({
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

    if (!data.password) {
      throw new BadRequestException('No password provided');
    }

    if (data.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (!/[A-Z]/.test(data.password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!/\d/.test(data.password)) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }

    if (!/[\!\@\#\$\%\^\&\*\(\)\-\_\=\+\{\}\;\:\,\<\.\>]/.test(data.password)) {
      throw new BadRequestException(
        'Password must contain at least one special character',
      );
    }
  }

  private async validateUpdateLocalUser(user_id: string) {
    const userData = await this.findOne(user_id);
    if (!userData) {
      throw new NotFoundException('User not found');
    }

    const { email } = userData;

    if (
      email &&
      email !== userData.email &&
      (await this.isEmailTakenInCompany(userData.company_id, email))
    ) {
      throw new BadRequestException(
        'User with this email already exists in this company',
      );
    }
  }

  private async getCache(key: string) {
    const cachedData = await this.redisService.get(key);
    console.log(`Retrieved cache for key: ${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setCache(key: string, data: any, ttl: number) {
    console.log(`Setting cache for key: ${key}, data:`, data.data.length);
    await this.redisService.set(key, JSON.stringify(data), 'EX', ttl);
  }

  private async fetchAndCacheUsers(
    page: number,
    limit: number,
    cacheKey: string,
    cacheExpiryTime: number,
  ): Promise<PaginatedResult<IUserResponse>> {
    try {
      const dbData = await this.prismaService.user.findMany({
        select: {
          ...userResponse,
        },
      });
      await this.setCache(
        cacheKey,
        { data: dbData, timestamp: Math.floor(Date.now() / 1000) },
        cacheExpiryTime,
      );

      const paginatedDbData = this.paginateData(dbData, page, limit);

      return paginatedDbData;
    } catch (error) {
      console.error('Error fetching and caching Users', error as Error);
      throw new InternalServerErrorException(
        'Error fetching and caching Users',
      );
    }
  }

  private paginateData(
    data: IUserResponse[],
    page: number,
    limit: number,
  ): PaginatedResult<IUserResponse> {
    if (!data) {
      throw new Error('Data not found');
    }
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data: paginatedData,
      meta: {
        total: totalItems,
        lastPage: totalPages,
        currentPage: page,
        perPage: limit ? limit : 20,
        prev: prevPage,
        next: nextPage,
      },
    };
  }
}
