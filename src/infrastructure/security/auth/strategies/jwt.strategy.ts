import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CacheService } from 'src/domain/services/cache/cache.service';
import { environment } from 'src/shared/config/env';
import {
  decodeProtectedHeader,
  jwtVerify,
  importJWK,
  type JWK,
  type JSONWebKeySet,
} from 'jose';
import { Logger } from 'src/shared/logger/logger.service';

import axios from 'axios';

@Injectable()
export class JwtStrategy {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: Logger,
  ) {}

  async validate(token: string): Promise<boolean> {
    if (!token) {
      this.logger.error(`JwtStrategy.validate() - Token not provided`);
      return false;
    }

    return await this.isTokenValid(token);
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const key = await this.getKey(token);
      const { payload } = await jwtVerify(token, key, {
        clockTolerance: 60 * 60 * 3, // 3 hours tolerance. this behavior is necessary because of diferent timezones
      });

      if (!payload) {
        this.logger.error(
          `JwtStrategy.isTokenValid() - Token payload is empty`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`JwtStrategy.isTokenValid() - Error validating token`, {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw new UnauthorizedException(
        `JwtStrategy.verifyToken error: ${error}`,
      );
    }
  }

  private async getKey(token: string) {
    const { kid } = decodeProtectedHeader(token);

    let key = await this.cacheService.getCache<JWK | undefined>('key');
    if (!key) {
      const jwks = await this.getJwks();
      key = jwks.keys.find((jwk) => jwk.kid === kid);
      if (key) {
        await this.cacheService.setCache('key', key, 60 * 60 * 3);
      }
    }
    if (!key) {
      this.logger.error(`JwtStrategy.getKey() - Key not found in jwks`);
      throw new UnauthorizedException(
        'JwtStrategy.getKey: Key not found in jwks',
      );
    }
    return await importJWK(key, 'RS256');
  }

  private async getJwks(): Promise<JSONWebKeySet> {
    try {
      const region = environment.AWS_REGION;
      const userPoolId = environment.COGNITO_USER_POOL_ID;
      const jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

      const response = await axios.get(jwksUri);
      return response.data as JSONWebKeySet;
    } catch (error) {
      this.logger.error(
        `JwtStrategy.getJwks() - Error fetching JWKS from Cognito`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
        },
      );
      throw new UnauthorizedException(
        `JwtStrategy.getJwks error while getting jwks: ${error}`,
      );
    }
  }
}
