import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import Cache from 'cache-manager';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { User } from './users/entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/me')
  getMe(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
