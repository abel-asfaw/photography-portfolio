import * as stylex from '@stylexjs/stylex';

import { colors } from '@/src/styles/tokens.stylex';

/** Styles shared across components; pass them to `stylex.props`. */
export const shared = stylex.create({
  /** The highlight outline on keyboard focus, and none otherwise. */
  focusRing: {
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colors.highlight}`,
    },
  },
});
