import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button primary>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-50');

    rerender(<Button danger>Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-700');

    rerender(<Button success>Success</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');
  });

  it('applies circular styling', () => {
    render(<Button circular>X</Button>);

    expect(screen.getByRole('button')).toHaveClass('rounded-full');
  });
});
