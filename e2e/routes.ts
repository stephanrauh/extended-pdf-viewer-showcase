export interface RouteSpec {
  /** URL path under baseURL, e.g. '/extended-pdf-viewer/simple'. */
  path: string;
  /** Human-readable label for test reports. */
  label: string;
  /** True when the route renders an ngx-extended-pdf-viewer instance. */
  hasViewer: boolean;
  /**
   * Excluded from T1 smoke and T2 render. Set to a reason string when skipping.
   * Common reasons: external auth (keycloak), iframe child route, modal-only,
   * route depends on file upload, route demonstrates an error condition.
   */
  skip?: string;
  /**
   * Excluded from T2 render only. Use for viewer routes that DO mount the
   * viewer (so T1 passes) but don't auto-render a PDF — interactive demos
   * that need a button click, password prompts, lazy-tab content, etc.
   */
  skipRender?: string;
}

const E = '/extended-pdf-viewer';

export const ROUTES: RouteSpec[] = [
  { path: `${E}/simple`, label: 'simple', hasViewer: true },
  { path: `${E}/getting-started`, label: 'getting-started', hasViewer: false },

  { path: `${E}/adding-arbitrary-annotations`, label: 'adding-arbitrary-annotations', hasViewer: true },
  { path: `${E}/alternatives`, label: 'alternatives', hasViewer: false },
  { path: `${E}/annotation-layer`, label: 'annotation-layer', hasViewer: true },
  { path: `${E}/annotation-layer-api`, label: 'annotation-layer-api', hasViewer: true },
  { path: `${E}/attributes`, label: 'attributes', hasViewer: false },
  { path: `${E}/base64`, label: 'base64', hasViewer: true },
  { path: `${E}/blob`, label: 'blob', hasViewer: true, skip: 'requires preloadGuard / file upload' },
  { path: `${E}/book-mode`, label: 'book-mode', hasViewer: true },
  { path: `${E}/browser-support`, label: 'browser-support', hasViewer: false },
  { path: `${E}/changelog`, label: 'changelog', hasViewer: false },
  { path: `${E}/contextmenu`, label: 'contextmenu', hasViewer: true },

  { path: `${E}/csp/activating-csp`, label: 'csp / activating', hasViewer: true },
  { path: `${E}/csp/inline-scripts`, label: 'csp / inline-scripts', hasViewer: true },
  { path: `${E}/csp/webassembly`, label: 'csp / webassembly', hasViewer: true },

  { path: `${E}/css`, label: 'css', hasViewer: false },
  { path: `${E}/options`, label: 'options', hasViewer: true },
  { path: `${E}/customization`, label: 'customization', hasViewer: false },
  { path: `${E}/custom-print-dialog`, label: 'custom-print-dialog', hasViewer: true },
  { path: `${E}/custom-toolbar`, label: 'custom-toolbar', hasViewer: true },
  { path: `${E}/custom-sidebar`, label: 'custom-sidebar', hasViewer: true },
  { path: `${E}/custom-thumbnails`, label: 'custom-thumbnails', hasViewer: true },
  { path: `${E}/custom-pdf-viewer`, label: 'custom-pdf-viewer', hasViewer: true },
  { path: `${E}/custom-find`, label: 'custom-find', hasViewer: true, skipRender: 'viewer below accordion; does not auto-render' },
  { path: `${E}/disable-buttons`, label: 'disable-buttons', hasViewer: true },
  { path: `${E}/display-options`, label: 'display-options', hasViewer: true },

  { path: `${E}/export-file`, label: 'export-file', hasViewer: true },
  { path: `${E}/export-image`, label: 'export-image', hasViewer: true },
  { path: `${E}/export-text`, label: 'export-text', hasViewer: true },
  { path: `${E}/export-annotations`, label: 'export-annotations', hasViewer: true },

  { path: `${E}/editor-setting`, label: 'editor-setting', hasViewer: true },
  { path: `${E}/editor-events`, label: 'editor-events', hasViewer: true },

  { path: `${E}/ngx-pdf-viewer-service`, label: 'ngx-pdf-viewer-service', hasViewer: false },

  { path: `${E}/file-info`, label: 'file-info', hasViewer: true },
  { path: `${E}/filtering-console-log`, label: 'filtering-console-log', hasViewer: true },
  { path: `${E}/forms`, label: 'forms', hasViewer: true },
  { path: `${E}/find`, label: 'find', hasViewer: true, skipRender: 'viewer below accordion; does not auto-render' },
  { path: `${E}/layers`, label: 'layers', hasViewer: true },

  { path: `${E}/i18n`, label: 'i18n', hasViewer: true },
  { path: `${E}/iframe/1`, label: 'iframe', hasViewer: true, skip: 'rendered inside <iframe>; covered indirectly' },
  { path: `${E}/infinite-scroll`, label: 'infinite-scroll', hasViewer: true },
  { path: `${E}/intro`, label: 'intro', hasViewer: false },

  { path: `${E}/hidden-tabs`, label: 'hidden-tabs', hasViewer: true, skipRender: 'demo intentionally keeps viewer in a hidden tab' },
  { path: `${E}/hiding-buttons`, label: 'hiding-buttons', hasViewer: true },
  { path: `${E}/responsive-design`, label: 'responsive-design', hasViewer: true },

  { path: `${E}/links`, label: 'links', hasViewer: true },
  { path: `${E}/loading-indicator`, label: 'loading-indicator', hasViewer: true },

  { path: `${E}/keyboard`, label: 'keyboard', hasViewer: true },
  { path: `${E}/keycloak`, label: 'keycloak', hasViewer: true, skip: 'requires external auth server' },

  { path: `${E}/mobile`, label: 'mobile', hasViewer: true },
  { path: `${E}/modal`, label: 'modal', hasViewer: false },
  { path: `${E}/modify-page-order`, label: 'modify-page-order', hasViewer: true },
  { path: `${E}/multiple-documents`, label: 'multiple-documents', hasViewer: true, skipRender: 'demo waits for user file selection / drag-and-drop' },
  { path: `${E}/navigation`, label: 'navigation', hasViewer: true },

  { path: `${E}/events`, label: 'events', hasViewer: true },
  { path: `${E}/pages-loaded`, label: 'pages-loaded', hasViewer: true },

  { path: `${E}/passwords`, label: 'passwords', hasViewer: true, skipRender: 'blocks at password prompt by design' },
  { path: `${E}/pdfjs-versions`, label: 'pdfjs-versions', hasViewer: false },
  { path: `${E}/page-view-mode`, label: 'page-view-mode', hasViewer: true },
  { path: `${E}/print-range`, label: 'print-range', hasViewer: true },
  { path: `${E}/perfect-scrollbar`, label: 'perfect-scrollbar', hasViewer: true },
  { path: `${E}/presentations`, label: 'presentations', hasViewer: true },
  { path: `${E}/prerendering`, label: 'prerendering', hasViewer: true },

  { path: `${E}/range-requests`, label: 'range-requests', hasViewer: false },
  { path: `${E}/scripting`, label: 'scripting', hasViewer: true },
  { path: `${E}/scrolling`, label: 'scrolling', hasViewer: true },
  { path: `${E}/security`, label: 'security', hasViewer: false },
  { path: `${E}/server-side-rendering`, label: 'server-side-rendering', hasViewer: true },
  { path: `${E}/side-by-side`, label: 'side-by-side', hasViewer: false },
  { path: `${E}/signatures`, label: 'signatures', hasViewer: true },

  { path: `${E}/textlayer`, label: 'textlayer', hasViewer: true },
  { path: `${E}/theming`, label: 'theming', hasViewer: true },
  { path: `${E}/touch-gestures`, label: 'touch-gestures', hasViewer: true },
  { path: `${E}/troubleshooting`, label: 'troubleshooting', hasViewer: false },
  { path: `${E}/two-way-binding`, label: 'two-way-binding', hasViewer: true },
  { path: `${E}/zoom`, label: 'zoom', hasViewer: true },
];

export const T1_ROUTES = ROUTES.filter((r) => !r.skip);
export const T2_ROUTES = ROUTES.filter(
  (r) => r.hasViewer && !r.skip && !r.skipRender,
);
