import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectForm from '../../../features/projects/ProjectForm';

// モックの設定
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: undefined }),
  useNavigate: () => jest.fn()
}));

// グローバルフェッチのモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

describe('ProjectForm', () => {
  const renderProjectForm = () => {
    return render(
      <BrowserRouter>
        <ProjectForm />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // フェッチのモック
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required form fields', async () => {
    renderProjectForm();
    
    // ローディング状態が終わるまで待機
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // 必須フィールドの存在確認
    expect(screen.getByRole('heading', { name: /新規プロジェクト作成/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /プロジェクト名/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /説明/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ステータス/i)).toBeInTheDocument();
  });

  it('allows input in form fields', async () => {
    renderProjectForm();

    // ローディング状態が終わるまで待機
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // プロジェクト名の入力テスト
    const nameInput = screen.getByRole('textbox', { name: /プロジェクト名/i });
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'テストプロジェクト' } });
    });
    expect(nameInput.value).toBe('テストプロジェクト');

    // 説明の入力テスト
    const descriptionInput = screen.getByRole('textbox', { name: /説明/i });
    await act(async () => {
      fireEvent.change(descriptionInput, { target: { value: 'テストの説明' } });
    });
    expect(descriptionInput.value).toBe('テストの説明');

    // ステータスの選択テスト
    const statusSelect = screen.getByLabelText(/ステータス/i);
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
    });
    expect(statusSelect.value).toBe('in_progress');
  });

  it('has disabled address field', async () => {
    renderProjectForm();

    // ローディング状態が終わるまで待機
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addressInput = screen.getByRole('textbox', { name: /住所/i });
    expect(addressInput).toBeDisabled();
  });

  it('submits form data correctly', async () => {
    renderProjectForm();

    // ローディング状態が終わるまで待機
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // フォームに入力
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /プロジェクト名/i }), {
        target: { value: 'テストプロジェクト' }
      });
      fireEvent.change(screen.getByRole('textbox', { name: /説明/i }), {
        target: { value: 'テストの説明' }
      });
      fireEvent.change(screen.getByLabelText(/ステータス/i), {
        target: { value: 'in_progress' }
      });
    });

    // フォーム送信
    const submitButton = screen.getByRole('button', { name: /保存/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // APIが呼び出されたことを確認
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('displays validation errors', async () => {
    renderProjectForm();

    // ローディング状態が終わるまで待機
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // 必須フィールドを空のまま送信
    const submitButton = screen.getByRole('button', { name: /保存/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // バリデーションエラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('プロジェクト名は必須です')).toBeInTheDocument();
    });
  });
}); 