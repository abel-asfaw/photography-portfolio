import '@testing-library/jest-dom/vitest';
import { type ComponentProps, createElement } from 'react';
import { vi } from 'vitest';

// Render ImageKit images as plain <img> tags so tests don't depend on the
// ImageKit URL endpoint.
vi.mock('@imagekit/react', () => ({
  Image: ({
    urlEndpoint: _u,
    ...props
  }: ComponentProps<'img'> & { urlEndpoint?: string }) =>
    createElement('img', props),
  buildSrc: ({ src }: { src: string }) => src,
}));
