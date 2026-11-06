/** Opt-in diagnostics for an iPad which has no connection to a developer console. */
export function installPinchDiagnostics(root: HTMLElement, getApplication: () => unknown): () => void {
  if (typeof window === 'undefined' || new URLSearchParams(location.search).get('pinchDebug') !== '1') return () => {};

  type RenderEvent = { pageNumber?: number; previous?: number; cssTransform?: boolean; isDetailView?: boolean };
  type EventBus = { on(name: string, fn: (event: RenderEvent) => void): void; off(name: string, fn: (event: RenderEvent) => void): void };
  type InputScroll = { ms: number; kind: string; zoom?: number; top: number; left: number };
  type PageScroll = { phase: string; top: number; left: number; topAfterGeometry: number; pageTop?: number; pageHeight?: number; pageScale?: number; viewportScale?: number; lastInput?: InputScroll; stack?: string };
  type Entry = { ms: number; kind: string; active: boolean; sinceScale: number | null; page?: string | number; previousPage?: number; canvas?: number; width?: number; height?: number; zoom?: number; css?: boolean; detail?: boolean; scroll?: PageScroll };
  type ProbeViewer = { setTouchPinching?: unknown; singleScrollDuringPinch?: boolean; touchPinchScrollLock?: boolean; pageViewMode?: string; scrollMode?: number; currentScale?: number; container?: HTMLElement;
    _pages?: { div: HTMLElement; scale: number; viewport?: { scale: number } }[];
    updateScale?: (...args: unknown[]) => unknown; panBy?: (...args: unknown[]) => unknown };
  const panel = document.createElement('section');
  panel.id = 'pinch-diagnostics';
  panel.setAttribute('aria-label', 'Pinch diagnostic');
  Object.assign(panel.style, { position: 'fixed', top: '8px', right: '8px', zIndex: '100000', width: 'min(360px, calc(100vw - 16px))', padding: '10px', background: '#fff', color: '#111', border: '1px solid #555', borderRadius: '6px', boxShadow: '0 2px 8px #0005', font: '14px system-ui', boxSizing: 'border-box' });
  const title = document.createElement('strong');
  title.textContent = 'Pinch diagnostic';
  const status = document.createElement('p');
  status.textContent = 'Tap Record, then pinch normally. Stops after 20 seconds.';
  status.style.margin = '6px 0';
  status.setAttribute('role', 'status');
  const buttons = document.createElement('div');
  Object.assign(buttons.style, { display: 'flex', flexWrap: 'wrap', gap: '6px' });
  const button = (label: string) => {
    const el = document.createElement('button');
    el.type = 'button'; el.textContent = label;
    Object.assign(el.style, { padding: '8px', minHeight: '40px', color: '#111', background: '#eee', border: '1px solid #888', borderRadius: '4px' });
    buttons.append(el);
    return el;
  };
  const record = button('Record'), stop = button('Stop'), copy = button('Copy summary'), download = button('Download trace');
  const singleScroll = button('Single scroll: off');
  const viewer3d = button('3D CSS: default');
  const pinchScrollLock = button('Pinch scroll lock: default');
  stop.disabled = copy.disabled = download.disabled = true;
  const output = document.createElement('textarea');
  output.readOnly = true; output.rows = 7; output.hidden = true;
  output.setAttribute('aria-label', 'Diagnostic summary');
  Object.assign(output.style, { width: '100%', marginTop: '8px', fontSize: '16px', boxSizing: 'border-box' });
  panel.append(title, status, buttons, output);
  document.body.append(panel);

  const controls = new AbortController();
  const experimentViewers = new Map<{ singleScrollDuringPinch?: boolean }, boolean>();
  const scrollLockViewers = new Map<ProbeViewer, boolean>();
  const original3dStyles = new Map<HTMLElement, { property: string; value: string; priority: string }[]>();
  let viewer3dCssDisabled = false;
  let stopRecording = () => {};
  let trace: unknown;
  let recording = false;
  record.addEventListener('click', () => {
    const host = root.querySelector('ngx-extended-pdf-viewer');
    const viewer = host?.querySelector<HTMLElement>('.pdfViewer');
    const application = getApplication() as { eventBus?: EventBus; pdfViewer?: ProbeViewer } | undefined;
    const bus = application?.eventBus;
    if (!host || !viewer || !bus) { status.textContent = 'The PDF is still loading. Try Record again shortly.'; return; }
    // Layout is sampled before recording and on page changes, never per frame.
    const computed = getComputedStyle(viewer);
    const pdfViewer = application?.pdfViewer;
    const layoutAtStart = { pageViewMode: pdfViewer?.pageViewMode, scrollMode: pdfViewer?.scrollMode,
      mountedPages: viewer.querySelectorAll('.page').length, scrollHeight: pdfViewer?.container?.scrollHeight,
      transform: computed.transform, backfaceVisibility: computed.backfaceVisibility };
    const entries: Entry[] = [], touches: { ms: number; active: boolean }[] = [];
    const cachedPagesAtStart = [...host.querySelectorAll('canvas')].map((node) => node.closest<HTMLElement>('.page')?.dataset['pageNumber']).filter(Boolean);
    const start = performance.now(), listeners = new AbortController(), ids = new WeakMap<HTMLCanvasElement, number>();
    let active = false, lastScale: number | undefined, previousScale = viewer.style.getPropertyValue('--scale-factor'), nextId = 0;
    let inputDepth = 0, lastInput: InputScroll | undefined;
    const inputScrolls: InputScroll[] = [], restoreInputs: (() => void)[] = [];
    const outsideScrollWrites: { ms: number; operation: string; value: unknown; stack?: string }[] = [];
    const container = pdfViewer?.container;
    if (container) {
      const noteWrite = (operation: string, value: unknown) => {
        if (inputDepth) return;
        outsideScrollWrites.push({ ms: performance.now() - start, operation, value, stack: new Error('scroll write').stack?.slice(0, 1600) });
      };
      for (const property of ['scrollTop', 'scrollLeft'] as const) {
        let proto: object | null = container;
        while (proto && !Object.getOwnPropertyDescriptor(proto, property)) proto = Object.getPrototypeOf(proto);
        const descriptor = proto && Object.getOwnPropertyDescriptor(proto, property);
        if (!descriptor?.get || !descriptor.set) continue;
        const own = Object.getOwnPropertyDescriptor(container, property);
        const setter = function (this: HTMLElement, value: number) { noteWrite(property, value); descriptor.set!.call(this, value); };
        Object.defineProperty(container, property, { configurable: true, get: descriptor.get, set: setter });
        restoreInputs.push(() => {
          if (Object.getOwnPropertyDescriptor(container, property)?.set !== setter) return;
          if (own) Object.defineProperty(container, property, own);
          else delete (container as unknown as Record<string, unknown>)[property];
        });
      }
      for (const property of ['scrollTo', 'scrollBy'] as const) {
        const original = container[property], own = Object.getOwnPropertyDescriptor(container, property);
        const wrapper = function (this: HTMLElement, ...args: unknown[]) {
          noteWrite(property, args);
          return (original as (...args: unknown[]) => void).apply(this, args);
        };
        container[property] = wrapper;
        restoreInputs.push(() => {
          if (container[property] !== wrapper) return;
          if (own) Object.defineProperty(container, property, own);
          else delete (container as unknown as Record<string, unknown>)[property];
        });
      }
    }
    // Capture the position the engine actually left at the end of each input.
    // This adds no animation-frame loop and changes no scroll coordinates.
    for (const name of ['updateScale', 'panBy'] as const) {
      const original = pdfViewer?.[name];
      if (!pdfViewer || !original) continue;
      const own = Object.getOwnPropertyDescriptor(pdfViewer, name);
      const wrapped = function (this: ProbeViewer, ...args: unknown[]) {
        inputDepth++;
        let succeeded = false;
        try { const value = original.apply(this, args); succeeded = true; return value; }
        finally {
          inputDepth--;
          if (succeeded && inputDepth === 0 && this.container) {
            lastInput = { ms: performance.now() - start, kind: name, zoom: this.currentScale === undefined ? undefined : this.currentScale * 100,
              top: this.container.scrollTop, left: this.container.scrollLeft };
            inputScrolls.push(lastInput);
          }
        }
      };
      pdfViewer[name] = wrapped;
      restoreInputs.push(() => {
        if (pdfViewer[name] !== wrapped) return;
        if (own) Object.defineProperty(pdfViewer, name, own);
        else delete pdfViewer[name];
      });
    }
    const log = (kind: string, extra: Partial<Entry> = {}) => {
      const ms = performance.now() - start;
      entries.push({ ms, kind, active, sinceScale: lastScale === undefined ? null : ms - lastScale, ...extra });
    };
    const canvas = (kind: string, node: HTMLCanvasElement, page?: string) => {
      if (!ids.has(node)) ids.set(node, ++nextId);
      log(kind, { canvas: ids.get(node), page: node.closest<HTMLElement>('.page')?.dataset['pageNumber'] ?? page, width: node.width, height: node.height, detail: node.classList.contains('detailView') });
    };
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
      window.addEventListener(type, (event) => {
        const e = event as TouchEvent;
        if (!active && !host.contains(e.target as Node)) return;
        const next = type !== 'touchcancel' && e.touches.length >= 2;
        if (next !== active) touches.push({ ms: performance.now() - start, active: next });
        active = next;
      }, { capture: true, passive: true, signal: listeners.signal });
    }
    const scaleObserver = new MutationObserver(() => {
      const value = viewer.style.getPropertyValue('--scale-factor');
      if (value === previousScale) return;
      previousScale = value; lastScale = performance.now() - start;
      log('scale', { zoom: Number.parseFloat(value) * 75 });
    });
    scaleObserver.observe(viewer, { attributes: true, attributeFilter: ['style'] });
    const canvasObserver = new MutationObserver((records) => {
      for (const r of records) {
        const page = (r.target as Element).closest?.<HTMLElement>('.page')?.dataset['pageNumber'];
        if (r.type === 'attributes') {
          if (r.target instanceof HTMLCanvasElement) canvas(r.attributeName!, r.target, page);
          continue;
        }
        for (const [kind, nodes] of [['added', r.addedNodes], ['removed', r.removedNodes]] as const) {
          for (const node of Array.from(nodes)) {
            if (!(node instanceof Element)) continue;
            if (node instanceof HTMLCanvasElement) canvas(kind, node, page);
            for (const child of node.querySelectorAll('canvas')) canvas(kind, child, page);
          }
        }
      }
    });
    canvasObserver.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['width', 'height'] });
    const renderStart = (e: RenderEvent) => log('render-start', { page: e.pageNumber });
    const renderEnd = (e: RenderEvent) => log('render-end', { page: e.pageNumber, css: e.cssTransform, detail: e.isDetailView });
    const pageChange = (e: RenderEvent) => {
      const container = pdfViewer?.container;
      let scroll: PageScroll | undefined;
      if (container) {
        const top = container.scrollTop, left = container.scrollLeft;
        const page = e.pageNumber ? pdfViewer?._pages?.[e.pageNumber - 1] : undefined;
        // Read offsets after the initial scroll sample, then sample scrollTop
        // again to detect a layout flush changing the observed scroll position.
        const pageTop = page?.div.offsetTop, pageHeight = page?.div.clientHeight;
        scroll = { phase: inputDepth ? 'during-input' : 'after-input', top, left, pageTop, pageHeight,
          topAfterGeometry: container.scrollTop, pageScale: page?.scale, viewportScale: page?.viewport ? page.viewport.scale * .75 : undefined,
          lastInput, stack: new Error('page change').stack?.slice(0, 1600) };
      }
      log('page-change', { page: e.pageNumber, previousPage: e.previous, scroll });
    };
    bus.on('pagerender', renderStart); bus.on('pagerendered', renderEnd); bus.on('pagechanging', pageChange);
    recording = true; record.disabled = singleScroll.disabled = viewer3d.disabled = pinchScrollLock.disabled = true; stop.disabled = false; copy.disabled = download.disabled = true; output.hidden = true;
    status.textContent = 'Recording. Pinch normally; tap Stop after a flash, or wait 20 seconds.';
    const timer = setTimeout(() => stopRecording(), 20000);
    stopRecording = () => {
      if (!recording) return;
      recording = false; clearTimeout(timer); listeners.abort(); scaleObserver.disconnect(); canvasObserver.disconnect();
      for (const restore of restoreInputs.reverse()) restore();
      bus.off('pagerender', renderStart); bus.off('pagerendered', renderEnd); bus.off('pagechanging', pageChange);
      const recent = entries.filter((e) => e.active && e.sinceScale !== null && e.sinceScale < 150);
      const count = (items: Entry[]) => items.reduce<Record<string, number>>((out, e) => { out[e.kind] = (out[e.kind] ?? 0) + 1; return out; }, {});
      const bundle = performance.getEntriesByType('resource').map((e) => e.name).find((name) => /\/(?:bleeding-edge|assets)\/viewer-[^/]+\.mjs/.test(name));
      const summary = { bundle: bundle ? new URL(bundle).pathname : undefined, dpr: devicePixelRatio,
        touchGestureRenderDelay: typeof application?.pdfViewer?.setTouchPinching === 'function',
        singleScrollExperiment: application?.pdfViewer?.singleScrollDuringPinch ?? null,
        viewer3dCssDisabled, pinchScrollLockEnabled: pdfViewer?.touchPinchScrollLock ?? null, layoutAtStart, scrollProbeVersion: 2,
        durationMs: Math.round(performance.now() - start), gestures: touches.filter((e) => e.active).length,
        operations: count(entries), whileTouching: count(entries.filter((e) => e.active)), whileTouchingNearScale: count(recent),
        examples: recent.filter((e) => e.kind !== 'scale' && e.kind !== 'page-change').slice(0, 6) };
      trace = { recordedAt: new Date().toISOString(), userAgent: navigator.userAgent, dpr: devicePixelRatio, bundle, cachedPagesAtStart, summary, touches, entries, inputScrolls, outsideScrollWrites };
      output.value = JSON.stringify(summary, null, 2); output.hidden = false;
      record.disabled = singleScroll.disabled = viewer3d.disabled = pinchScrollLock.disabled = false; stop.disabled = true; copy.disabled = download.disabled = false;
      status.textContent = 'Finished. Copy the summary, or download the detailed trace.';
    };
  }, { signal: controls.signal });
  stop.addEventListener('click', () => stopRecording(), { signal: controls.signal });
  pinchScrollLock.addEventListener('click', () => {
    const viewer = (getApplication() as { pdfViewer?: ProbeViewer } | undefined)?.pdfViewer;
    if (typeof viewer?.touchPinchScrollLock !== 'boolean') {
      status.textContent = 'The built-in pinch scroll lock requires the newer viewer bundle.';
      return;
    }
    if (!scrollLockViewers.has(viewer)) scrollLockViewers.set(viewer, viewer.touchPinchScrollLock);
    viewer.touchPinchScrollLock = !viewer.touchPinchScrollLock;
    pinchScrollLock.textContent = `Pinch scroll lock: ${viewer.touchPinchScrollLock ? 'on' : 'off'}`;
    status.textContent = 'Compare a pinch with this setting. Keep Single scroll off and 3D CSS default.';
  }, { signal: controls.signal });
  singleScroll.addEventListener('click', () => {
    const viewer = (getApplication() as { pdfViewer?: { singleScrollDuringPinch?: boolean } } | undefined)?.pdfViewer;
    if (typeof viewer?.singleScrollDuringPinch !== 'boolean') {
      status.textContent = 'The single-scroll experiment requires the newer viewer bundle.';
      return;
    }
    if (!experimentViewers.has(viewer)) experimentViewers.set(viewer, viewer.singleScrollDuringPinch);
    viewer.singleScrollDuringPinch = !viewer.singleScrollDuringPinch;
    singleScroll.textContent = `Single scroll: ${viewer.singleScrollDuringPinch ? 'on' : 'off'}`;
    status.textContent = 'Record a new pinch to compare this setting.';
  }, { signal: controls.signal });
  viewer3d.addEventListener('click', () => {
    const viewer = root.querySelector<HTMLElement>('ngx-extended-pdf-viewer .pdfViewer');
    if (!viewer) { status.textContent = 'The PDF is still loading. Try again shortly.'; return; }
    if (!viewer3dCssDisabled) {
      original3dStyles.set(viewer, ['transform', '-webkit-backface-visibility', 'backface-visibility'].map(property => ({
        property, value: viewer.style.getPropertyValue(property), priority: viewer.style.getPropertyPriority(property),
      })));
      viewer.style.setProperty('transform', 'none', 'important');
      viewer.style.setProperty('-webkit-backface-visibility', 'visible', 'important');
      viewer.style.setProperty('backface-visibility', 'visible', 'important');
    } else {
      restore3dStyles();
    }
    viewer3dCssDisabled = !viewer3dCssDisabled;
    viewer3d.textContent = viewer3dCssDisabled ? '3D CSS: off' : '3D CSS: default';
    status.textContent = 'Record a new pinch to compare this setting. Keep Single scroll off.';
  }, { signal: controls.signal });
  function restore3dStyles() {
    for (const [viewer, styles] of original3dStyles) {
      for (const { property, value, priority } of styles) {
        if (value) viewer.style.setProperty(property, value, priority);
        else viewer.style.removeProperty(property);
      }
    }
    original3dStyles.clear();
  }
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(output.value); status.textContent = 'Summary copied.'; }
    catch { output.focus(); output.select(); status.textContent = 'Select and copy the summary below.'; }
  }, { signal: controls.signal });
  download.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'pinch-diagnostic.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, { signal: controls.signal });
  return () => {
    stopRecording(); controls.abort(); panel.remove();
    restore3dStyles();
    for (const [viewer, original] of experimentViewers) viewer.singleScrollDuringPinch = original;
    experimentViewers.clear();
    for (const [viewer, original] of scrollLockViewers) viewer.touchPinchScrollLock = original;
    scrollLockViewers.clear();
  };
}
