# CSS Classes and Styling

## Available CSS Classes

The ngx-extended-pdf-viewer provides several CSS classes that you can use to customize the appearance and behavior of the PDF viewer.

| _CSS rule_                                 |                                                   _description_                                                    |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| ngx-extended-pdf-viewer-prevent-touch-move | This CSS rule is added to the document body when one of the editors is active L(i.e. text editor or ink draw editor). It's used to prevent scrolling when drawing. If your page has a scrollbar, add a `touch-action: none` rule to the scrolling HTML element. |
| --page-placeholder-background-color        | A CSS custom property (variable) you set on `ngx-extended-pdf-viewer`. It's the background shown behind a page until its canvas has finished rendering. It defaults to the theme color (`#d4d4d7` in the light theme, `#2a2a2e` in the dark theme), which can flash briefly when you scroll to an un-rendered page or switch the PDF source. Set it to remove the flash — for example `ngx-extended-pdf-viewer { --page-placeholder-background-color: transparent; }` lets the host surface show through instead. |
