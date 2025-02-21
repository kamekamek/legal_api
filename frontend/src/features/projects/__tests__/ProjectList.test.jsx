import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '../ProjectList';

const mockProjects = [
  {
    id: 1,
    name: 'テストプロジェクト1',
    description: 'テストプロジェクト1の説明',
    status: '進行中'
  },
  {
    id: 2,
    name: 'テストプロジェクト2',
    description: 'テストプロジェクト2の説明',
    status: '完了'
  }
];

describe('ProjectList', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderProjectList = () => {
    return render(
      <BrowserRouter>
        <ProjectList />
      </BrowserRouter>
    );
  };

  it('プロジェクト一覧が正しく表示される', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ projects: mockProjects })
      })
    );

    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
    });

    expect(screen.getByText('テストプロジェクト2')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    const errorMessage = 'プロジェクト一覧の取得に失敗しました';
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    renderProjectList();

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(errorMessage);
    });
  });

  it('新規プロジェクトボタンが正しく動作する', async () => {
    const user = userEvent.setup();
    renderProjectList();

    const newProjectButton = screen.getByRole('button', { name: '新規プロジェクト' });
    expect(newProjectButton).toBeInTheDocument();

    await user.click(newProjectButton);
    // ここでナビゲーションの確認を行う場合は、モックのルーターコンテキストを使用する必要があります
  });
}); 