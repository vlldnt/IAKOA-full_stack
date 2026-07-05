module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Résout les imports absolus "src/..." (alignés sur baseUrl du tsconfig)
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['<rootDir>/../test/jest-setup-env.js'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
  verbose: false,
};
