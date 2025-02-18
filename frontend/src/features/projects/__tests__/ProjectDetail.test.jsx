import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject.legalInfo)
      }));

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
      expect(screen.getByText('テストプロジェクトの説明')).toBeInTheDocument();
      expect(screen.getByText('計画中')).toBeInTheDocument();
    });
  });

  it('法令情報の取得ボタンが正しく動作する', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject.legalInfo)
      }));

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('住所から取得')).toBeInTheDocument();
      expect(screen.getByText('地図から検索')).toBeInTheDocument();
    });
  });

  it('エラー時に適切なメッセージが表示される', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('エラーが発生しました')));

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  it('プロジェクトが存在しない場合の表示', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 404
    }));

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりませんでした。')).toBeInTheDocument();
    });
  });

  it('削除確認ダイアログが正しく動作する', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ project: mockProject })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProject.legalInfo)
      }));

    render(
      <BrowserRouter>
        <ProjectDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      const deleteButton = screen.getByText('削除する');
      fireEvent.click(deleteButton);
    });

    expect(screen.getByText('プロジェクトを削除しますか？')).toBeInTheDocument();
    expect(screen.getByText('この操作は取り消すことができません。本当にプロジェクトを削除しますか？')).toBeInTheDocument();
  });
}); 