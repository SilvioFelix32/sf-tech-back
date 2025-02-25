import { NotFoundException } from '@nestjs/common';
import { environment, getEnvVariable } from '../../../src/shared/config/env';

describe('env', () => {
  beforeEach(() => {
    process.env = {};
  });

  it('Should be defined', () => {
    expect(environment).toBeDefined();
  });

  it('Should throw a NotFoundException when a required environment variable is missing', () => {
    expect(() => getEnvVariable('NON_EXISTENT_KEY')).toThrow(NotFoundException);

    expect(() => getEnvVariable('NON_EXISTENT_KEY')).toThrow(
      'Missing environment variable: NON_EXISTENT_KEY',
    );
  });

  it('Should load environment variables correctly', () => {
    expect(environment.APP_PORT).toBeDefined();
    expect(environment.API_RESPONSE_LIMIT).toBeDefined();
    expect(environment.DATABASE_URL).toBeDefined();
    expect(environment.JWT_SECRET).toBeDefined();
    expect(environment.REDIS_PORT).toBeDefined();
    expect(environment.REDIS_HOST).toBeDefined();
    expect(environment.REDIS_PASSWORD).toBeDefined();
    expect(environment.REDIS_USER).toBeDefined();
    expect(environment.REDIS_URL).toBeDefined();
    expect(environment.AWS_REGION).toBeDefined();
    expect(environment.COGNITO_USER_POOL_ID).toBeDefined();
  });
});
