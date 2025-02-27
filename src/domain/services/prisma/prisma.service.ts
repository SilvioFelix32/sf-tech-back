import {
  INestApplication,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { environment } from '../../../shared/config/env';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static instance: PrismaService | null = null;
  private readonly maxConnectionAttempts = 3;
  private connectionAttempts = 0;
  constructor() {
    super({
      datasources: {
        db: {
          url: environment.DATABASE_URL,
        },
      },
    });
    if (PrismaService.instance === null) {
      PrismaService.instance = this;
    }
  }

  async onModuleInit() {
    try {
      console.info(
        'PrismaService.onModuleInit(): Started creating connection with DB',
      );
      await this.connectWithRetry();
    } catch (err) {
      console.error(
        `PrismaService.onModuleInit(): Failed to connect to database: ${err}`,
      );
    }
  }

  private async connectWithRetry() {
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        await this.$connect();
        console.info(
          'PrismaService.connectWithRetry(): Database connection successful!',
        );
        return;
      } catch (err) {
        this.connectionAttempts++;
        console.error(
          `PrismaService.connectWithRetry(): attempt ${this.connectionAttempts} to connect failed with the database, Error: ${err}`,
        );
      }
    }
    throw new InternalServerErrorException(
      `Maximum connection attempts to conect to the database (${this.maxConnectionAttempts}) reached.`,
    );
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
