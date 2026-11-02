import { useState } from 'react';
import { Loader, LogIn } from 'react-feather';

import { supabase } from '@/src/api/supabase';
import { Button } from '@/src/components/ui';

const inputClasses =
  'h-10 rounded-md bg-zinc-800 px-3 text-sm text-neutral-200 placeholder:text-gray-500 focus:ring-2 focus:ring-sky-500 focus:outline-none';

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
    <div className="flex grow items-center justify-center p-4">
      <form
        className="flex w-full max-w-xs flex-col gap-3"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          aria-label="Email"
          placeholder="Email"
          autoComplete="username"
          required
          className={inputClasses}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          aria-label="Password"
          placeholder="Password"
          autoComplete="current-password"
          required
          className={inputClasses}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="gap-2 bg-sky-500 text-white hover:cursor-pointer hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
        >
          <SubmitIcon size={16} />
          Sign in
        </Button>
      </form>
    </div>
  );
}
