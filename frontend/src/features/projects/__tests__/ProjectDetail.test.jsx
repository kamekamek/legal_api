import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetail from '../ProjectDetail';

// モックの設定
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '1'
  }),
  useNavigate: () => jest.fn()
}));

const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'テストプロジェクトの説明',
  status: 'planning',
  location: '東京都千代田区',
  legalInfo: {
    zoneMap: {
      zoneDivision: '市街化区域',
      useType: '第一種住居地域',
      buildingCoverageRatio: '60',
      floorAreaRatio: '200',
      fireArea: '準防火地域'
    },
    heightDistrict: ['第一種高度地区']
  }
};

describe('ProjectDetail', () => {
  beforeEach(() => {
    // APIモックのリセット
    global.fetch = jest.fn();
  });

  it('プロジェクト情報が正しく表示される', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'テストプロジェクト',
          description: 'テストプロジェクトの説明',
          status: '進行中'
        })
      })
    );

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
    });

    expect(screen.getByText('テストプロジェクトの説明')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
  });

  it('法令情報の取得ボタンが正しく動作する', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'テストプロジェクト',
          address: '東京都千代田区'
        })
      })
    );

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
    });

    const addressButton = screen.getByRole('button', { name: /住所から取得/ });
    const mapButton = screen.getByRole('button', { name: /地図から検索/ });
    
    expect(addressButton).toBeInTheDocument();
    expect(mapButton).toBeInTheDocument();

    await user.click(addressButton);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects/1/legal-info')
    );
  });

  it('エラー時に適切なメッセージが表示される', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('エラーが発生しました')));

    await waitFor(() => {
      render(
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      );
    });

    const errorMessage = await screen.findByText('エラーが発生しました');
    expect(errorMessage).toBeInTheDocument();
  });

  it('プロジェクトが存在しない場合の表示', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 404
    }));

    await waitFor(() => {
      render(
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      );
    });

    const notFoundMessage = await screen.findByText('プロジェクトの取得に失敗しました');
    expect(notFoundMessage).toBeInTheDocument();
  });

  it('削除確認ダイアログが正しく動作する', async () => {
    const user = userEvent.setup();
    
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      }));

    await waitFor(() => {
      render(
        <BrowserRouter>
          <ProjectDetail />
        </BrowserRouter>
      );
    });

    const deleteButton = await screen.findByText('削除');
    await user.click(deleteButton);

    const dialogTitle = await screen.findByText('プロジェクトを削除しますか？');
    const dialogContent = await screen.findByText('この操作は取り消すことができません。本当にプロジェクトを削除しますか？');
    
    expect(dialogTitle).toBeInTheDocument();
    expect(dialogContent).toBeInTheDocument();
  });
}); 