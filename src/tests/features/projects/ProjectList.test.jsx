import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '../../features/projects/ProjectList';

describe('ProjectList', () => {
  const mockProjects = [
    {
      id: 1,
      name: 'テストプロジェクト1',
      status: '進行中',
    },
    {
      id: 2,
      name: 'テストプロジェクト2',
      status: '完了',
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderProjectList = () => {
    return render(
      <BrowserRouter>
        <ProjectList />
      </BrowserRouter>
    );
  };

  test('プロジェクト一覧を表示する', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: mockProjects }),
      })
    );

    await act(async () => {
      renderProjectList();
    });

    expect(screen.getByText('プロジェクト一覧')).toBeInTheDocument();
    expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
    expect(screen.getByText('テストプロジェクト2')).toBeInTheDocument();
  });

  test('APIエラー時にエラーメッセージを表示する', async () => {
    const errorMessage = 'プロジェクト一覧の取得に失敗しました';
    global.fetch = jest.fn(() =>
      Promise.reject(new Error(errorMessage))
    );

    await act(async () => {
      renderProjectList();
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(errorMessage);
  });
}); 