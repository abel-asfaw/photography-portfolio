import classNames from 'classnames';

export default function Button({
    children,
    className,
    onButtonClick,
    ...rest
}) {
    const classes = classNames(
        'flex gap-2 rounded-md border-0 bg-green-600 px-4 py-2 text-sm font-semibold text-white',
        className,
    );

    return (
        <button
            type="button"
            onClick={onButtonClick}
            className={classes}
            {...rest}
        >
            {children}
        </button>
    );
}
