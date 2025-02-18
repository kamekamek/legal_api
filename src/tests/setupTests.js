import '@testing-library/jest-dom';

// グローバル変数の設定
global.window = {
  ...global.window,
  __VITE_ZENRIN_API_KEY__: 'test-api-key',
};

// ResizeObserverのモック
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// matchMediaのモック
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Fetchのモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
); 