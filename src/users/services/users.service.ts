import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
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

  private async isDocumentTakenInCompany(company_id: string, document: string) {
    const usersWithDocument = await this.prisma.user.findMany({
      where: {
        company_id,
        document,
      },
    });

    return usersWithDocument.length > 0;
  }

  private async validateCreateLocalUser(
    company_id: string,
    data: CreateUserDto,
  ) {
    const { email, document } = data;

    if (!company_id) {
      throw new BadRequestException('User needs a company ID');
    }

    if (await this.isEmailTakenInCompany(company_id, email)) {
      throw new BadRequestException(
        'User with this email already exists in this company',
      );
    }

    if (await this.isDocumentTakenInCompany(company_id, document)) {
      throw new BadRequestException(
        'User with this document already exists in this company',
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

    const { email, document } = dto;

    if (
      email &&
      email !== updateUser.email &&
      (await this.isEmailTakenInCompany(company_id, email))
    ) {
      throw new BadRequestException(
        'User with this email already exists in this company',
      );
    }

    if (
      document &&
      document !== updateUser.document &&
      (await this.isDocumentTakenInCompany(company_id, document))
    ) {
      throw new BadRequestException(
        'User with this document already exists in this company',
      );
    }
  }

  async create(
    company_id: string,
    dto: CreateUserDto,
  ): Promise<User | unknown> {
    await this.validateCreateLocalUser(company_id, dto);

    const encryptedPassword = await bcrypt.hash(dto.password, 10);

    const data: Prisma.UserCreateInput = {
      company_id,
      password: encryptedPassword,
      ...dto,
    };

    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | unknown> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...userAuthResponse,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOne(user_id: string): Promise<User | unknown> {
    const user = await this.prisma.user.findUnique({
      where: { user_id },
      select: {
        ...userResponse,
      },
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
    await this.companiesService.findOne(company_id); // Ensure the company exists

    const { page, limit } = query;
    const paginate = createPaginator({ perPage: limit });

    const cachedUsers = await this.redis.get('user');

    if (!cachedUsers || cachedUsers === null) {
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
        { page },
      );

      await this.redis.set('user', JSON.stringify(response), 'EX', 3600);
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
      where: { user_id },
      data: {
        ...dto,
      },
    });
  }

  async remove(user_id: string): Promise<User | unknown> {
    const user = await this.findOne(user_id); // Ensure the user exists

    return this.prisma.user.delete({
      where: { user_id },
    });
  }
}
