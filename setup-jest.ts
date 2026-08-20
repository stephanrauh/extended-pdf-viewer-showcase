import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// jsdom implements neither matchMedia nor the ResizeObserver/IntersectionObserver
// APIs. ThemeService reads the prefers-color-scheme media query in its
// constructor, so without this every component that injects it fails to build.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined, // deprecated, still called by some libs
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
});
