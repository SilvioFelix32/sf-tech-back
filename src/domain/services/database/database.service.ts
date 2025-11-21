import {
  INestApplication,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { environment } from '../../../shared/config/env';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private static instanceCount = 0;
  private static connectedInstanceId: string | null = null;
  private static readonly INSTANCE_LOG_PREFIX = '[DatabaseService]';
  
  private readonly instanceId: string;
  private readonly maxConnectionAttempts = 3;
  private connectionAttempts = 0;
  private isConnected = false;

  constructor() {
    super();
    
    DatabaseService.instanceCount++;
    
    if (DatabaseService.instanceCount > 1) {
      throw new InternalServerErrorException(
        `Multiple instances detected! Total: ${DatabaseService.instanceCount}. Only 1 instance is allowed to avoid exceeding the database connection limit.`,
      );
    }
    
    this.instanceId = `INST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const databaseUrl = environment.DATABASE_URL;
    const urlWithConnectionLimit = DatabaseService.addConnectionLimitToUrl(databaseUrl);
    
    this.$connect = this.$connect.bind(this);
    Object.defineProperty(this, '$connect', {
      value: async () => {
        (this as any).$engine = undefined;
        (this as any)._engine = undefined;
        return PrismaClient.prototype.$connect.call(this);
      },
      writable: false,
      configurable: false,
    });
    
    (this as any)._datasources = {
      db: {
        url: urlWithConnectionLimit,
      },
    };
  }

  private static addConnectionLimitToUrl(url: string): string {
    if (url.includes('connection_limit')) {
      return url;
    }
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}connection_limit=5&pool_timeout=10`;
  }

  async onModuleInit() {
    try {
      await this.connectWithRetry();
    } catch (err) {
      if (DatabaseService.connectedInstanceId === this.instanceId) {
        DatabaseService.connectedInstanceId = null;
      }
      throw err;
    }
  }

  private async connectWithRetry() {
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        console.log(
          `${DatabaseService.INSTANCE_LOG_PREFIX} Connection attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts} to database...`,
        );
        
        await this.$connect();
        
        DatabaseService.connectedInstanceId = this.instanceId;
        this.isConnected = true;
        
        console.log(
          `${DatabaseService.INSTANCE_LOG_PREFIX} ✅ Service connected to database`,
        );
        console.log(
          `${DatabaseService.INSTANCE_LOG_PREFIX} 📊 Active instance: ${this.instanceId}`,
        );
        
        return;
      } catch (err) {
        this.connectionAttempts++;
        
        if (this.connectionAttempts < this.maxConnectionAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw new InternalServerErrorException(
      `Maximum connection attempts to conect to the database (${this.maxConnectionAttempts}) reached.`,
    );
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      if (this.isConnected && DatabaseService.connectedInstanceId === this.instanceId) {
        await this.$disconnect();
        DatabaseService.connectedInstanceId = null;
        this.isConnected = false;
      }
      await app.close();
    });
  }

  getInstanceInfo() {
    return {
      instanceId: this.instanceId,
      isConnected: this.isConnected,
      isActiveInstance: DatabaseService.connectedInstanceId === this.instanceId,
      totalInstances: DatabaseService.instanceCount,
      connectedInstanceId: DatabaseService.connectedInstanceId,
    };
  }

  static getGlobalStats() {
    return {
      totalInstances: DatabaseService.instanceCount,
      connectedInstanceId: DatabaseService.connectedInstanceId,
      hasActiveConnection: DatabaseService.connectedInstanceId !== null,
    };
  }
}
