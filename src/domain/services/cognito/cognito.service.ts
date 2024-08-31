import {
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AdminDeleteUserRequest,
  AdminGetUserCommandOutput,
  AdminGetUserRequest,
  AdminUpdateUserAttributesRequest,
  AdminUpdateUserAttributesResponse,
  CognitoIdentityProvider,
  InvalidParameterException,
  ListUsersCommandOutput,
  ListUsersRequest,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import {
  CognitoUser,
  UpdateCognitoUser,
} from 'src/domain/entities/cognito-user/cognito-user.entity';
import { createUserAttributes, updateUserAttributes } from './user-attibutes';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CognitoService {
  public async createUser(data: CognitoUser): Promise<AdminCreateUserResponse> {
    console.info('Starting create user on Cognito', data.email);
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const params: AdminCreateUserRequest = {
      UserPoolId: userPoolId,
      Username: data.email,
      UserAttributes: createUserAttributes(data),
    };
    try {
      const cognitoIdentityServiceProvider = new CognitoIdentityProvider();
      const response =
        await cognitoIdentityServiceProvider.adminCreateUser(params);
      console.log('CognitoService.createUser response', response);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error(
        'Failed to create cognito user',
        JSON.stringify({ error, params }),
      );
      throw new Error(`'Failed to create cognito user', ${error.message}`);
    }
  }

  public async getAllUsers(
    limit?: number,
    paginationToken?: string,
  ): Promise<{ Users: UserType[]; PaginationToken?: string }> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const params: ListUsersRequest = {
      UserPoolId: userPoolId,
      Limit: limit,
      PaginationToken: paginationToken,
    };

    try {
      const cognitoIdentityServiceProvider = new CognitoIdentityProvider();
      const response: ListUsersCommandOutput =
        await cognitoIdentityServiceProvider.listUsers(params);
      console.log('CognitoService.getAllUsers response', {
        Users: response.Users,
        PaginationToken: response.PaginationToken,
      });
      return {
        Users: response.Users || [],
        PaginationToken: response.PaginationToken,
      };
    } catch (err) {
      const error = err as Error;
      console.error(
        'Failed to find cognito user',
        JSON.stringify({ error, params }),
      );
      throw new Error(`'Failed to create cognito user', ${error.message}`);
    }
  }

  public async findUserById(
    personId: string,
  ): Promise<AdminGetUserCommandOutput> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const params: AdminGetUserRequest = {
      UserPoolId: userPoolId,
      Username: personId,
    };
    try {
      const cognitoIdentityServiceProvider = new CognitoIdentityProvider();
      const response =
        await cognitoIdentityServiceProvider.adminGetUser(params);
      console.log('CognitoService.FindUserById response', response);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error(
        'Failed to find cognito user',
        JSON.stringify({ error, params }),
      );
      throw new Error(`'Failed to create cognito user', ${error.message}`);
    }
  }

  public async finUserByEmail(email: string): Promise<UserType | null> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const params: ListUsersRequest = {
      UserPoolId: userPoolId,
      Filter: `email="${email}"`,
      Limit: 1,
    };

    try {
      const cognitoIdentityServiceProvider = new CognitoIdentityProvider();
      const response: ListUsersCommandOutput =
        await cognitoIdentityServiceProvider.listUsers(params);
      console.log('CognitoService.findUserByEmail response', {
        Users: response.Users,
        PaginationToken: response.PaginationToken,
      });
      if (response.Users && response.Users.length > 0) {
        return response.Users[0];
      }
      return null;
    } catch (err) {
      const error = err as Error;
      console.error(
        'Failed to find cognito user',
        JSON.stringify({ error, params }),
      );
      throw new Error(`'Failed to create cognito user', ${error.message}`);
    }
  }

  public async updateUser(data: UpdateCognitoUser): Promise<string> {
    console.info('Start update user on Cognito', data.user_id);
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const params: AdminUpdateUserAttributesRequest = {
      UserPoolId: userPoolId,
      Username: data.user_id,
      UserAttributes: updateUserAttributes(data),
    };

    try {
      const cognitoIdentityServiceProvider = new CognitoIdentityProvider();
      await cognitoIdentityServiceProvider.adminUpdateUserAttributes(params);
      return `Updated user ${data.user_id}`;
    } catch (err) {
      const error = err as Error;
      console.error(
        'Failed to update cognito user',
        JSON.stringify({ error, params }),
      );
      if (error instanceof InvalidParameterException) {
        throw new Error(`Invalid parameter: ${error.message}`);
      }
      throw new Error(`'Failed to create cognito user', ${error.message}`);
    }
  }

  public async deleteUser(personId: string): Promise<string> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const params: AdminDeleteUserRequest = {
      UserPoolId: userPoolId,
      Username: personId,
    };
    try {
      const cognitoIdentityServiceProvider = new CognitoIdentityProvider();
      await cognitoIdentityServiceProvider.adminDeleteUser(params);
      return `Deleted user ${personId}`;
    } catch (err) {
      const error = err as Error;
      console.error(
        'Failed to delete cognito user',
        JSON.stringify({ error, params }),
      );
      throw new Error(`'Failed to create cognito user', ${error.message}`);
    }
  }
}
