import { Module } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { CompaniesController } from '../infrasctructure/http/controllers/companies/companies.controller';
import { SharedServicesModule } from './shared-services.module';
import { ErrorHandler } from '../shared/errors/error-handler';

@Module({
  imports: [SharedServicesModule],
  providers: [CompaniesService, ErrorHandler],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
