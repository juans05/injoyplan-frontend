import parse, { DOMNode, Element, HTMLReactParserOptions, domToReact } from 'html-react-parser';

// Allowlist: anything not listed is dropped (with its content for DROP, unwrapped otherwise).
const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4', 'blockquote', 'span', 'div']);
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'noscript', 'textarea', 'select', 'title', 'head']);
const SAFE_URL = /^(https?:|mailto:)/i;

const options: HTMLReactParserOptions = {
    replace(node: DOMNode) {
        if (!(node instanceof Element)) return;
        if (DROP_WITH_CONTENT.has(node.name)) return <></>;
        const children = domToReact(node.children as DOMNode[], options);
        if (!ALLOWED_TAGS.has(node.name)) return <>{children}</>;
        if (node.name === 'a') {
            // Strip control chars and spaces browsers ignore before checking the scheme
            const href = (node.attribs.href || '').replace(/[\u0000- ]/g, '');
            if (!SAFE_URL.test(href)) return <>{children}</>;
            return <a href={href} target="_blank" rel="noopener noreferrer nofollow">{children}</a>;
        }
        // Allowed tag, but no attributes at all (no on*, style, src...)
        const Tag = node.name as keyof React.JSX.IntrinsicElements;
        return node.name === 'br' ? <br /> : <Tag>{children}</Tag>;
    },
};

// Renders user-provided HTML (event descriptions) without executable content.
export function safeHtml(html?: string | null) {
    if (!html) return null;
    return parse(html, options);
}
