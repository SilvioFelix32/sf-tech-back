import { Module } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { UsersService } from '../domain/services/users/users.service';
import { UsersController } from '../infrasctructure/http/controllers/users/users.controller';
import { SharedServicesModule } from './shared-services.module';
import { ErrorHandler } from 'src/shared/errors/error-handler';

@Module({
  controllers: [UsersController],
  exports: [UsersService, ErrorHandler],
  imports: [SharedServicesModule],
  providers: [CompaniesService, UsersService, ErrorHandler],
})
export class UsersModule {}
