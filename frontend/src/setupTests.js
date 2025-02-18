import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Zenrin Maps APIのモック
global.ZMALoader = {
  setOnLoad: jest.fn()
};

global.ZDC = {
  LatLng: jest.fn((lat, lng) => ({ lat, lng })),
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getLatLngBounds: jest.fn(() => ({
      getNorthWest: jest.fn(),
      getSouthWest: jest.fn(),
      getNorthEast: jest.fn()
    })),
    getMapSize: jest.fn(() => ({ width: 800, height: 600 })),
    getZoom: jest.fn(() => 17),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    addWidget: jest.fn(),
    removeWidget: jest.fn()
  })),
  Marker: jest.fn(),
  ZoomButton: jest.fn(),
  Compass: jest.fn(),
  ScaleBar: jest.fn(),
  UserWidget: jest.fn()
};

// 環境変数のモック
process.env.VITE_ZENRIN_API_KEY = 'test-api-key';

// グローバルなモックの設定
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Fetch APIのモック
global.fetch = jest.fn();

// XMLHttpRequestのモック
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  onload: jest.fn(),
  response: null,
  status: 200,
  responseType: ''
}));

// windowのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 