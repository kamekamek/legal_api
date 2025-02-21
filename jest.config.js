/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel/runtime)/)'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  moduleFileExtensions: ['js', 'jsx'],
  globals: {
    'import.meta': {
      env: {
        VITE_ZENRIN_API_KEY: 'test-api-key'
      }
    }
  }
}; 