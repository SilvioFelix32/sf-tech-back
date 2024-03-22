import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static instance: PrismaService | null = null;

  constructor() {
    super();
    if (PrismaService.instance === null) {
      PrismaService.instance = this;
    }
  }

  async onModuleInit() {
    try {
      console.log('Started create connection with DB');
      await PrismaService.instance.$connect();
      console.log('Created connection');
    } catch (err) {
      console.log(`Failed to connect to database: ${err}`);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    PrismaService.instance.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
