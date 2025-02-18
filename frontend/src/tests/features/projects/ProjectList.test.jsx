import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '../../../features/projects/ProjectList';

// モックの設定
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// グローバルフェッチのモック
global.fetch = jest.fn();

describe('ProjectList', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const mockProjects = [
    {
      id: 1,
      name: 'テストプロジェクト1',
      description: 'テスト説明1',
      status: '計画中',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      location: '東京都渋谷区'
    },
    {
      id: 2,
      name: 'テストプロジェクト2',
      description: 'テスト説明2',
      status: '進行中',
      start_date: '2024-02-01',
      end_date: '2024-11-30',
      location: '東京都新宿区'
    }
  ];

  const renderProjectList = () => {
    return render(
      <BrowserRouter>
        <ProjectList />
      </BrowserRouter>
    );
  };

  it('プロジェクト一覧を表示する', async () => {
    // フェッチのモック設定
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: mockProjects })
      })
    );

    renderProjectList();

    // プロジェクト一覧の表示を確認
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'プロジェクト一覧' })).toBeInTheDocument();
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
      expect(screen.getByText('テストプロジェクト2')).toBeInTheDocument();
    });
  });

  it('新規プロジェクト作成ボタンが機能する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: [] })
      })
    );

    renderProjectList();
    
    // 新規プロジェクト作成ボタンをクリック
    const createButton = screen.getByRole('button', { name: /新規プロジェクト/i });
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    // エラーレスポンスのモック
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('プロジェクト一覧の取得に失敗しました'))
    );

    renderProjectList();

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('プロジェクト一覧の取得に失敗しました')).toBeInTheDocument();
    });
  });
}); 