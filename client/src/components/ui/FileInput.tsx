import * as stylex from '@stylexjs/stylex';

import { breakpoints, colors, radii } from '@/src/styles/tokens.stylex';

// className is omitted: StyleX owns it.
interface FileInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className'
> {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function FileInput({ fileInputRef, ...delegated }: FileInputProps) {
  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      {...delegated}
      {...stylex.props(styles.input)}
    />
  );
}

const styles = stylex.create({
  input: {
    height: '2.5rem',
    maxWidth: { default: '15rem', [breakpoints.sm]: '18rem' },
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.textDim,
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    '::file-selector-button': {
      height: '2.5rem',
      marginRight: '0.5rem',
      padding: '0.5rem',
      borderRadius: radii.md,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      backgroundColor: { default: colors.accent, ':hover': colors.accentHover },
      color: colors.white,
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transitionDuration: '200ms',
    },
  },
});
