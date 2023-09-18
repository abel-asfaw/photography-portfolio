import classNames from 'classnames';

export default function FileInput({ fileInputRef, onInputChange, className, ...rest }) {
    const classes = classNames(
        'rounded-md bg-zinc-800 text-sm text-gray-400 file:mr-2 file:rounded-md',
        'file:rounded-r-none file:border-0 file:bg-sky-500 file:px-4 file:py-2',
        'file:text-sm file:font-semibold file:text-white hover:file:bg-sky-600',
        className,
    );

    return (
        <input
            ref={fileInputRef}
            type="file"
            onChange={onInputChange}
            className={classes}
            {...rest}
        />
    );
}
