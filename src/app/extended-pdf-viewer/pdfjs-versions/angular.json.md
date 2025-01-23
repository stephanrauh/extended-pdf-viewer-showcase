```json
"architect": {
  "build": {
    ...
    "options":
      "assets": [
        "src/favicon.ico",
        "src/assets",
        {   // required for the stable branch
          "glob": "**/*",
          "input": "node_modules/ngx-extended-pdf-viewer/assets",
          "output": "/assets/"
        },
        {   // required for the bleeding edge branch
          "glob": "**/*",
          "input": "node_modules/ngx-extended-pdf-viewer/bleeding-edge",
          "output": "/bleeding-edge/"
        },
```
