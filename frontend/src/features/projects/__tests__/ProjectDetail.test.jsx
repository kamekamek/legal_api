import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProjectDetail from '../ProjectDetail';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' })
}));

const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'テスト説明',
  status: '計画中'
};

const mockLegalInfo = {
  zoning: '第一種住居地域',
  height: '第一種高度地区',
  usage: '住宅'
};

describe('ProjectDetail', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  const renderProjectDetail = () => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<ProjectDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('プロジェクト詳細を表示する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ project: mockProject })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo)
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText(mockProject.name)).toBeInTheDocument();
      expect(screen.getByText(mockProject.description)).toBeInTheDocument();
      expect(screen.getByText(mockProject.status)).toBeInTheDocument();
    });
  });

  it('編集ボタンが機能する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ project: mockProject })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo)
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const editButton = screen.getByText('プロジェクトを編集');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
      expect(mockNavigate).toHaveBeenCalledWith(`/projects/${mockProject.id}/edit`);
    });
  });

  it('削除ダイアログを表示する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ project: mockProject })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo)
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const deleteButton = screen.getByText('削除する');
      fireEvent.click(deleteButton);
      expect(screen.getByText('プロジェクトの削除')).toBeInTheDocument();
    });
  });

  it('削除を実行する', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ project: mockProject })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLegalInfo)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true
        })
      );

    renderProjectDetail();

    await waitFor(() => {
      const deleteButton = screen.getByText('削除する');
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByText('削除');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/projects');
    });
  });

  it('APIエラー時にエラーメッセージを表示する', async () => {
    global.fetch.mockImplementation(() =>
      Promise.reject(new Error('APIエラー'))
    );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText('APIエラー')).toBeInTheDocument();
    });
  });
}); 