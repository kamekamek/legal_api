import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ZoneSearch from '../ZoneSearch';
import axios from 'axios';

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
    removeWidget: jest.fn(),
    refreshSize: jest.fn()
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('住所検索が正しく動作し、ローディング状態が表示される', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
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
      })
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

    // ローディング表示の確認
    expect(screen.getByText('住所を検索中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.queryByText('住所を検索中...')).not.toBeInTheDocument();
    });
  });

  it('エラー時にリトライ機能が正しく動作する', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.reject(new Error('ネットワークエラー'));
      }
      return Promise.resolve({
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
      });
    });

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
      expect(screen.getByText(/ネットワークエラー/)).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });

    // リトライボタンをクリック
    fireEvent.click(screen.getByText('再試行'));

    // 2回目のエラー
    await waitFor(() => {
      expect(screen.getByText(/ネットワークエラー/)).toBeInTheDocument();
    });

    // 3回目で成功
    await waitFor(() => {
      expect(screen.queryByText(/ネットワークエラー/)).not.toBeInTheDocument();
    });
  });

  it('キャッシュが正しく機能する', async () => {
    const mockLandUseInfo = {
      type: '1',
      fireArea: '1',
      buildingCoverageRatio: '60',
      floorAreaRatio: '200',
      heightDistrict: '第一種高度地区'
    };

    global.fetch = jest.fn()
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

    axios.get = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ data: mockLandUseInfo }))
      .mockImplementationOnce(() => Promise.resolve({ 
        data: { status: 'success', data: { kokuji_text: 'テスト告示文' } }
      }));

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    // 1回目の検索
    const input = screen.getByPlaceholderText('住所を入力（例：東京都千代田区丸の内1丁目）');
    fireEvent.change(input, { target: { value: '東京都千代田区' } });
    
    const searchButton = screen.getByLabelText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    // 2回目の検索（キャッシュから取得されるはず）
    fireEvent.click(searchButton);

    await waitFor(() => {
      // 新しいAPIコールは発生しないはず
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it('ヘルプダイアログが正しく表示される', () => {
    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const helpButton = screen.getByLabelText('ヘルプを表示');
    fireEvent.click(helpButton);

    expect(screen.getByText('地図の使い方')).toBeInTheDocument();
    expect(screen.getByText('基本操作')).toBeInTheDocument();
    expect(screen.getByText('用途地域の表示')).toBeInTheDocument();
  });

  it('モバイルビューで正しく表示される', () => {
    // モバイルビューのテスト用にwindowサイズを変更
    global.innerWidth = 375;
    global.innerHeight = 667;
    fireEvent(window, new Event('resize'));

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    // モバイル用のスタイルが適用されていることを確認
    const mapContainer = screen.getByRole('application').parentElement;
    expect(mapContainer).toHaveStyle({ height: 'calc(100vh - 120px)' });
  });
}); 