import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '../ProjectList';

// モックデータ
const mockProjects = [
  {
    id: 1,
    name: 'テストプロジェクト1',
    description: 'テスト説明1',
    status: 'planning'
  },
  {
    id: 2,
    name: 'テストプロジェクト2',
    description: 'テスト説明2',
    status: 'in_progress'
  }
];

// fetchのモック
global.fetch = jest.fn();

const renderProjectList = () => {
  render(
    <BrowserRouter>
      <ProjectList />
    </BrowserRouter>
  );
};

describe('ProjectList', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('プロジェクト一覧を表示する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: mockProjects })
      })
    );

    renderProjectList();

    // ローディング状態の確認
    expect(screen.getByText('プロジェクト一覧')).toBeInTheDocument();

    // プロジェクトデータの表示を確認
    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
      expect(screen.getByText('テストプロジェクト2')).toBeInTheDocument();
    });
  });

  it('新規プロジェクトボタンが機能する', () => {
    renderProjectList();
    const newButton = screen.getByText('新規プロジェクト');
    expect(newButton).toBeInTheDocument();
    fireEvent.click(newButton);
    // React Router の遷移をテスト
    expect(window.location.pathname).toBe('/projects/new');
  });

  it('プロジェクトのステータスが正しく表示される', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: mockProjects })
      })
    );

    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText('計画中')).toBeInTheDocument();
      expect(screen.getByText('進行中')).toBeInTheDocument();
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('APIエラー'))
    );

    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
}); 