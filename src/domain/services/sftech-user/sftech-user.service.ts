import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateSfTechUserDto } from '../../../application/dtos/sftech-user/create-sftech-user.dto';
import { UpdateSfTechUserDto } from '../../../application/dtos/sftech-user/update-sftech-user.dto';
import { SfTechUser } from '../../entities/sftech-user/sftech-user.entity';
import { DatabaseService } from '../database/database.service';
import { ErrorHandler } from 'src/shared/errors/error-handler';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class SfTechUserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly errorHandler: ErrorHandler,
    private readonly logger: Logger,
  ) {}

  async create(data: CreateSfTechUserDto): Promise<string> {
    const { user_id, email, cpf, addresses } = data;
    try {
      await this.userExists(user_id, email, cpf);

      const result = await this.databaseService.sfTechUser.create({
        data: {
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          cpf: data.cpf,
          cellphone: data.cellphone,
          birthdate: data.birthdate,
          gender: data.gender || 'Other',
          addresses: addresses
            ? {
                create: addresses.map((address) => ({
                  address_type: address.address_type,
                  address_preference: address.address_preference,
                  street: address.street,
                  number: address.number,
                  neighborhood: address.neighborhood,
                  city: address.city,
                  cep: address.cep,
                })),
              }
            : undefined,
        },
      });

      this.logger.info(
        `SfTechUserService.create() - User ${result.user_id} created successfully`,
        { metadata: { user_id: result.user_id } },
      );
      return `User ${result.user_id} created successfully`;
    } catch (error) {
      this.logger.error(
        `SfTechUserService.create() - Error creating user`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  async findById(user_id: string): Promise<SfTechUser> {
    try {
      const user = await this.databaseService.sfTechUser.findUnique({
        where: { user_id },
        include: {
          addresses: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.logger.info(
        `SfTechUserService.findById() - User ${user_id} retrieved successfully`,
        { metadata: { user_id } },
      );
      return user as SfTechUser;
    } catch (error) {
      this.logger.error(
        `SfTechUserService.findById() - Error retrieving user ${user_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { user_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  async update(user_id: string, data: UpdateSfTechUserDto): Promise<string> {
    try {
      await this.userIdExists(user_id);

      if (data.email || data.cpf) {
        await this.validateEmailAndCpfForUpdate(
          user_id,
          data.email,
          data.cpf,
        );
      }

      const updateData: any = {};
      if (data.first_name) updateData.first_name = data.first_name;
      if (data.last_name) updateData.last_name = data.last_name;
      if (data.email) updateData.email = data.email;
      if (data.cpf) updateData.cpf = data.cpf;
      if (data.cellphone) updateData.cellphone = data.cellphone;
      if (data.birthdate) updateData.birthdate = data.birthdate;
      if (data.gender) updateData.gender = data.gender;

      const result = await this.databaseService.sfTechUser.update({
        data: updateData,
        where: { user_id },
      });

      this.logger.info(
        `SfTechUserService.update() - User ${result.user_id} updated successfully`,
        { metadata: { user_id: result.user_id } },
      );
      return `User ${result.user_id} updated!`;
    } catch (error) {
      this.logger.error(
        `SfTechUserService.update() - Error updating user ${user_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { user_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  private async userIdExists(user_id: string): Promise<void> {
    const response = await this.databaseService.sfTechUser.findFirst({
      where: { user_id },
    });

    if (!response) {
      throw new NotFoundException('User not found');
    }
    return;
  }

  private async validateEmailAndCpfForUpdate(
    user_id: string,
    email?: string,
    cpf?: string,
  ): Promise<void> {
    if (email) {
      const existingUser = await this.databaseService.sfTechUser.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.user_id !== user_id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (cpf) {
      const existingUser = await this.databaseService.sfTechUser.findUnique({
        where: { cpf },
      });

      if (existingUser && existingUser.user_id !== user_id) {
        throw new ConflictException('User with this cpf already exists');
      }
    }
  }

  private async userExists(
    user_id: string,
    email: string,
    cpf: string,
  ): Promise<void> {
    const existingUser = await this.databaseService.sfTechUser.findFirst({
      where: {
        OR: [
          { user_id },
          { email },
          { cpf },
        ],
      },
    });

    if (existingUser) {
      let conflictField = 'user_id';
      if (existingUser.email === email) conflictField = 'email';
      else if (existingUser.cpf === cpf) conflictField = 'cpf';

      throw new ConflictException(
        `User with this ${conflictField} already exists`,
      );
    }
  }
}

