import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LegalInfo from '../LegalInfo';

describe('LegalInfo', () => {
  const mockLegalInfo = {
    zoneType: '商業地域',
    buildingCoverageRatio: 80,
    floorAreaRatio: 400,
    firePreventionDistrict: '防火地域',
    heightDistrict: '第一種高度地区',
    buildingRestrictions: {
      article48: {
        allowedUses: ['事務所', '店舗', '共同住宅'],
        otherRestrictions: '深夜営業は制限あり'
      },
      appendix2: {
        category: '第二種',
        restrictions: '騒音規制あり'
      }
    }
  };

  it('displays legal information correctly', () => {
    render(<LegalInfo legalInfo={mockLegalInfo} />);

    expect(screen.getByRole('heading', { name: '法令情報' })).toBeInTheDocument();
    expect(screen.getByText('用途地域情報')).toBeInTheDocument();
    
    const zoneTypeText = screen.getByText(/商業地域/);
    expect(zoneTypeText).toBeInTheDocument();
    
    expect(screen.getByText(/建ぺい率: 80/)).toBeInTheDocument();
    expect(screen.getByText(/容積率: 400/)).toBeInTheDocument();
  });

  it('updates legal information correctly', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(<LegalInfo legalInfo={mockLegalInfo} onUpdate={onUpdate} />);
    
    const editButton = screen.getByRole('button', { name: '編集' });
    await user.click(editButton);
    
    const zoneTypeSelect = screen.getByLabelText('用途地域');
    await user.click(zoneTypeSelect);
    
    const option = screen.getByRole('option', { name: '防火地域' });
    await user.click(option);
    
    const floorAreaRatioInput = screen.getByLabelText('容積率 (%)');
    await user.clear(floorAreaRatioInput);
    await user.type(floorAreaRatioInput, '500');
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    await user.click(saveButton);
    
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      floorAreaRatio: 500
    }));
  });
}); 