import {
  CognitoUser,
  UpdateCognitoUser,
} from 'src/domain/entities/cognito-user/cognito-user.entity';
import type { AttributeType } from '@aws-sdk/client-cognito-identity-provider';

export const createUserAttributes = (user: CognitoUser): AttributeType[] => {
  return [
    {
      Name: 'email',
      Value: user.email,
    },
    {
      Name: 'name',
      Value: user.name,
    },
    {
      Name: 'family_name',
      Value: user.lastName,
    },
    {
      Name: 'custom:company_id',
      Value: user.company_id,
    },
    {
      Name: 'custom:role',
      Value: user.role,
    },
  ];
};

export const updateUserAttributes = (
  user: UpdateCognitoUser,
): AttributeType[] => {
  const attributes: AttributeType[] = [];

  if (user.email) {
    attributes.push({
      Name: 'email',
      Value: user.email,
    });
  }

  if (user.name) {
    attributes.push({
      Name: 'name',
      Value: user.name,
    });
  }

  if (user.lastName) {
    attributes.push({
      Name: 'family_name',
      Value: user.lastName,
    });
  }

  if (user.company_id) {
    attributes.push({
      Name: 'custom:company_id',
      Value: user.company_id,
    });
  }

  if (user.role) {
    attributes.push({
      Name: 'custom:role',
      Value: user.role,
    });
  }

  return attributes;
};
