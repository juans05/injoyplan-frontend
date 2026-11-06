import Link from 'next/link';

interface Props {
    id?: string;
    title: string;
    description?: string;
    link?: { href: string; label: string };
}

// Section title row used across the home page
const SectionHeader = ({ id, title, description, link }: Props) => (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:mb-8">
        <div className="max-w-2xl">
            <h2 id={id} className="heading-2">{title}</h2>
            {description && <p className="mt-2 text-body text-ink-soft">{description}</p>}
        </div>
        {link && (
            <Link href={link.href} className="-my-2 inline-block py-2.5 text-label text-brand underline-offset-4 hover:underline">
                {link.label}
            </Link>
        )}
    </div>
);

export default SectionHeader;
