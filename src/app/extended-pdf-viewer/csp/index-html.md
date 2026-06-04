```html
<!-- src/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  require-trusted-types-for 'script';
  trusted-types default pdf-viewer dompurify
                angular angular#unsafe-bypass angular#bundler;
  default-src 'self';
  script-src  'self';
  worker-src  'self' blob:;
  connect-src 'self' blob: data: ws: wss:;
  style-src   'self' 'unsafe-inline';
  img-src     'self' data: blob:;
  font-src    'self' data:;
  frame-src   'self';
  object-src  'none';
  base-uri    'self';
  form-action 'self'">
```
