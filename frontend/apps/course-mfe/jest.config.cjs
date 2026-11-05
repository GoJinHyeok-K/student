/** 테스트는 Jest + React Testing Library. API는 mock한다 (백엔드 없이 돈다). */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        tsconfig: { jsx: 'react-jsx', module: 'commonjs', esModuleInterop: true, isolatedModules: true },
      },
    ],
  },
  // jsdom 환경에서 axios의 ESM 빌드를 고르면 Jest가 읽지 못하므로 CommonJS 빌드로 고정한다
  moduleNameMapper: {
    '^axios$': '<rootDir>/../../node_modules/axios/dist/node/axios.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
