# Browsers and mobile devices

## Which browsers are supported?

The library ships two builds of pdf.js and picks one when it initializes:

- The **modern build** needs a current browser: Chrome or Edge 122, Firefox 131, or Safari/iOS 18.4.
- The **legacy build** is slower and larger, but it reaches back to roughly Chrome and Edge 80, Firefox 78, and Safari 13.1 (iOS 13.4). Older browsers are out of scope.

Internet Explorer is not supported. Version 7.3.2 was the last one to run on IE11. The details are on the <a href="/extended-pdf-viewer/browser-support">browser support page</a>.

## The viewer fails on an older browser

The library detects which build the browser needs. If that detection fails, you can force the legacy build with `[forceUsingLegacyES5]="true"`. Use it only as a last resort.

## Mobile devices

- Mobile browsers have less memory. That's why the viewer limits the canvas size to 5 megapixels on mobile devices (see "Pages with huge images" in the tab "Display and layout").
- If the buttons are too small to tap, use `[mobileFriendlyZoom]`, e.g. `[mobileFriendlyZoom]="'150%'"`. See <a href="/extended-pdf-viewer/mobile">mobile devices</a>.
- On iOS, the select tool is the default cursor tool; on other devices, it's the hand tool.
