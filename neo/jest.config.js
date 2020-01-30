module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  globalSetup: './src/utils/testUtils/initTests.ts',
};
