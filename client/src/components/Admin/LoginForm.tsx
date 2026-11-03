import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Loader, LogIn } from 'react-feather';

import { supabase } from '@/src/api/supabase';
import { Button } from '@/src/components/ui';
import { colors, radii } from '@/src/styles/tokens.stylex';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) setError(signInError.message);
    setIsPending(false);
  };

  const SubmitIcon = isPending ? Loader : LogIn;

  return (
    <div {...stylex.props(styles.container)}>
      <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
        <input
          type="email"
          aria-label="Email"
          placeholder="Email"
          autoComplete="username"
          required
          {...stylex.props(styles.input)}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          aria-label="Password"
          placeholder="Password"
          autoComplete="current-password"
          required
          {...stylex.props(styles.input)}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" {...stylex.props(styles.error)}>
            {error}
          </p>
        )}
        <Button type="submit" xstyle={styles.submit} disabled={isPending}>
          <SubmitIcon size={16} />
          Sign in
        </Button>
      </form>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    maxWidth: '20rem',
  },
  input: {
    height: '2.5rem',
    paddingInline: '0.75rem',
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.textLight,
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    outline: { default: null, ':focus': 'none' },
    boxShadow: { default: null, ':focus': `0 0 0 2px ${colors.accent}` },
    '::placeholder': {
      color: colors.textMuted,
    },
  },
  error: {
    color: colors.error,
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  submit: {
    gap: '0.5rem',
    backgroundColor: { default: colors.accent, ':hover': colors.accentHover },
    color: colors.white,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: null, ':disabled': 0.5 },
  },
});
