import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProjectDetail from '../../features/projects/ProjectDetail';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' })
}));

const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'テストプロジェクトの説明',
  status: 'planning',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  location: '東京都千代田区'
};

const mockLegalInfo = {
  zoning: '第一種中高層住居専用地域',
  heightDistrict: '第三種高度地区',
  firePreventionDistrict: '防火地域',
  buildingCoverageRatio: '60%',
  floorAreaRatio: '200%',
  allowedUsages: ['住宅', '店舗']
};

describe('ProjectDetail', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  const renderProjectDetail = () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<ProjectDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('プロジェクト詳細を表示する', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLegalInfo)
      })
    );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText(mockProject.name)).toBeInTheDocument();
      expect(screen.getByText(mockProject.description)).toBeInTheDocument();
      expect(screen.getByText('計画中')).toBeInTheDocument();
    });
  });

  it('編集ボタンが機能する', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      })
    ).mockImplementationOnce(() =>
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
      expect(mockNavigate).toHaveBeenCalledWith('/projects/1/edit');
    });
  });

  it('削除ダイアログを表示する', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      })
    ).mockImplementationOnce(() =>
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
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('プロジェクトの取得に失敗しました'))
    );

    renderProjectDetail();

    await waitFor(() => {
      expect(screen.getByText('プロジェクトの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('住所から法令情報を自動取得する', async () => {
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
          json: () => Promise.resolve({})
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
      const searchButton = screen.getByText('住所から取得');
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByText(mockLegalInfo.zoning)).toBeInTheDocument();
      expect(screen.getByText(mockLegalInfo.heightDistrict)).toBeInTheDocument();
      expect(screen.getByText(mockLegalInfo.firePreventionDistrict)).toBeInTheDocument();
    });
  });
}); 