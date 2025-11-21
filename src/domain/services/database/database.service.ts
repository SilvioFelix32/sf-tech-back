import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static readonly LOG_PREFIX = '[DatabaseService]';
  private connectionAttempts = 0;
  private readonly maxConnectionAttempts = 3;

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async connectWithRetry() {
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        console.log(
          `${DatabaseService.LOG_PREFIX} Connection attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts} to database...`,
        );

        await this.$connect();

        console.log(
          `${DatabaseService.LOG_PREFIX} ✅ Service connected to database`,
        );
        console.log(
          `${DatabaseService.LOG_PREFIX} 📊 Active instance: DatabaseService`,
        );

        return;
      } catch (err) {
        this.connectionAttempts++;

        if (this.connectionAttempts < this.maxConnectionAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(
      `Maximum connection attempts to connect to the database (${this.maxConnectionAttempts}) reached.`,
    );
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await this.$disconnect();
      await app.close();
    });
  }
}
