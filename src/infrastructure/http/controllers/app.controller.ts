import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/infrastructure/security/auth/decorators/is-public.decorator';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthController {
  @Get('wakeup')
  @IsPublic()
  wakeup(): { status: 'ok'; timestamp: number } {
    return { status: 'ok', timestamp: Date.now() };
  }
}
