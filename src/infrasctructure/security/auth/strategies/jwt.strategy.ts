import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CacheService } from 'src/domain/services/cache/cache.service';
import { env } from 'src/shared/config/env';
import * as jose from 'jose';
import axios from 'axios';

@Injectable()
export class JwtStrategy {
  constructor(private readonly cacheService: CacheService) {}

  async validate(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    return await this.isTokenValid(token);
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const decoded = jose.decodeJwt(token);
      console.info(
        'JwtStrategy.isTokenValid - Token Expiration:',
        new Date(decoded.exp! * 1000),
      );
      console.info('JwtStrategy.isTokenValid - Current Time:', new Date());

      const key = await this.getKey(token);
      const { payload } = await jose.jwtVerify(token, key, {
        clockTolerance: 60 * 60 * 5, // 5 hours tolerance. this behavior is necessary because of diferent timezones
      });

      if (!payload) {
        return false;
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `JwtStrategy.verifyToken error: ${error}`,
      );
    }
  }

  private async getKey(token: string) {
    const { kid } = jose.decodeProtectedHeader(token);

    const key = await this.cacheService.getCache<jose.JWK | undefined>('key');
    if (!key) {
      const jwks = await this.getJwks();
      const key = jwks.keys.find((jwk) => jwk.kid === kid);
      await this.cacheService.setCache('key', key, 60 * 60 * 3); //3 hours
    }
    if (!key) {
      throw new UnauthorizedException(
        'JwtStrategy.getKey: Key not found in jwks',
      );
    }

    return await jose.importJWK(key, 'RS256');
  }

  private async getJwks(): Promise<jose.JSONWebKeySet> {
    try {
      const region = env.AWS_REGION;
      const userPoolId = env.COGNITO_USER_POOL_ID;
      const jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

      const response = await axios.get(jwksUri);
      return response.data as jose.JSONWebKeySet;
    } catch (error) {
      throw new UnauthorizedException(
        `JwtStrategy.getJwks error while getting jwks: ${error}`,
      );
    }
  }
}
