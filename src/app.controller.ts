import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from '@prisma/client';
import { CurrentUser } from './application/auth/decorators/current-user.decorator';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/me')
  getMe(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
