import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  circular?: boolean;
  primary?: boolean;
  success?: boolean;
  danger?: boolean;
  className?: string;
}

export function Button({
  circular,
  primary,
  success,
  danger,
  className,
  children,
  ...delegated
}: ButtonProps) {
  const classes = classNames(
    'flex text-sm items-center justify-center duration-300 hover:cursor-pointer',
    {
      'h-10 w-10 rounded-full p-3': circular,
      'h-10 rounded-md px-4 py-2': !circular,
      'bg-gray-50 hover:bg-gray-300': primary,
      'bg-green-600 hover:bg-green-700': success,
      'bg-red-700 hover:bg-red-800': danger,
    },
    className,
  );

  return (
    <button type="button" className={classes} {...delegated}>
      {children}
    </button>
  );
}
