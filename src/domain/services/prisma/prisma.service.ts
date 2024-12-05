import {
  INestApplication,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static instance: PrismaService | null = null;
  private readonly maxConnectionAttempts = 3;
  private connectionAttempts = 0;
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    if (PrismaService.instance === null) {
      PrismaService.instance = this;
    }
  }

  async onModuleInit() {
    try {
      console.log('Prisma service started create connection with DB');
      await this.connectWithRetry();
    } catch (err) {
      console.log(`Failed to connect to database: ${err}`);
    }
  }

  private async connectWithRetry() {
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        await this.$connect();
        console.log('Database connection successful');
        return;
      } catch (err) {
        this.connectionAttempts++;
        console.log(
          `Prisma service attempt ${this.connectionAttempts} to connect failed with the database, Error: ${err}`,
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
