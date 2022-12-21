const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['@summer-js/test/setup-jest.js']
}

module.exports = config
