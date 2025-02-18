import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ZoneSearch from '../ZoneSearch';

// ZMALoaderとZDCのモック
global.ZMALoader = {
  setOnLoad: (callback) => {
    callback({
      center: {},
      zoom: 14,
      auth: 'referer',
      types: ['base'],
      mouseWheelReverseZoom: true
    });
  }
};

global.ZDC = {
  LatLng: class {
    constructor(lat, lng) {
      this.lat = lat;
      this.lng = lng;
    }
  },
  Map: class {
    constructor(element, options, successCallback) {
      this.element = element;
      this.options = options;
      successCallback();
    }
    setCenter() {}
    setZoom() {}
    addControl() {}
    removeWidget() {}
    addWidget() {}
  },
  Marker: class {
    constructor(latLng) {
      this.latLng = latLng;
    }
  },
  ZoomButton: class {},
  Compass: class {},
  ScaleBar: class {}
};

describe('ZoneSearch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    global.fetch.mockImplementation((url) => {
      if (url.includes('search/address')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: "OK",
            result: {
              info: { hit: 1 },
              item: [{
                position: [139.7671, 35.6814]
              }]
            }
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // axiosのモック
    jest.spyOn(require('axios'), 'get').mockImplementation((url) => {
      if (url.includes('/api/landuse')) {
        return Promise.resolve({
          data: {
            type: '11',
            fireArea: '1',
            buildingCoverageRatio: '60',
            floorAreaRatio: '200',
            heightDistrict: '1',
            zoneMap: '市化:11:60:200:準防'
          }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('住所検索フォームが表示される', () => {
    render(<ZoneSearch />);
    expect(screen.getByPlaceholderText(/住所を入力/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('空の住所でエラーメッセージを表示', async () => {
    render(<ZoneSearch />);
    
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('住所を入力してください')).toBeInTheDocument();
    });
  });

  it('正しい住所で検索すると結果を表示', async () => {
    render(<ZoneSearch />);
    
    const input = screen.getByPlaceholderText(/住所を入力/);
    fireEvent.change(input, { target: { value: '東京都千代田区丸の内1丁目' } });
    
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-web.zmaps-api.com/search/address',
        expect.any(Object)
      );
    });

    // 用途地域情報が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('用途地域')).toBeInTheDocument();
      expect(screen.getByText('防火地域')).toBeInTheDocument();
      expect(screen.getByText('建蔽率')).toBeInTheDocument();
      expect(screen.getByText('容積率')).toBeInTheDocument();
    });
  });

  it('APIエラー時にエラーメッセージを表示', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );

    render(<ZoneSearch />);
    
    const input = screen.getByPlaceholderText(/住所を入力/);
    fireEvent.change(input, { target: { value: '不正な住所' } });
    
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/検索中にエラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('住所が見つからない場合にエラーメッセージを表示', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: "OK",
          result: {
            info: { hit: 0 },
            item: []
          }
        })
      })
    );

    render(<ZoneSearch />);
    
    const input = screen.getByPlaceholderText(/住所を入力/);
    fireEvent.change(input, { target: { value: '存在しない住所' } });
    
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('住所が見つかりませんでした')).toBeInTheDocument();
    });
  });
}); 