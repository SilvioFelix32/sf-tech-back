import { Module } from '@nestjs/common';
import { SfTechUserService } from '../domain/services/sftech-user/sftech-user.service';
import { SfTechUserController } from '../infrastructure/http/controllers/sftech-user/sftech-user.controller';
import { SharedServicesModule } from './shared-services.module';

@Module({
  imports: [SharedServicesModule],
  providers: [SfTechUserService],
  controllers: [SfTechUserController],
  exports: [SfTechUserService],
})
export class SfTechUserModule {}

