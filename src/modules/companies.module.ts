import { Module } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { CompaniesController } from '../infrasctructure/http/controllers/companies/companies.controller';
import { SharedServicesModule } from './shared-services.module';

@Module({
  controllers: [CompaniesController],
  exports: [CompaniesService],
  imports: [SharedServicesModule],
  providers: [CompaniesService],
})
export class CompaniesModule {}
