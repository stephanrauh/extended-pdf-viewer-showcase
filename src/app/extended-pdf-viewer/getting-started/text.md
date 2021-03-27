

## Prequisites and announcement

If you're familiar with Angular, you can get the PDF viewer up and running in roughly five minutes. You need node.js, npm and a current version of Angular. This library works out-of-the-box with any version since Angular 6. However, I only test it with Angular 7 and with the most current version.

When Angular 12 is released, I'm going to drop support for Angular 8 and below. The minimum required version is going to be Angular 9. The idea is to support the four most current versions of Angular, which gives you roughly two years to update.

Install the library with `npm install`:

```batch
npm i ngx-extended-pdf-viewer --save
```

After that, it depends on how you created your library. I'll describe two approaches: the standard Angular CLI and JHipster.
