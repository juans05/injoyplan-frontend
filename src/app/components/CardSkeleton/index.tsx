const CardSkeleton = () => (
    <div className="w-full animate-pulse" aria-hidden>
        <div className="aspect-[4/3] w-full rounded-card bg-line" />
        <div className="mt-3 h-3 w-1/3 rounded bg-line" />
        <div className="mt-2 h-5 w-4/5 rounded bg-line" />
        <div className="mt-2 h-4 w-1/2 rounded bg-line" />
        <div className="mt-4 h-5 w-20 rounded bg-line" />
    </div>
);

export default CardSkeleton;
