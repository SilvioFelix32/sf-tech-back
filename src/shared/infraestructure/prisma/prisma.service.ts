import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static instance: PrismaService | null = null;
  private readonly maxConnectionAttempts = 3;
  private connectionAttempts = 0;

  constructor() {
    super();
    if (PrismaService.instance === null) {
      PrismaService.instance = this;
    }
  }

  async onModuleInit() {
    try {
      console.log('Started create connection with DB');
      await this.connectWithRetry();
    } catch (err) {
      console.log(`Failed to connect to database: ${err}`);
    }
  }

  private async connectWithRetry() {
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        await PrismaService.instance.$connect();
        console.log('Database connection successful');
        return;
      } catch (err) {
        this.connectionAttempts++;
        console.log(
          `Attempt ${this.connectionAttempts} to connect failed: ${err}`,
        );
      }
    }
    throw new Error(
      `Maximum connection attempts (${this.maxConnectionAttempts}) reached.`,
    );
  }

  async enableShutdownHooks(app: INestApplication) {
    PrismaService.instance.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
