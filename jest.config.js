export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/shared'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
  collectCoverageFrom: [
    'server/**/*.ts',
    'shared/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: { lines: 60, functions: 60, branches: 50 },
  },
};
