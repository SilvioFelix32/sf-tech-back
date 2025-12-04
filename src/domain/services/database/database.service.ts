import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '../../../shared/logger/logger.service';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private connectionAttempts = 0;
  private readonly maxConnectionAttempts = 3;

  constructor(private readonly logger: Logger) {
    super();
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async connectWithRetry() {
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        this.logger.info(
          `DatabaseService.connectWithRetry() - Connection attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts} to database`,
          {
            metadata: {
              attempt: this.connectionAttempts + 1,
              maxAttempts: this.maxConnectionAttempts,
            },
          },
        );

        await this.$connect();

        this.logger.info(
          `DatabaseService.connectWithRetry() - Service connected to database successfully`,
        );

        return;
      } catch (err) {
        this.connectionAttempts++;

        if (this.connectionAttempts < this.maxConnectionAttempts) {
          this.logger.info(
            `DatabaseService.connectWithRetry() - Retrying connection in 1 second`,
            {
              metadata: {
                attempt: this.connectionAttempts,
                maxAttempts: this.maxConnectionAttempts,
              },
            },
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          this.logger.error(
            `DatabaseService.connectWithRetry() - Maximum connection attempts reached`,
            {
              error: err instanceof Error ? err : new Error(String(err)),
              metadata: {
                attempts: this.connectionAttempts,
                maxAttempts: this.maxConnectionAttempts,
              },
            },
          );
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
