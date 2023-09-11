export default function Photo({ imageSrc, className, ...rest }) {
    return (
        <div>
            <img
                src={imageSrc}
                className="h-auto w-96 transform-gpu rounded-2xl duration-700 hover:scale-110"
                {...rest}
            />
        </div>
    );
}
