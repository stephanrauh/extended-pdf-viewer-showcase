To add a custom button to a custom toolbar, you can use the `<pdf-shy-button>`:

`// open-in-new-tab.html`
```html
<pdf-shy-button
  [cssClass]="'lg' | responsiveCSSClass"
  class="newTab"
  title="open PDF file in a new tab"
  primaryToolbarId="openInNewTab"
  l10nId="infinite_scroll"
  [toggled]="hasBeenClicked"
  [action]="onClick"
  [order]="1"
  [closeOnClick]="true"
  image="<svg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 0 24 24' width='24'>
     <path fill='red' d='M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z'/>
    </svg>"
>
</pdf-shy-button>
```
