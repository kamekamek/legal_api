import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ZoneSearch from '../ZoneSearch';
import '@testing-library/jest-dom';

// Zenrin Maps APIのモック
const mockZMALoader = {
  setOnLoad: jest.fn((callback) => {
    callback({
      center: jest.fn(),
      zoom: jest.fn(),
      auth: jest.fn(),
      types: jest.fn(),
    });
  }),
};

// グローバルオブジェクトのモック
global.ZMALoader = mockZMALoader;
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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    projectId: '1'
  }),
  useNavigate: () => jest.fn()
}));

describe('ZoneSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
    global.XMLHttpRequest = jest.fn(() => ({
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      onload: jest.fn(),
      response: null,
      status: 200,
      responseType: ''
    }));
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('地図が正しく初期化される', async () => {
    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(global.ZDC.Map).toHaveBeenCalled();
    });
  });

  it('住所検索が正しく動作し、キャッシュを使用する', async () => {
    const mockSearchResponse = {
      status: 'OK',
      result: {
        info: { hit: 1 },
        item: [{
          position: [139.7671, 35.6814]
        }]
      }
    };

    const mockLandUseResponse = {
      data: {
        type: '1',
        fireArea: '1'
      }
    };

    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse)
      }));

    jest.spyOn(axios, 'get')
      .mockImplementationOnce(() => Promise.resolve(mockLandUseResponse));

    const { rerender } = render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('住所を入力（例：東京都千代田区丸の内1丁目）');
    fireEvent.change(input, { target: { value: '東京都千代田区' } });
    
    // 検索実行
    const searchButton = screen.getByLabelText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // 同じ検索を再度実行（キャッシュを使用）
    fireEvent.click(searchButton);

    await waitFor(() => {
      // fetchは新たに呼ばれていないことを確認
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('エラー時にリトライ機能が正しく動作する', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            info: { hit: 1 },
            item: [{
              position: [139.7671, 35.6814]
            }]
          }
        })
      }));

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('住所を入力（例：東京都千代田区丸の内1丁目）');
    fireEvent.change(input, { target: { value: '東京都千代田区' } });
    
    const searchButton = screen.getByLabelText('検索');
    fireEvent.click(searchButton);

    // 最初のエラー
    await waitFor(() => {
      expect(screen.getByText(/再試行中/)).toBeInTheDocument();
    });

    // 2回目のエラー
    await waitFor(() => {
      expect(screen.getByText(/再試行中/)).toBeInTheDocument();
    });

    // 3回目の成功
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  it('ヘルプダイアログが正しく表示される', async () => {
    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const helpButton = screen.getByLabelText('ヘルプを表示');
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('地図の使い方')).toBeInTheDocument();
      expect(screen.getByText('基本操作')).toBeInTheDocument();
      expect(screen.getByText('用途地域の表示')).toBeInTheDocument();
    });
  });

  it('ローディング状態が正しく表示される', async () => {
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            info: { hit: 1 },
            item: [{
              position: [139.7671, 35.6814]
            }]
          }
        })
      }), 1000))
    );

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('住所を入力（例：東京都千代田区丸の内1丁目）');
    fireEvent.change(input, { target: { value: '東京都千代田区' } });
    
    const searchButton = screen.getByLabelText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('住所を検索中...')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText('住所を検索中...')).not.toBeInTheDocument();
    });
  });

  it('検索のデバウンスが正しく動作する', async () => {
    const mockSearchResponse = {
      status: 'OK',
      result: {
        info: { hit: 1 },
        item: [{
          position: [139.7671, 35.6814]
        }]
      }
    };

    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse)
      })
    );

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('住所を入力（例：東京都千代田区丸の内1丁目）');
    
    // 複数回の入力を素早く行う
    fireEvent.change(input, { target: { value: '東' } });
    fireEvent.change(input, { target: { value: '東京' } });
    fireEvent.change(input, { target: { value: '東京都' } });

    // デバウンス時間内の呼び出しはまだない
    expect(global.fetch).not.toHaveBeenCalled();

    // デバウンス時間経過
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      // 最後の入力に対してのみAPIが呼ばれる
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 