import path from 'path';

const kbnDir = path.resolve(__dirname, '../../../');

export default {
  rootDir: path.resolve(__dirname, '../'),
  roots: [
    '<rootDir>/public',
    '<rootDir>/server',
    '<rootDir>/common',
  ],
  modulePaths: [
    `${kbnDir}/node_modules`
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.ts',
  ],
  collectCoverageFrom: [
    '**node_modules*.test.{js,ts,tsx}',
  ],
  transform: {
    '^.+\\.js$': `${kbnDir}/src/dev/jest/babel_transform.js`,
    '^.+\\.tsx?$': `${kbnDir}/src/dev/jest/babel_transform.js`,
    '^.+\\.html?$': `${kbnDir}/src/dev/jest/babel_transform.js`,
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(d3-color)[/\\\\]).+\\.js$',
  ],
  snapshotSerializers: [
    `${kbnDir}/node_modules/enzyme-to-json/serializer`,
  ],
  testEnvironment: 'jest-environment-jsdom',
  reporters: [
    'default',
    `${kbnDir}/src/dev/jest/junit_reporter.js`,
  ],
};
