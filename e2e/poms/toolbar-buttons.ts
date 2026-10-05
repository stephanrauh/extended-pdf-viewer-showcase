/**
 * The viewer's toolbar buttons. Each one is rendered twice: once in the
 * toolbar and once as an entry of the secondary (Tools) menu, and CSS decides
 * which copy is visible. These are the two ids.
 */
export type ToolbarButton = { toolbar: string; menu: string };

export const BUTTONS = {
  first: { toolbar: 'primaryFirstPage', menu: 'secondaryFirstPage' },
  previous: { toolbar: 'primaryPrevious', menu: 'secondaryPreviousPage' },
  next: { toolbar: 'primaryNext', menu: 'primaryNextPage' },
  last: { toolbar: 'primaryLastPage', menu: 'secondaryLastPage' },
  zoomIn: { toolbar: 'primaryZoomIn', menu: 'secondaryZoomIn' },
  zoomOut: { toolbar: 'primaryZoomOut', menu: 'secondaryZoomOut' },
  rotateCw: { toolbar: 'primaryPageRotateCw', menu: 'secondaryPageRotateCw' },
  rotateCcw: { toolbar: 'primaryPageRotateCcw', menu: 'secondaryPageRotateCcw' },
  handTool: { toolbar: 'primaryCursorHandTool', menu: 'secondaryCursorHandTool' },
  selectTool: { toolbar: 'primaryCursorSelectTool', menu: 'secondaryCursorSelectTool' },
  sidebar: { toolbar: 'viewsManagerToggleButton', menu: 'secondaryViewsManagerToggleButton' },
  find: { toolbar: 'primaryViewFind', menu: 'secondaryViewFind' },
  properties: { toolbar: 'documentProperties', menu: 'secondaryDocumentProperties' },
  scrollPage: { toolbar: 'scrollPage', menu: 'secondaryScrollPage' },
  scrollVertical: { toolbar: 'scrollVertical', menu: 'secondaryScrollVertical' },
  scrollHorizontal: { toolbar: 'scrollHorizontal', menu: 'secondaryScrollHorizontal' },
  scrollWrapped: { toolbar: 'scrollWrapped', menu: 'secondaryScrollWrapped' },
  infiniteScroll: { toolbar: 'infiniteScroll', menu: 'secondaryInfiniteScroll' },
  bookMode: { toolbar: 'book-mode', menu: 'secondaryBook-mode' },
  spreadNone: { toolbar: 'spreadNone', menu: 'secondarySpreadNone' },
  spreadOdd: { toolbar: 'spreadOdd', menu: 'secondarySpreadOdd' },
  spreadEven: { toolbar: 'spreadEven', menu: 'secondarySpreadEven' },
  presentation: { toolbar: 'presentationMode', menu: 'secondaryPresentationMode' },
  openFile: { toolbar: 'openFile', menu: 'secondaryOpenFile' },
  print: { toolbar: 'printButton', menu: 'secondaryPrintButton' },
  download: { toolbar: 'downloadButton', menu: 'secondaryDownload' },
  highlight: { toolbar: 'primaryEditorHighlight', menu: 'secondaryEditorHighlight' },
  freeText: { toolbar: 'primaryEditorFreeText', menu: 'secondaryEditorFreeText' },
  ink: { toolbar: 'primaryEditorInk', menu: 'secondaryEditorInk' },
  stamp: { toolbar: 'primaryEditorStamp', menu: 'secondaryEditorStamp' },
  signature: { toolbar: 'primaryEditorSignatureButton', menu: 'secondaryEditorSignatureButton' },
  eraser: { toolbar: 'primaryEditorEraser', menu: 'secondaryEditorEraser' },
  undo: { toolbar: 'primaryEditorUndo', menu: 'secondaryEditorUndo' },
  redo: { toolbar: 'primaryEditorRedo', menu: 'secondaryEditorRedo' },
} satisfies Record<string, ToolbarButton>;
