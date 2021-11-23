import { Component } from '@angular/core';
import { TreeNode } from './tree-node';

const TOOLBAR: TreeNode[] = [
  {
    name: '<pdf-toolbar>',
    content: 'customToolbar',
    children: [
      {
        name: ' <div id="toolbarViewer">',
        children: [
          {
            name: '<div id="toolbarViewerLeft">',
            children: [
              { name: '<pdf-toggle-sidebar>', id: 'sidebarToggle' },
              { name: '<pdf-find-button>', id: 'viewFind' },
              {
                name: '<pdf-paging-area>',
                children: [
                  { name: '<pdf-previous-page>', id: 'previous' },
                  { name: '<pdf-next-page>', id: 'next' },
                  { name: '<pdf-page-number>', id: 'pageNumber' }
                ]
              }
            ]
          },
          {
            name: '<div id="toolbarViewerRight">',
            children: [
              { name: '<pdf-presentation-mode>', id: 'presentationMode' },
              { name: '<pdf-open-file>', id: 'openFile' },
              { name: '<pdf-print>', id: 'print' },
              { name: '<pdf-download>', id: 'download' },
              { name: '<pdf-bookmark>', id: 'viewBookmark' },
              {
                name: '<pdf-toggle-secondary-toolbar>',
                id: 'secondaryToolbarToggle'
              }
            ]
          },
          {
            name: '<pdf-zoom-toolbar>',
            children: [
              { name: '<pdf-zoom-out>', id: 'zoomOut' },
              { name: '<pdf-zoom-in>', id: 'zoomIn' },
              { name: '<pdf-zoom-dropdown>', id: 'scaleSelect' }
            ]
          }
        ]
      }
    ]
  }];

  const SECONDARY_TOOLBAR: TreeNode[] = [

  {
    name: '<pdf-secondary-toolbar>',
    content: 'customSecondaryToolbar',
    children: [
      {
        name: '<div class="secondaryToolbar hidden doorHangerRight">',
        id: 'secondaryToolbar',
        children: [
          {
            name: '<button title="Switch to Presentation Mode">',
            id: 'secondaryPresentationMode'
          },
          { name: '<button title="Open (file)">', id: 'secondaryOpenFile' },
          { name: '<button title="Print">', id: 'secondaryPrint' },
          { name: '<button title="Download">', id: 'secondaryDownload' },
          {
            name: '<button title="Current view (copy or open in new window)">',
            id: 'secondaryViewBookmark'
          },
          { name: '<button title="Go to First Page">', id: 'firstPage' },
          { name: '<button title="Go to Last Page">', id: 'lastPage' },
          { name: '<button title="Rotate Clockwise">', id: 'pageRotateCw' },
          {
            name: '<button title="Rotate Counterclockwise">',
            id: 'pageRotateCcw'
          },
          {
            name: '<button title="Enable Text Selection Tool">',
            id: 'cursorSelectTool'
          },
          { name: '<button title="Enable Hand Tool">', id: 'cursorHandTool' },
          {
            name: '<button title="Use Vertical Scrolling">',
            id: 'scrollVertical'
          },
          {
            name: '<button title="Use Horizontal Scrolling">',
            id: 'scrollHorizontal'
          },
          {
            name: '<button title="Use Wrapped Scrolling">',
            id: 'scrollWrapped'
          },
          {
            name: '<button title="Do not join page spreads">',
            id: 'spreadNone'
          },
          {
            name:
              '<button title="Join page spreads starting with odd-numbered pages">',
            id: 'spreadOdd'
          },
          {
            name:
              '<button title="Join page spreads starting with even-numbered pages">',
            id: 'spreadEven'
          },
          {
            name: '<button title="Document Properties…">',
            id: 'documentProperties'
          }
        ]
      }
    ]
  }];

  const FINDBAR: TreeNode[] = [
  {
    name: '<pdf-findbar>',
    expanded: true,
    children: [
      {
        name: '<div class="findbar hidden doorHanger" ...>',
        id: 'findbar',
        content: 'customFindbarButtons',
        children: [
          {
            name: '<pdf-find-input-area>',
            content: 'customFindbarInputArea',
            children: [
              {
                name: '<pdf-search-input-field>',
                id: 'findInput / findInputMultiline'
              },
              { name: '<pdf-find-previous>', id: 'findPrevious' },
              { name: '<pdf-find-next>', id: 'findNext' }
            ]
          },
          {
            name: '<pdf-findbar-options-one-container>',
            children: [
              { name: '<pdf-find-highlight-all>', id: 'findHighlightAll' },
              { name: '<pdf-find-highlight-all>', id: 'findCurrentPage' },
              { name: ' <pdf-find-match-case>', id: 'findMatchCase' }
            ]
          },
          {
            name: '<pdf-findbar-options-two-container>',
            children: [
              { name: '<pdf-find-entire-word>', id: 'findEntireWord' },
              {
                name: '<pdf-find-entire-phrase>',
                children: [
                  {
                    name: '<input type="checkbox>"',
                    id: 'findMultipleSearchTexts'
                  },
                  { name: '<input type="checkbox">', id: 'individualWordsMode' }
                ]
              }
            ]
          },
          {
            name: '<pdf-findbar-options-three-container>',
            children: [
              { name: '<pdf-find-ignore-accents>', id: 'findIgnoreAccents' },
              { name: '<pdf-find-results-count>', id: 'findResultsCount' }
            ]
          },
          { name: '<pdf-findbar-message-container>', id: 'findMsg' }
        ]
      }
    ]
  }
];

@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./customization.component.css']
})
export class CustomizationComponent {
  public toolbar = TOOLBAR;

  public secondaryToolbar = SECONDARY_TOOLBAR;

  public findbar = FINDBAR;

  constructor() { }

}
