import { NotFoundException } from '@nestjs/common';
import { config as loadEnv } from 'dotenv';

loadEnv();

export function getEnvVariable<T = string>(
  key: string,
  transform?: (value: string) => T,
): T {
  const value = process.env[key];
  if (!value) {
    throw new NotFoundException(`Missing environment variable: ${key}`);
  }

  return transform ? transform(value) : (value as unknown as T);
}

export const environment = {
  APP_PORT: getEnvVariable('APP_PORT', Number),
  API_RESPONSE_LIMIT: getEnvVariable('API_RESPONSE_LIMIT', Number),
  DATABASE_URL: getEnvVariable('DATABASE_URL'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  REDIS_PORT: getEnvVariable('REDIS_PORT', Number),
  REDIS_HOST: getEnvVariable('REDIS_HOST'),
  REDIS_PASSWORD: getEnvVariable('REDIS_PASSWORD'),
  REDIS_USER: getEnvVariable('REDIS_USER'),
  REDIS_URL: getEnvVariable('REDIS_URL'),
  AWS_REGION: getEnvVariable('AWS_REGION'),
  COGNITO_USER_POOL_ID: getEnvVariable('COGNITO_USER_POOL_ID'),
};
