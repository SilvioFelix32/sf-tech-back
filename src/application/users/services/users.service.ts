import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../shared/infraestructure/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUserDto } from '../dto/find-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { userResponse } from '../dto/user-response.dto';
import { PaginatedResult, createPaginator } from 'prisma-pagination';
import { RedisService } from '../../../shared/infraestructure/cache/redis';
import { IResult } from 'src/exceptions/result';
import { ResultSuccess } from 'src/exceptions/result-success';
import { ResultError } from 'src/exceptions/result-error';
import { IPaginatedUserResponse, IUserResponse } from '../types/user-response';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(
    company_id: string,
    dto: CreateUserDto,
  ): Promise<IResult<IUserResponse> | unknown> {
    await this.validateCreateLocalUser(company_id, dto);

    try {
      const encryptedPassword = await bcrypt.hash(dto.password, 10);
      if (!encryptedPassword) {
        return new ResultError('Failed to encrypt password');
      }

      const data: Prisma.UserCreateInput = {
        company_id,
        ...dto,
        password: encryptedPassword,
      };

      const createdUser = await this.prisma.user.create({
        data,
        select: {
          ...userResponse,
        },
      });

      return new ResultSuccess(
        `User created succesfully, user_id: ${createdUser.user_id}`,
      );
    } catch (error) {
      console.error('Failed to create user', error);
      return new ResultError('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<IResult<IUserResponse> | unknown> {
    try {
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
    } catch (error) {
      console.error('Failed to find user by email', error);
      return new ResultError('Failed to find user by email');
    }
  }

  async findOne(user_id: string): Promise<IResult<IUserResponse> | unknown> {
    try {
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
    } catch (error) {
      console.error('Failed to find user by id', error);
      return new ResultError('Failed to find user by id');
    }
  }

  async findAll(
    company_id: string,
    query: FindUserDto,
  ): Promise<IPaginatedUserResponse> {
    const { page, limit } = query;
    const cacheKey = 'user';
    const cacheExpiryTime = 60; // 1 minute - Todo: aumentar o tempo de duração para 60 * 60 = 1 hora
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
      throw new InternalServerErrorException('Error retrieving Users');
    }
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

    if (!/[!@#$%^&*()-_=+{};:,<.>]/.test(data.password)) {
      throw new BadRequestException(
        'Password must contain at least one special character',
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

  private async getCache(key: string) {
    const cachedData = await this.redisService.get(key);
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
  ): Promise<PaginatedResult<User>> {
    try {
      const dbData = await this.prisma.user.findMany();
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
    data: User[],
    page: number,
    limit: number,
  ): PaginatedResult<User> {
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
