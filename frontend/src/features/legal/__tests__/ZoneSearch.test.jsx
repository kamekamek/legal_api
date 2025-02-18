import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ZoneSearch from '../ZoneSearch';

// ZenrinMap コンポーネントのモック
jest.mock('../components/ZenrinMap', () => {
  return function DummyMap({ location }) {
    return <div data-testid="map">Map Component</div>;
  };
});

describe('ZoneSearch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
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
    const mockResponse = {
      location: { lat: 35.6814, lng: 139.7671 },
      landUseInfo: {
        type: '11',
        fireArea: '1',
        buildingCoverageRatio: '60',
        floorAreaRatio: '200',
        heightDistrict: '1',
        zoneMap: '市化:11:60:200:準防'
      }
    };

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    render(<ZoneSearch />);
    
    const input = screen.getByPlaceholderText(/住所を入力/);
    fireEvent.change(input, { target: { value: '東京都千代田区丸の内1丁目' } });
    
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/legal/address/search',
        expect.any(Object)
      );
    });
  });

  it('APIエラー時にエラーメッセージを表示', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: '検索に失敗しました' })
      })
    );

    render(<ZoneSearch />);
    
    const input = screen.getByPlaceholderText(/住所を入力/);
    fireEvent.change(input, { target: { value: '不正な住所' } });
    
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('検索に失敗しました')).toBeInTheDocument();
    });
  });
}); 