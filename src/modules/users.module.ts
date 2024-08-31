import { Module } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { UsersService } from '../domain/services/users/users.service';
import { UsersController } from '../infrasctructure/http/controllers/users/users.controller';
import { SharedServicesModule } from './shared-services.module';
import { CognitoService } from 'src/domain/services/cognito/cognito.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [SharedServicesModule],
  providers: [CompaniesService, CognitoService, UsersService],
})
export class UsersModule {}
