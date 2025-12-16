export class Address {
  address_id?: string;
  declare user_id: string;
  declare address_type: 'House' | 'Work' | 'Temporary';
  declare address_preference: 'House' | 'Work' | 'Temporary';
  declare street: string;
  declare number: string;
  declare neighborhood: string;
  declare city: string;
  declare cep: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

