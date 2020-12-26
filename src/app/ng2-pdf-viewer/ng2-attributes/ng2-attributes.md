# Attributes, events, and attributes with two-way-binding

## Legend:

- [(attribute)] describes an attribute with two-way-binding
- [attribute] means that PDF-viewer reacts when the attribute changes
- (attribute) means an event is raised when the user changes a setting
- attribute (without special characters) means the attribute is used at load time only. Subsequent changes are ignored.

| _Attribute_                  | _default value_ | _description_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :--------------------------- | :-------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [src]                      |                 | If `[src]` is a string: defines the URL of the PDF file to display. `src` may also be a `Uint8Array` or a`PDFSource`.                       |
| (after-load-complete) | | Fires when the PDF file has been loaded. At this point of time, it hasn't been rendered yet. |
| (page-rendered) | | Fires each time a page has been rendered. |
| (text-layer-rendered) | | Fires when the text layer has been rendered. |
| (error) | | This event fires if an error occurs when the PDF file is loaded. |
| (on-progress) | | This event fires several times when the PDF file is loaded. |
| [(page)] | | Two-way binding attribute defining the page number. This is the counting the pages in the document. If the author of the PDF file chose to use a different numbering system, the author's page numbers are ignored. |
| (c-maps-url) | | URL of the CMaps files for non-european languages. By default, the CMap files are loaded from `https://unpkg.com/pdfjs-dist`. If you're behind a firewall, you can use this attribute to host the CMap files locally. |
| [render-text] | | Activate or deactivate the text layer. If activate, users can mark and copy text (provided the PDF file supports this). |
| [render-text-mode] | | `[render-text-mode]="2"` activates the enhanced text mode. |
| [original-size] | | |
| [show-all] | | Toggles between single-page-mode (`showAll="false"`) and infinite-scroll mode (`showAll="true"`) |
| [stick-to-page] | | Makes sure the user can't scroll away from the current page. However, the attribute seems to be broken. |
| [zoom] | | Numerical scaling. 1 means 100%. |
| [zoom-scale] | | Legal values are `page-height`, `page-fit`, and `page-width`.|
| [external-link-target] | | Only activate if `[render-text]="true"`. Defines the HTML link target of links in the PDF file. Legal values are `"blank"`, `"none"`, `"self"`, `"parent"`, and `"top"`. |
| [autoresize] | | Resizes the PDF file when the windows grows or shrinks. Depends on the value of `zoom`, `zoom-scale`, `original-size`, and `fit-to-page`. |
| [fit-to-page] | | |
| [rotation] | | Rotates the pages of the PDF file. Legal values are 0, 90, 180, and 270. |
| [show-borders] | false | Shows a border around the PDF pages. |
