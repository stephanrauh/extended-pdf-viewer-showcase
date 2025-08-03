| Method                            | Category            | Description                                                                                  |
| --------------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| find()                            | Search/Find Methods | Search for text in the PDF with various options (case sensitivity, whole words, regex, etc.) |
| findNext()                        | Search/Find Methods | Navigate to the next search result                                                           |
| findPrevious()                    | Search/Find Methods | Navigate to the previous search result                                                       |
| print()                           | Print Methods       | Print the PDF with optional page range specification                                         |
| setPrintRange()                   | Print Methods       | Set which pages should be included in print                                                  |
| removePrintRange()                | Print Methods       | Remove print range restrictions                                                              |
| isInPDFPrintRange()               | Print Methods       | Check if a page is within the print range                                                    |
| filteredPageCount()               | Print Methods       | Get count of pages that will be printed                                                      |
| getPageAsLines()                  | Text Extraction     | Extract text from a page organized by lines with position data                               |
| getPageAsText()                   | Text Extraction     | Extract plain text content from a page                                                       |
| getPageAsCanvas()                 | Image/Canvas Export | Export a page as HTML canvas element                                                         |
| getPageAsImage()                  | Image/Canvas Export | Export a page as data URL image                                                              |
| getCurrentDocumentAsBlob()        | Document Operations | Get the current PDF document as a blob                                                       |
| getFormData()                     | Document Operations | Extract form field data from the PDF                                                         |
| addPageToRenderQueue()            | Page Rendering      | Add a specific page to the rendering queue                                                   |
| isRenderQueueEmpty()              | Page Rendering      | Check if the rendering queue is empty                                                        |
| hasPageBeenRendered()             | Page Rendering      | Check if a page has been rendered                                                            |
| renderPage()                      | Page Rendering      | Ensure a page is rendered (waits if necessary)                                               |
| currentlyRenderedPages()          | Page Rendering      | Get list of currently rendered page numbers                                                  |
| numberOfPages()                   | Page Rendering      | Get total number of pages in the document                                                    |
| getCurrentlyVisiblePageNumbers()  | Page Rendering      | Get page numbers currently visible in viewport                                               |
| listLayers()                      | Layer Management    | Get list of PDF layers (optional content)                                                    |
| toggleLayer()                     | Layer Management    | Show/hide a specific PDF layer                                                               |
| scrollPageIntoView()              | Navigation          | Scroll to a specific page and position                                                       |
| getCurrentPage()                  | Navigation          | Get current page number (1-based)                                                            |
| getPageCount()                    | Navigation          | Get total page count                                                                         |
| currentPageIndex()                | Navigation          | Get current page index (0-based)                                                             |
| movePage()                        | Navigation          | Move a page to a different position (requires pdfDefaultOpions.enablePageReordering = true)                          |
| getSerializedAnnotations()        | Annotations         | Get all editor and form annotations in serialized format                                              |
| addEditorAnnotation()             | Annotations         | Add a new editor annotation                                                                  |
| removeEditorAnnotations()         | Annotations         | Remove editor annotations (optionally filtered)                                              |
| addImageToAnnotationLayer()       | Annotations         | Add an image as a stamp annotation                                                           |
| addHighlightToAnnotationLayer()   | Annotations         | Add a highlight annotation                                                                   |
| switchAnnotationEdtorMode()       | Annotations         | Switch annotation editor mode                                                                |
| editorFontSize (property)         | Annotation Editor   | Set font size for text annotations                                                           |
| editorFontColor (property)        | Annotation Editor   | Set font color for text annotations                                                          |
| editorInkColor (property)         | Annotation Editor   | Set ink color for drawing annotations                                                        |
| editorInkOpacity (property)       | Annotation Editor   | Set ink opacity for drawing annotations                                                      |
| editorInkThickness (property)     | Annotation Editor   | Set ink thickness for drawing annotations                                                    |
| editorHighlightColor (property)   | Annotation Editor   | Set highlight color                                                                          |
| editorHighlightDefaultColor (property) | Annotation Editor   | Set default highlight color                                                                  |
| editorHighlightShowAll (property) | Annotation Editor   | Show/hide all highlights                                                                     |
| editorHighlightThickness (property) | Annotation Editor   | Set highlight thickness                                                                      |
| setEditorProperty()               | Annotation Editor   | Set any editor property by type                                                              |
| ngxExtendedPdfViewerInitialized (property) | Properties          | Whether the PDF viewer has been initialized                                                  |
| secondaryMenuIsEmpty (property)   | Properties          | Whether the secondary menu is empty                                                          |
