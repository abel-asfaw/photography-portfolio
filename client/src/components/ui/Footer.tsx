import * as stylex from '@stylexjs/stylex';
import { GitHub } from 'react-feather';

import { colors } from '@/src/styles/tokens.stylex';

export function Footer() {
  return (
    <footer {...stylex.props(styles.footer)}>
      <a
        {...stylex.props(styles.link)}
        aria-label="GitHub portfolio project link"
        href="https://github.com/abel-asfaw/photography-portfolio"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHub size={28} />
      </a>
    </footer>
  );
}

const styles = stylex.create({
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
    color: colors.textMuted,
  },
  link: {
    color: { default: null, ':hover': colors.white },
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)',
  },
});
