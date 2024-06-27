import { Module } from '@nestjs/common';
import { UsersController } from './infra/users.controller';
import { UsersService } from './services/users.service';
import { CompaniesService } from '../companies/services/companies.service';
import { SharedServicesModule } from '../../shared/infraestructure/shared-services.module';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [SharedServicesModule],
  providers: [CompaniesService, UsersService],
})
export class UsersModule {}
