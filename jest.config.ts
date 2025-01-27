import 'reflect-metadata';
import { type JestConfigWithTsJest } from 'ts-jest';

/**
 * @see https://jestjs.io/docs/configuration
 * Jest configuration file
 * @type {import("ts-jest").JestConfigWithTsJest}
 */
const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  verbose: true,
  bail: false,
  clearMocks: true,
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'node',

  // covarage configs
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
