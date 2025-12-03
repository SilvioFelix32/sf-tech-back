// Helper para gerar dados fake para testes
export class TestData {
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static string(length = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length);
      result += chars[index] || chars[0];
    }
    return result;
  }

  static email(): string {
    return `${this.string(8).toLowerCase()}@${this.string(6).toLowerCase()}.com`;
  }

  static number(min = 0, max = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static boolean(): boolean {
    return Math.random() > 0.5;
  }

  static word(): string {
    const words: string[] = [
      'product',
      'category',
      'company',
      'item',
      'service',
      'goods',
      'merchandise',
      'article',
      'commodity',
    ];
    const index = Math.floor(Math.random() * words.length);
    return words[index] ?? words[0]!;
  }

  static sentence(): string {
    const sentences: string[] = [
      'This is a test description',
      'Lorem ipsum dolor sit amet',
      'Test product description',
      'Sample text for testing',
      'Random description text',
    ];
    const index = Math.floor(Math.random() * sentences.length);
    return sentences[index] ?? sentences[0]!;
  }

  static url(): string {
    return `https://${this.string(10).toLowerCase()}.com/${this.string(5)}`;
  }

  static firstName(): string {
    const names: string[] = [
      'John',
      'Jane',
      'Bob',
      'Alice',
      'Charlie',
      'Diana',
      'Edward',
      'Fiona',
    ];
    const index = Math.floor(Math.random() * names.length);
    return names[index] ?? names[0]!;
  }

  static fullName(): string {
    return `${this.firstName()} ${this.string(6)}`;
  }

  static companyName(): string {
    return `${this.string(8)} ${this.word()}`;
  }
}

