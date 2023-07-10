import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { CompaniesService } from '../../companies/services/companies.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUserDto } from '../dto/find-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { userAuthResponse, userResponse } from '../dto/user-response.dto';
import { createPaginator } from 'prisma-pagination';
import { RedisService } from '../../shared/cache/redis';
export interface IUser {
  findOneByUserName(user_name: string): Promise<User | undefined>;
}
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
    private readonly redis: RedisService,
  ) {}

  private async validateCreateLocalUser(
    company_id: string,
    data: CreateUserDto,
  ) {
    const { email, document } = data;

    if (!company_id) {
      throw new BadRequestException('User needs a company ID');
    }

    const validateUserEmail = await this.prisma.company.findMany({
      where: {
        id: company_id,
        users: {
          some: {
            email,
          },
        },
      },
    });

    if (validateUserEmail.length > 0) {
      throw new BadRequestException(
        'User with email already informed in this company',
      );
    }
    const validateUserDocument = await this.prisma.company.findMany({
      where: {
        id: company_id,
        users: {
          some: {
            document,
          },
        },
      },
    });

    if (validateUserDocument.length > 0) {
      throw new BadRequestException(
        'User with document already informed in this company',
      );
    }
  }

  private async validateUpdateLocalUser(
    company_id: string,
    data: UpdateUserDto,
    updateUser: User,
  ) {
    if (!updateUser) {
      throw new NotFoundException('User not found');
    }

    const company = await this.companiesService.findOne(company_id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const { email, document } = data;

    if (email) {
      const validateUserEmail = await this.prisma.company.findMany({
        where: {
          id: company_id,
          users: {
            some: {
              email,
            },
          },
        },
      });

      if (validateUserEmail.length > 0) {
        throw new BadRequestException(
          'User with email already informed in this company',
        );
      }
    }

    if (document) {
      const validateUserDocument = await this.prisma.company.findMany({
        where: {
          id: company_id,
          users: {
            some: {
              document,
            },
          },
        },
      });

      if (validateUserDocument.length > 0) {
        throw new BadRequestException(
          'User with document already informed in this company',
        );
      }
    }
  }

  async create(
    company_id: string,
    dto: CreateUserDto,
  ): Promise<User | unknown> {
    await this.validateCreateLocalUser(company_id, dto);

    const encriptedPassword = bcrypt.hash(dto.password, 10);

    const data: Prisma.UserCreateInput = {
      company_id,
      password: encriptedPassword,
      ...dto,
    };

    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | unknown> {
    const user = this.prisma.user.findUnique({
      where: { email },
      select: {
        ...userAuthResponse,
      },
    });

    if (!user) {
      throw new BadRequestException('User not Found');
    }

    return user;
  }

  async findOne(user_id: string): Promise<User | unknown> {
    const user = this.prisma.user.findUnique({
      where: { user_id },
      select: {
        ...userResponse,
      },
    });

    if (!user) {
      throw new BadRequestException('User not Found');
    }

    return user;
  }

  async findAll(
    company_id: string,
    query: FindUserDto,
  ): Promise<User[] | unknown> {
    const company = this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const cachedUsers = await this.redis.get('user');

    if (!cachedUsers) {
      const response = await paginate<User, Prisma.UserFindManyArgs>(
        this.prisma.user,
        {
          where: {
            company_id,
          },
          select: {
            ...userResponse,
          },
        },
        { page: page },
      );

      await this.redis.set('user', JSON.stringify(response), 'EX', 1800);
      return response;
    }

    return JSON.parse(cachedUsers);
  }

  async update(
    company_id: string,
    user_id: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    const updateUser = await this.findOne(user_id);
    await this.validateUpdateLocalUser(company_id, dto, updateUser as User);

    return this.prisma.user.update({
      where: { user_id },
      data: {
        ...dto,
      },
    });
  }

  async remove(user_id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { user_id },
    });
  }
}
