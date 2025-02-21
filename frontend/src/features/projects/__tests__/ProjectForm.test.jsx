import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectForm from '../ProjectForm';

// fetchのモック
global.fetch = jest.fn();

const renderProjectForm = () => {
  render(
    <BrowserRouter>
      <ProjectForm />
    </BrowserRouter>
  );
};

describe('ProjectForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('新規作成フォームを表示する', () => {
    renderProjectForm();
    expect(screen.getByText('新規プロジェクト作成')).toBeInTheDocument();
    expect(screen.getByLabelText('プロジェクト名')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
  });

  it('必須フィールドが空の場合は送信できない', () => {
    renderProjectForm();
    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);
    
    // HTML5のバリデーションメッセージを確認
    const nameInput = screen.getByLabelText('プロジェクト名');
    expect(nameInput).toBeInvalid();
  });

  it('フォームの入力と送信が正常に機能する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1 })
      })
    );

    renderProjectForm();

    // フォームに入力
    fireEvent.change(screen.getByLabelText('プロジェクト名'), {
      target: { value: 'テストプロジェクト' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });

    // フォーム送信
    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/projects',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('APIエラー'))
    );

    renderProjectForm();

    // フォームに入力して送信
    fireEvent.change(screen.getByLabelText('プロジェクト名'), {
      target: { value: 'テストプロジェクト' }
    });
    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(screen.getByText(/プロジェクトの作成に失敗しました/)).toBeInTheDocument();
    });
  });

  it('キャンセルボタンが機能する', () => {
    renderProjectForm();
    fireEvent.click(screen.getByText('キャンセル'));
    expect(window.location.pathname).toBe('/projects');
  });
}); 