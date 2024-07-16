1. Open a terminal and navigate to the root folder of your project.
2. Run this command and accept the defaults:
```
ng add ngx-extended-pdf-viewer@latest
``` 
3. If you need a specific version of ngx-extended-pdf-viewer, replace `@latest` by the version number you need. `@latest` gets you the newest stable version. If you omit `@latest`, Angular tries to detect the latest compatible version. Note that this may be an alpha version. Usually these alpha version are useful, too, but they ship without promises. By definition, an alpha version is a version that might be broken.
4. Add the new component `<app-example-pdf-viewer>` to your `<app-component>` to display the PDF file.

After that, you'll probably want to delete the example PDF file and move the code out of the example component.
