```ts
// src/main.ts — register a default Trusted Types policy so libraries
// that assign innerHTML without shipping their own policy (ngx-markdown,
// marked, Prism) keep working under `require-trusted-types-for 'script'`.
//
// Recommended: route createHTML through DOMPurify so the policy actually
// sanitises HTML coming from third-party libraries (`npm install dompurify`).
import DOMPurify from 'dompurify';

if (typeof window !== 'undefined' && (window as any).trustedTypes?.createPolicy) {
  try {
    (window as any).trustedTypes.createPolicy('default', {
      createHTML:      (s: string) => DOMPurify.sanitize(s),
      // Block stringly-loaded scripts entirely — no safe identity here.
      createScriptURL: () => { throw new Error('untrusted script URL'); },
      createScript:    () => { throw new Error('untrusted script source'); },
    });
  } catch {
    // policy already registered (HMR / second bootstrap) — ignore
  }
}

// ─── Minimum pass-through (what this showcase ships) ───────────────────
// Skips the DOMPurify dependency. Only use this if you can prove that
// every HTML string passing through innerHTML in your app — including
// from every third-party library — comes from content you control.
//
// (window as any).trustedTypes.createPolicy('default', {
//   createHTML:      (s: string) => s,
//   createScriptURL: (s: string) => s,
//   createScript:    (s: string) => s,
// });
```
