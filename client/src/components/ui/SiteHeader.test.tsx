import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { SiteHeader } from './SiteHeader';

const scrollTo = (y: number) =>
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    fireEvent.scroll(window);
  });

const header = () => screen.getByRole('banner');

const renderHeader = (hideOnScroll: boolean) =>
  render(
    <MemoryRouter>
      <SiteHeader hideOnScroll={hideOnScroll} />
    </MemoryRouter>,
  );

describe('SiteHeader', () => {
  afterEach(() => scrollTo(0));

  it('hides on scrolling down and shows again on scrolling up', () => {
    renderHeader(true);

    scrollTo(400);
    expect(header()).toHaveAttribute('data-hidden');

    scrollTo(300);
    expect(header()).not.toHaveAttribute('data-hidden');
  });

  it('ignores tiny scrolls', () => {
    renderHeader(true);

    scrollTo(400);
    scrollTo(396);
    expect(header()).toHaveAttribute('data-hidden');
  });

  it('always shows near the top of the page', () => {
    renderHeader(true);

    scrollTo(400);
    scrollTo(500);
    scrollTo(40);
    expect(header()).not.toHaveAttribute('data-hidden');
  });

  it('stays put without hideOnScroll', () => {
    renderHeader(false);

    scrollTo(400);
    expect(header()).not.toHaveAttribute('data-hidden');
  });
});
