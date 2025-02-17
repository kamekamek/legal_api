module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/e2e/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js']
}; 