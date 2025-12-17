import { Module } from '@nestjs/common';
import { AddressService } from '../domain/services/address/address.service';
import { AddressController } from '../infrastructure/http/controllers/address/address.controller';
import { SharedServicesModule } from './shared-services.module';

@Module({
  imports: [SharedServicesModule],
  providers: [AddressService],
  controllers: [AddressController],
  exports: [AddressService],
})
export class AddressModule {}

