import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetail from '../ProjectDetail';

// モックの設定
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
}));

const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'テストの説明',
  status: '計画中',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  address: '東京都千代田区',
};

const mockLegalInfo = {
  use_district: '第一種住居地域',
  height_district: '第一種高度地区',
  use_restrictions: ['住宅', '店舗'],
};

describe('ProjectDetail', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  const renderProjectDetail = () => {
    return render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );
  };

  it('プロジェクト詳細を表示する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProject),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo),
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockProject.name })).toBeInTheDocument();
      expect(screen.getByText(mockProject.description)).toBeInTheDocument();
      expect(screen.getByText('計画中')).toBeInTheDocument();
    });
  });

  it('編集ボタンが機能する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProject),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo),
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /編集/ });
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });
  });

  it('削除ダイアログを表示する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProject),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo),
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /削除/ });
      fireEvent.click(deleteButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('プロジェクトの削除')).toBeInTheDocument();
    });
  });

  it('削除を実行する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProject),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /削除/ });
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByRole('button', { name: /確認/ });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/projects/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    global.fetch.mockImplementation(() =>
      Promise.reject(new Error('プロジェクトの取得に失敗しました'))
    );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText('プロジェクトの取得に失敗しました')).toBeInTheDocument();
    });
  });
}); 