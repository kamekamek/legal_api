import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetail from '../ProjectDetail';

// React Routerのパラメータをモック
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

// fetchのモック
global.fetch = jest.fn();

const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'テスト説明',
  status: 'planning',
  start_date: '2024-02-01',
  end_date: '2024-12-31'
};

const renderProjectDetail = () => {
  render(
    <BrowserRouter>
      <ProjectDetail />
    </BrowserRouter>
  );
};

describe('ProjectDetail', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('プロジェクト詳細を表示する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject)
      })
    );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText(mockProject.name)).toBeInTheDocument();
      expect(screen.getByText(mockProject.description)).toBeInTheDocument();
      expect(screen.getByText('計画中')).toBeInTheDocument();
    });
  });

  it('編集ボタンが機能する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject)
      })
    );

    renderProjectDetail();

    await waitFor(() => {
      const editButton = screen.getByText('編集');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
      // React Router の遷移をテスト
      expect(window.location.pathname).toMatch(/\/projects\/1\/edit/);
    });
  });

  it('削除ダイアログを表示する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject)
      })
    );

    renderProjectDetail();

    await waitFor(() => {
      const deleteButton = screen.getByText('削除');
      fireEvent.click(deleteButton);
      expect(screen.getByText('プロジェクトの削除')).toBeInTheDocument();
      expect(screen.getByText(/この操作は取り消すことができません/)).toBeInTheDocument();
    });
  });

  it('削除を実行する', async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProject)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const deleteButton = screen.getByText('削除');
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByText('削除', { selector: 'button' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/projects/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('APIエラー'))
    );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText(/プロジェクトの取得に失敗しました/)).toBeInTheDocument();
    });
  });
}); 