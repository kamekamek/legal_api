import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProjectForm from '../../features/projects/ProjectForm';

// モックの設定
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: undefined }),
}));

describe('ProjectForm', () => {
  const renderProjectForm = () => {
    return render(
      <BrowserRouter>
        <ProjectForm />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('フォームが正しく表示される', async () => {
    renderProjectForm();
    
    expect(screen.getByLabelText(/プロジェクト名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument();
  });

  it('フォームに入力できる', async () => {
    const user = userEvent.setup();
    renderProjectForm();

    // プロジェクト名と説明の入力
    await user.type(screen.getByRole('textbox', { name: /プロジェクト名/i }), 'テストプロジェクト');
    await user.type(screen.getByRole('textbox', { name: /説明/i }), 'テストの説明');

    // ステータスの選択
    const statusSelect = screen.getByTestId('status-select');
    await user.click(statusSelect);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /進行中/i }));

    // 入力値の確認
    expect(screen.getByRole('textbox', { name: /プロジェクト名/i })).toHaveValue('テストプロジェクト');
    expect(screen.getByRole('textbox', { name: /説明/i })).toHaveValue('テストの説明');
    expect(statusSelect).toHaveTextContent(/進行中/i);
  });

  it('フォームデータが正しく送信される', async () => {
    const user = userEvent.setup();
    renderProjectForm();

    // フォームに入力
    await user.type(screen.getByRole('textbox', { name: /プロジェクト名/i }), 'テストプロジェクト');
    await user.type(screen.getByRole('textbox', { name: /説明/i }), 'テストの説明');

    // ステータスの選択
    const statusSelect = screen.getByTestId('status-select');
    await user.click(statusSelect);
    const option = screen.getByRole('option', { name: /進行中/i });
    await user.click(option);

    // フォームの送信
    await user.click(screen.getByRole('button', { name: /保存/i }));

    // APIコールの確認
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'テストプロジェクト',
          description: 'テストの説明',
          status: 'in_progress',
        }),
      })
    );
  });

  it('バリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    renderProjectForm();

    // 空のフォームを送信
    await user.click(screen.getByRole('button', { name: /保存/i }));

    // バリデーションエラーメッセージの表示を確認
    await waitFor(() => {
      const nameInput = screen.getByRole('textbox', { name: /プロジェクト名/i });
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      const errorMessage = screen.getByText(/プロジェクト名は必須です/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('ステータスを選択できる', async () => {
    const user = userEvent.setup();
    renderProjectForm();

    const statusSelect = screen.getByTestId('status-select');
    await user.click(statusSelect);
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('option', { name: /進行中/i }));
    
    expect(statusSelect).toHaveTextContent(/進行中/i);
  });
}); 