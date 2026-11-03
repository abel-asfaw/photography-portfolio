import * as stylex from '@stylexjs/stylex';

import { colors, radii } from '@/src/styles/tokens.stylex';

// className is omitted: StyleX owns it, so pass overrides via xstyle.
interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  circular?: boolean;
  primary?: boolean;
  success?: boolean;
  danger?: boolean;
  /** StyleX overrides, applied after the variant styles. */
  xstyle?: stylex.StyleXStyles;
}

export function Button({
  circular,
  primary,
  success,
  danger,
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
        circular ? styles.circular : styles.pill,
        primary && styles.primary,
        success && styles.success,
        danger && styles.danger,
        xstyle,
      )}
    >
      {children}
    </button>
  );
}

const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '2.5rem',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    transitionDuration: '300ms',
  },
  circular: {
    width: '2.5rem',
    padding: '0.75rem',
    borderRadius: '9999px',
  },
  pill: {
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    borderRadius: radii.md,
  },
  primary: {
    backgroundColor: { default: colors.light, ':hover': colors.lightHover },
  },
  success: {
    backgroundColor: { default: colors.success, ':hover': colors.successHover },
  },
  danger: {
    backgroundColor: { default: colors.danger, ':hover': colors.dangerHover },
  },
});
