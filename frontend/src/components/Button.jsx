import classNames from 'classnames';

export default function Button({
    circular,
    primary,
    success,
    danger,
    onButtonClick,
    className,
    children,
    ...rest
}) {
    const classes = classNames(
        'flex text-sm items-center justify-center duration-300',
        {
            'rounded-full p-3': circular,
            'rounded-md px-4 py-2': !circular,
            'bg-gray-50 hover:bg-gray-300': primary,
            'bg-green-600 hover:bg-green-700': success,
            'bg-red-600 hover:bg-red-700': danger,
        },
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
