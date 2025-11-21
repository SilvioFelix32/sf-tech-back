import { Module } from '@nestjs/common';
import { CompaniesService } from '../domain/services/companies/companies.service';
import { CompaniesController } from '../infrastructure/http/controllers/companies/companies.controller';
import { SharedServicesModule } from './shared-services.module';

@Module({
  imports: [SharedServicesModule],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
