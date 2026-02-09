import { createRef } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('renders a file input that accepts multiple files', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput fileInputRef={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current!.type).toBe('file');
    expect(ref.current!.multiple).toBe(true);
  });

  it('forwards the ref for external access', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput fileInputRef={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current!.tagName).toBe('INPUT');
  });

  it('calls onChange when a valid file is selected', async () => {
    const ref = createRef<HTMLInputElement>();
    const handleChange = vi.fn();
    render(<FileInput fileInputRef={ref} onChange={handleChange} />);

    const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    await userEvent.upload(ref.current!, file);

    expect(handleChange).toHaveBeenCalledOnce();
  });

  it('does not call onChange when an invalid file is selected', async () => {
    const ref = createRef<HTMLInputElement>();
    const handleChange = vi.fn();
    render(<FileInput fileInputRef={ref} onChange={handleChange} />);

    const file = new File(['file'], 'file.pdf', { type: 'pdf' });
    await userEvent.upload(ref.current!, file);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('passes through additional HTML attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput fileInputRef={ref} aria-label="Upload" />);

    expect(ref.current!.accept).toBe('image/*');
    expect(ref.current!).toHaveAttribute('aria-label', 'Upload');
  });
});
