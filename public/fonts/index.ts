import { Plus_Jakarta_Sans } from 'next/font/google';

// Single brand typeface for headings and body (see tailwind.config.ts fontFamily.sans)
export const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-jakarta',
    display: 'swap',
});
