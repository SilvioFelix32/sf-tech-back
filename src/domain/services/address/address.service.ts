import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressStandaloneDto } from '../../../application/dtos/address/create-address-standalone.dto';
import { UpdateAddressDto } from '../../../application/dtos/address/update-address.dto';
import { Address } from '../../entities/address/address.entity';
import { DatabaseService } from '../database/database.service';
import { ErrorHandler } from 'src/shared/errors/error-handler';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class AddressService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly errorHandler: ErrorHandler,
    private readonly logger: Logger,
  ) {}

  async create(data: CreateAddressStandaloneDto): Promise<string> {
    const { user_id } = data;
    try {
      await this.validateUser(user_id);

      const result = await this.databaseService.address.create({
        data: {
          user_id: data.user_id,
          address_type: data.address_type,
          address_preference: data.address_preference,
          street: data.street,
          number: data.number,
          neighborhood: data.neighborhood,
          city: data.city,
          cep: data.cep,
        },
      });

      this.logger.info(
        `AddressService.create() - Address ${result.address_id} created successfully`,
        { metadata: { address_id: result.address_id, user_id } },
      );
      return `Address ${result.address_id} created successfully`;
    } catch (error) {
      this.logger.error(
        `AddressService.create() - Error creating address`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { user_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  async findAll(user_id: string): Promise<Address[]> {
    try {
      await this.validateUser(user_id);

      const addresses = await this.databaseService.address.findMany({
        where: { user_id },
      });

      this.logger.info(
        `AddressService.findAll() - Retrieved ${addresses.length} addresses for user ${user_id}`,
        { metadata: { user_id, count: addresses.length } },
      );
      return addresses as Address[];
    } catch (error) {
      this.logger.error(
        `AddressService.findAll() - Error retrieving addresses for user ${user_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { user_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  async findOne(address_id: string): Promise<Address> {
    try {
      const address = await this.databaseService.address.findUnique({
        where: { address_id },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      this.logger.info(
        `AddressService.findOne() - Address ${address_id} retrieved successfully`,
        { metadata: { address_id } },
      );
      return address as Address;
    } catch (error) {
      this.logger.error(
        `AddressService.findOne() - Error retrieving address ${address_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { address_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  async update(address_id: string, data: UpdateAddressDto): Promise<string> {
    try {
      await this.addressIdExists(address_id);

      if (data.user_id) {
        await this.validateUser(data.user_id);
      }

      const updateData: any = {};
      if (data.user_id) updateData.user_id = data.user_id;
      if (data.address_type) updateData.address_type = data.address_type;
      if (data.address_preference)
        updateData.address_preference = data.address_preference;
      if (data.street) updateData.street = data.street;
      if (data.number) updateData.number = data.number;
      if (data.neighborhood) updateData.neighborhood = data.neighborhood;
      if (data.city) updateData.city = data.city;
      if (data.cep) updateData.cep = data.cep;

      const result = await this.databaseService.address.update({
        data: updateData,
        where: { address_id },
      });

      this.logger.info(
        `AddressService.update() - Address ${result.address_id} updated successfully`,
        { metadata: { address_id: result.address_id } },
      );
      return `Address ${result.address_id} updated successfully`;
    } catch (error) {
      this.logger.error(
        `AddressService.update() - Error updating address ${address_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { address_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  async remove(address_id: string): Promise<string> {
    try {
      await this.addressIdExists(address_id);

      const result = await this.databaseService.address.delete({
        where: { address_id },
      });

      this.logger.info(
        `AddressService.remove() - Address ${result.address_id} deleted successfully`,
        { metadata: { address_id: result.address_id } },
      );
      return `Address ${result.address_id} deleted successfully`;
    } catch (error) {
      this.logger.error(
        `AddressService.remove() - Error deleting address ${address_id}`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { address_id },
        },
      );
      throw this.errorHandler.handle(error);
    }
  }

  private async addressIdExists(address_id: string): Promise<void> {
    const address = await this.databaseService.address.findUnique({
      where: { address_id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return;
  }

  private async validateUser(user_id: string): Promise<void> {
    const user = await this.databaseService.sfTechUser.findUnique({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return;
  }
}

