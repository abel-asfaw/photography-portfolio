import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Photo } from '@/src/api/schemas/photos.schema';

import { PhotoOverlay } from './PhotoOverlay';

const presence = vi.hoisted(() => ({ isPresent: true }));

// Render Motion elements as plain tags, with taps as clicks and each
// animation's direction (`custom`) exposed as a data attribute.
vi.mock('motion/react', () => {
  const element =
    (tag: string) =>
    ({
      onTap,
      custom,
      variants: _v,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      onPanEnd: _p,
      ...props
    }: Record<string, unknown> & { onTap?: () => void }) =>
      createElement(tag, { onClick: onTap, 'data-custom': custom, ...props });
  return {
    motion: {
      div: element('div'),
      button: element('button'),
      nav: element('nav'),
    },
    AnimatePresence: ({
      children,
      custom,
    }: {
      children: ReactNode;
      custom?: number;
    }) => createElement('div', { 'data-presence-custom': custom }, children),
    useIsPresent: () => presence.isPresent,
  };
});

const photos: Photo[] = ['1', '2', '3'].map(id => ({
  id,
  name: `${id}.jpg`,
  url: `https://example.com/${id}.jpg`,
}));

const renderOverlay = (index = 0) => {
  const onNavigate = vi.fn();
  const onClose = vi.fn();
  render(
    <PhotoOverlay
      photos={photos}
      index={index}
      onNavigate={onNavigate}
      onClose={onClose}
    />,
  );
  return { onNavigate, onClose };
};

// Steps for real: the overlay moves to whatever photo it navigates to.
function Viewer() {
  const [index, setIndex] = useState(0);
  return (
    <PhotoOverlay
      photos={photos}
      index={index}
      onNavigate={setIndex}
      onClose={() => {}}
    />
  );
}

// The photo's motion element and the AnimatePresence around it.
const photoDirection = () =>
  document.querySelector('[data-custom]')!.getAttribute('data-custom');
const exitDirection = () =>
  document
    .querySelector('[data-presence-custom]')!
    .getAttribute('data-presence-custom');

describe('PhotoOverlay', () => {
  beforeEach(() => {
    presence.isPresent = true;
  });

  it('shows where the photo sits in the set', () => {
    renderOverlay(1);

    expect(screen.getByText('02 / 03')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show photo 2' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  it('steps with the tap zones, wrapping at the ends', async () => {
    const { onNavigate } = renderOverlay(2);

    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Previous photo' }),
    );

    expect(onNavigate.mock.calls).toEqual([[0], [1]]);
  });

  it('steps with the arrow keys', () => {
    const { onNavigate } = renderOverlay(0);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(onNavigate.mock.calls).toEqual([[2], [1]]);
  });

  it('closes on Escape through the dialog cancel event', () => {
    const { onClose } = renderOverlay(0);
    const cancel = new Event('cancel', { cancelable: true });

    fireEvent(screen.getByRole('dialog'), cancel);

    expect(onClose).toHaveBeenCalledOnce();
    // Left to the parent, so the exit animation runs.
    expect(cancel.defaultPrevented).toBe(true);
  });

  it('rises in on open, then slides in from the side stepped towards', async () => {
    render(<Viewer />);
    expect(photoDirection()).toBe('0');

    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(photoDirection()).toBe('1');
    expect(exitDirection()).toBe('1');

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(photoDirection()).toBe('-1');

    // A thumbnail to the right slides in from the right, even past the end.
    await userEvent.click(screen.getByRole('button', { name: 'Show photo 3' }));
    expect(photoDirection()).toBe('1');
  });

  it('sinks the photo when the whole viewer closes', () => {
    presence.isPresent = false;
    renderOverlay(0);

    expect(exitDirection()).toBe('0');
    // AnimatePresence animates it out; rendering it too mounts a duplicate.
    expect(document.querySelector('[data-custom]')).toBeNull();
  });

  it('moves focus to the close button when it opens', () => {
    renderOverlay(0);

    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('stops the page scrolling while open', () => {
    const { unmount } = render(<Viewer />);
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('jumps to a photo from the thumbnail strip', async () => {
    const { onNavigate } = renderOverlay(0);

    await userEvent.click(screen.getByRole('button', { name: 'Show photo 3' }));

    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('closes from the close button', async () => {
    const { onClose } = renderOverlay(0);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('ignores navigation while it animates out', async () => {
    presence.isPresent = false;
    const { onNavigate } = renderOverlay(0);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Show photo 3' }));

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
