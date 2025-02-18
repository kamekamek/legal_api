import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ZoneSearch from '../ZoneSearch';

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

  it('住所検索が正しく動作する', async () => {
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

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('用途地域情報が正しく表示される', async () => {
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
        json: () => Promise.resolve(mockLandUseInfo)
      }));

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    // 地図クリックイベントをシミュレート
    const map = await waitFor(() => screen.getByRole('application'));
    fireEvent.click(map);

    await waitFor(() => {
      expect(screen.getByText('用途地域')).toBeInTheDocument();
      expect(screen.getByText('建蔽率')).toBeInTheDocument();
      expect(screen.getByText('容積率')).toBeInTheDocument();
    });
  });

  it('エラー時に適切なメッセージが表示される', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.reject(new Error('検索に失敗しました'))
    );

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('住所を入力（例：東京都千代田区丸の内1丁目）');
    fireEvent.change(input, { target: { value: '不正な住所' } });
    
    const searchButton = screen.getByLabelText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/検索中にエラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('プロジェクトへの保存が正しく動作する', async () => {
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
        json: () => Promise.resolve(mockLandUseInfo)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true
      }));

    render(
      <BrowserRouter>
        <ZoneSearch />
      </BrowserRouter>
    );

    // 地図クリックイベントをシミュレート
    const map = await waitFor(() => screen.getByRole('application'));
    fireEvent.click(map);

    await waitFor(() => {
      const saveButton = screen.getByText('プロジェクトに保存');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('プロジェクトに法令情報を保存しました')).toBeInTheDocument();
    });
  });
}); 