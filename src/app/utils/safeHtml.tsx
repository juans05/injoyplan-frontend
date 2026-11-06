import parse, { DOMNode, Element } from 'html-react-parser';

const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'base']);

// Renders user-provided HTML (event descriptions) without executable content.
export function safeHtml(html?: string | null) {
    if (!html) return null;
    return parse(html, {
        replace(node: DOMNode) {
            if (!(node instanceof Element)) return;
            if (BLOCKED_TAGS.has(node.name)) return <></>;
            for (const name of Object.keys(node.attribs)) {
                const value = node.attribs[name].trim().toLowerCase();
                if (name.startsWith('on') || value.startsWith('javascript:') || value.startsWith('data:text/html')) {
                    delete node.attribs[name];
                }
            }
        },
    });
}
