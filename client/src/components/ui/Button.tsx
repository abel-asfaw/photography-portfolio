import * as stylex from '@stylexjs/stylex';

import { shared } from '@/src/styles/shared';
import { colors } from '@/src/styles/tokens.stylex';

// className and style are omitted: StyleX owns them, so pass overrides via
// xstyle, which is applied after the variant styles.
interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** A square button holding only an icon; give it an `aria-label`. */
  iconOnly?: boolean;
  /** The taller buttons in the editor's phone bar and sheets. */
  large?: boolean;
  xstyle?: stylex.StyleXStyles;
}

/** The site's buttons: one primary action, quieter secondary ones. */
export function Button({
  variant = 'secondary',
  iconOnly = false,
  large = false,
  xstyle,
  children,
  ...delegated
}: ButtonProps) {
  return (
    <button
      type="button"
      {...delegated}
      {...stylex.props(
        styles.base,
        shared.focusRing,
        styles[variant],
        iconOnly && styles.iconOnly,
        large && styles.large,
        xstyle,
      )}
    >
      {children}
    </button>
  );
}

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    flexShrink: 0,
    height: '2.75rem',
    paddingInline: '1rem',
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.45 },
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    outlineOffset: 2,
  },
  primary: {
    color: colors.onHighlight,
    backgroundColor: {
      default: colors.highlight,
      ':hover:enabled': colors.highlightHover,
    },
  },
  secondary: {
    color: colors.textLight,
    backgroundColor: {
      default: colors.control,
      ':hover:enabled': colors.controlHover,
    },
  },
  danger: {
    color: colors.white,
    backgroundColor: {
      default: colors.dangerFill,
      ':hover:enabled': colors.dangerFillHover,
    },
  },
  ghost: {
    color: { default: colors.textSubtle, ':hover:enabled': colors.white },
    backgroundColor: {
      default: 'transparent',
      ':hover:enabled': 'rgb(255 255 255 / 0.06)',
    },
  },
  iconOnly: {
    width: '2.75rem',
    paddingInline: 0,
  },
  large: {
    height: '3.125rem',
    borderRadius: '0.75rem',
    fontSize: '0.9375rem',
  },
});
