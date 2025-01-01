module.exports = {
  globalSetup: '<rootDir>/src/test/setup.ts',
  globalTeardown: '<rootDir>/src/test/teardown.ts',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
}
