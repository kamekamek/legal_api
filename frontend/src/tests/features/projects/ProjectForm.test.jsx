import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProjectForm from '../../features/projects/ProjectForm';

describe('ProjectForm', () => {
  const renderProjectForm = () => {
    return render(
      <BrowserRouter>
        <ProjectForm />
      </BrowserRouter>
    );
  };

  it('フォームが正しく表示される', async () => {
    renderProjectForm();

    expect(screen.getByRole('heading', { name: '新規プロジェクト作成' })).toBeInTheDocument();
    expect(screen.getByLabelText(/プロジェクト名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ステータス/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('フォームフィールドに入力できる', async () => {
    const user = userEvent.setup();
    renderProjectForm();

    const nameInput = screen.getByLabelText(/プロジェクト名/);
    const descriptionInput = screen.getByLabelText(/説明/);
    const statusSelect = screen.getByLabelText(/ステータス/);

    await user.type(nameInput, 'テストプロジェクト');
    await user.type(descriptionInput, 'テストの説明');
    await user.click(statusSelect);
    await user.click(screen.getByText('進行中'));

    expect(nameInput).toHaveValue('テストプロジェクト');
    expect(descriptionInput).toHaveValue('テストの説明');
    expect(statusSelect).toHaveTextContent('進行中');
  });

  it('フォームデータが正しく送信される', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    
    render(
      <BrowserRouter>
        <ProjectForm onSubmit={mockOnSubmit} />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/プロジェクト名/), 'テストプロジェクト');
    await user.type(screen.getByLabelText(/説明/), 'テストの説明');
    await user.click(screen.getByLabelText(/ステータス/));
    await user.click(screen.getByText('進行中'));

    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'テストプロジェクト',
      description: 'テストの説明',
      status: 'in_progress'
    });
  });

  it('バリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    renderProjectForm();

    const submitButton = screen.getByRole('button', { name: '保存' });
    await user.click(submitButton);

    const errorMessage = await screen.findByText('プロジェクト名は必須です');
    expect(errorMessage).toBeInTheDocument();
  });
}); 