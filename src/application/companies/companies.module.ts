import { Module } from '@nestjs/common';
import { CompaniesController } from './infra/companies.controller';
import { CompaniesService } from './services/companies.service';
import { SharedServicesModule } from '../../shared/infraestructure/shared-services.module';

@Module({
  controllers: [CompaniesController],
  exports: [CompaniesService],
  imports: [SharedServicesModule],
  providers: [CompaniesService],
})
export class CompaniesModule {}
