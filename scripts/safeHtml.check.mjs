// Run: npx tsx scripts/safeHtml.check.mjs — fails if a known XSS payload survives the sanitizer
import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
globalThis.React = React; // the component file uses the automatic JSX runtime under Next
const { safeHtml } = await import('../src/app/utils/safeHtml.tsx');
const r = (h) => renderToStaticMarkup(React.createElement(React.Fragment, null, safeHtml(h)));
const bad = ['<img src=x onerror=alert(1)>', '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>', '<a href="jav&#x09;ascript:alert(1)">x</a>',
  '<p style="background:url(javascript:alert(1))" onclick="alert(1)">x</p>', '<math><mtext><img src=x onerror=alert(1)></mtext></math>',
  '<script>alert(1)</script>', '<iframe srcdoc="<script>alert(1)</script>"></iframe>', '<details open ontoggle=alert(1)>x</details>'];
for (const b of bad) {
  const o = r(b);
  assert(!/onerror|onclick|ontoggle|javascript|<script|<svg|<img|<iframe|style=/i.test(o), `${b} => ${o}`);
}
const good = r('<p>Hola <strong>Lima</strong><br>Entradas: <a href="https://joinnus.com/x">aquí</a></p><ul><li>uno</li></ul>');
assert(good.includes('<strong>Lima</strong>') && good.includes('href="https://joinnus.com/x"') && good.includes('<li>uno</li>'), good);
console.log('safeHtml ok:', good);
