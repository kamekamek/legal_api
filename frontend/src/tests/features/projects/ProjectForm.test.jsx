import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectForm from '../../../features/projects/ProjectForm';

// モックの設定
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '1'
  }),
  useNavigate: () => jest.fn()
}));

// グローバルフェッチのモック
global.fetch = jest.fn();

describe('ProjectForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const renderProjectForm = () => {
    return render(
      <BrowserRouter>
        <ProjectForm />
      </BrowserRouter>
    );
  };

  it('renders all required form fields', () => {
    renderProjectForm();
    
    // 必須フィールドの存在確認（より柔軟な検索方法を使用）
    expect(screen.getByRole('heading', { name: /新規プロジェクト作成/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /プロジェクト名/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /説明/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /ステータス/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /開始日/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /終了日/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /住所/i })).toBeInTheDocument();
  });

  it('allows input in form fields', async () => {
    renderProjectForm();
    
    // プロジェクト名の入力テスト
    const nameInput = screen.getByRole('textbox', { name: /プロジェクト名/i });
    fireEvent.change(nameInput, { target: { value: 'テストプロジェクト' } });
    expect(nameInput.value).toBe('テストプロジェクト');

    // 説明の入力テスト
    const descriptionInput = screen.getByRole('textbox', { name: /説明/i });
    fireEvent.change(descriptionInput, { target: { value: 'テストの説明文' } });
    expect(descriptionInput.value).toBe('テストの説明文');

    // ステータスの選択テスト
    const statusSelect = screen.getByRole('combobox', { name: /ステータス/i });
    fireEvent.change(statusSelect, { target: { value: '進行中' } });
    expect(statusSelect.value).toBe('進行中');
  });

  // 住所フィールドが無効化されていることを確認
  it('has disabled address field', () => {
    renderProjectForm();
    const addressInput = screen.getByRole('textbox', { name: /住所/i });
    expect(addressInput).toBeDisabled();
  });

  it('submits form data correctly', async () => {
    // フェッチのモック設定
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1 })
      })
    );

    renderProjectForm();
    
    // フォームに入力
    fireEvent.change(screen.getByRole('textbox', { name: /プロジェクト名/i }), {
      target: { value: 'テストプロジェクト' }
    });
    fireEvent.change(screen.getByRole('textbox', { name: /説明/i }), {
      target: { value: 'テストの説明文' }
    });
    fireEvent.change(screen.getByRole('combobox', { name: /ステータス/i }), {
      target: { value: '進行中' }
    });

    // フォーム送信
    const submitButton = screen.getByRole('button', { name: /保存/i });
    fireEvent.click(submitButton);

    // APIコールの確認
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/projects', expect.any(Object));
    });
  });

  it('displays validation errors', async () => {
    renderProjectForm();
    
    // 必須フィールドを空のまま送信
    const submitButton = screen.getByRole('button', { name: /保存/i });
    fireEvent.click(submitButton);

    // バリデーションエラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('プロジェクト名は必須です')).toBeInTheDocument();
    });
  });
}); 