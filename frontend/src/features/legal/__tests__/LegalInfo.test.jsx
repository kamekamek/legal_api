import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LegalInfo from '../LegalInfo';

describe('LegalInfo', () => {
  const mockProjectData = {
    zoneMap: {
      useType: '商業地域',
      buildingCoverageRatio: 80,
      floorAreaRatio: 400,
      fireArea: '防火地域',
      zoneDivision: '市街化区域'
    },
    heightDistrict: ['第一種高度地区'],
    buildingRestrictions: {
      law48: {
        allowedUses: ['事務所', '店舗', '共同住宅'],
        restrictions: '深夜営業は制限あり'
      },
      lawAppendix2: {
        category: '第二種',
        restrictions: '騒音規制あり'
      }
    }
  };

  beforeEach(() => {
    console.log('Test setup - mockProjectData:', mockProjectData);
  });

  it('displays legal information correctly', async () => {
    render(<LegalInfo projectData={mockProjectData} />);

    await waitFor(() => {
      expect(screen.getByText('法令情報')).toBeInTheDocument();
    });

    expect(screen.getByText('用途地域情報')).toBeInTheDocument();
    
    await waitFor(() => {
      const zoneTypeText = screen.getByText(/商業地域/);
      expect(zoneTypeText).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/建ぺい率: 80/)).toBeInTheDocument();
      expect(screen.getByText(/容積率: 400/)).toBeInTheDocument();
    });
  });

  it('updates legal information correctly', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(<LegalInfo projectData={mockProjectData} onUpdate={onUpdate} />);
    
    const editButton = screen.getByRole('button', { name: '編集' });
    await user.click(editButton);
    
    await waitFor(() => {
      const zoneTypeSelect = screen.getByLabelText('用途地域');
      expect(zoneTypeSelect).toBeInTheDocument();
    });
    
    const zoneTypeSelect = screen.getByLabelText('用途地域');
    await user.click(zoneTypeSelect);
    
    await waitFor(() => {
      const option = screen.getByRole('option', { name: '商業地域' });
      expect(option).toBeInTheDocument();
    });
    
    const option = screen.getByRole('option', { name: '商業地域' });
    await user.click(option);
    
    const floorAreaRatioInput = screen.getByLabelText('容積率 (%)');
    await user.clear(floorAreaRatioInput);
    await user.type(floorAreaRatioInput, '500');
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        floorAreaRatio: 500,
        zoneType: '商業地域'
      }));
    });
  });
}); 