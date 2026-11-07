import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);

    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
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

  // StyleX class names are generated hashes, so check that each variant
  // yields its own class list rather than asserting specific names.
  it('applies distinct variant styling', () => {
    const { rerender } = render(<Button>Button</Button>);
    const classNames = [screen.getByRole('button').className];

    for (const variant of ['primary', 'danger', 'ghost'] as const) {
      rerender(<Button variant={variant}>Button</Button>);
      classNames.push(screen.getByRole('button').className);
    }
    for (const flag of ['iconOnly', 'large'] as const) {
      rerender(<Button {...{ [flag]: true }}>Button</Button>);
      classNames.push(screen.getByRole('button').className);
    }

    expect(new Set(classNames).size).toBe(classNames.length);
  });

  it('applies xstyle overrides', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    const base = screen.getByRole('button').className;

    rerender(
      <Button variant="primary" xstyle={overrides.danger}>
        Button
      </Button>,
    );

    expect(screen.getByRole('button').className).not.toBe(base);
  });
});

const overrides = stylex.create({
  danger: { backgroundColor: 'red' },
});
