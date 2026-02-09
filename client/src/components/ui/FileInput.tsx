import classNames from 'classnames';

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  className?: string;
}

export function FileInput({
  fileInputRef,
  className,
  ...delegated
}: FileInputProps) {
  const classes = classNames(
    'h-10 max-w-60 sm:max-w-72 rounded-md bg-zinc-800 text-sm text-gray-400 file:mr-2 file:h-10 file:cursor-pointer',
    'file:rounded-md file:rounded-r-none file:border-0 file:bg-sky-500 file:p-2',
    'file:text-sm file:font-medium file:text-white file:duration-200 hover:file:bg-sky-600',
    className,
  );

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className={classes}
      {...delegated}
    />
  );
}
