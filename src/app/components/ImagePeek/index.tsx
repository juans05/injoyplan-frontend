'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const W = 380;
const GAP = 12;

interface IProps {
    src?: string | null;
    alt?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Wraps a cropped event image. On hover (mouse only) shows the original, uncropped
 * image beside it. Required by law: the original artwork must be viewable.
 * Touch devices see the uncropped image on the event detail page.
 */
export default function ImagePeek({ src, alt = '', className, children }: IProps) {
    const [left, setLeft] = useState<number | null>(null);

    useEffect(() => {
        if (left === null) return;
        const hide = () => setLeft(null);
        window.addEventListener('scroll', hide, { passive: true });
        return () => window.removeEventListener('scroll', hide);
    }, [left]);

    const show = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!src || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        const vw = window.innerWidth;
        // Right side if it fits, else left, else hug the right edge of the viewport
        setLeft(r.right + GAP + W <= vw ? r.right + GAP : r.left - GAP - W >= 0 ? r.left - GAP - W : vw - W - GAP);
    };

    return (
        <div className={className} onMouseEnter={show} onMouseLeave={() => setLeft(null)}>
            {children}
            {left !== null && src && createPortal(
                <div className="pointer-events-none fixed z-[100] flex items-center" style={{ left, top: GAP, bottom: GAP, width: W }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- original file, no optimizer/crop */}
                    <img src={src.trim()} alt={alt} className="max-h-full w-full rounded-card bg-white object-contain shadow-2xl ring-1 ring-black/10" />
                </div>,
                document.body,
            )}
        </div>
    );
}
