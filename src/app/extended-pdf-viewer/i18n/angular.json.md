```json
...
"assets": [
  "src/server.js",
  "src/.htaccess",
  "src/favicon.ico",
  "src/assets",
  {
    "glob": "**/*",
    "input": "node_modules/ngx-extended-pdf-viewer/assets",
    "output": "/assets/"
  },
  // new rule follows here:
  {
    "glob": "**/*",
    "input": "src/assets/i18n",
    "output": "/assets/locale/"
  },
...
```
