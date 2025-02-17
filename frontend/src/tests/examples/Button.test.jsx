import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/Button';

describe('Buttonコンポーネント', () => {
  test('ボタンが正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  test('クリックイベントが正しく発火する', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    
    const button = screen.getByText('クリック');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled状態が正しく機能する', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>無効ボタン</Button>);
    
    const button = screen.getByText('無効ボタン');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
}); 