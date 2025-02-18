import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなモックの設定
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder; 