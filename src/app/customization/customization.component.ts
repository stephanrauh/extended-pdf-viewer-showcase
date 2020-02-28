import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  name: string;
  id?: string;
  children?: FoodNode[];
  content?: string;
}

const TREE_DATA: FoodNode[] = [
  {
    name: '<pdf-findbar>',
    children: [
      {
        name: '<div class="findbar hidden doorHanger" ...>',
        id: 'findbar',
        content: 'customFindbarButtons',
        children: [
          { name: '<pdf-find-input-area>' },
          {
            name: '<pdf-findbar-options-one-container>',
            children: [
              { name: '<pdf-find-highlight-all>', id: 'findHighlightAll' },
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
                    name: '<input type="checkbox"',
                    id: 'findMultipleSearchTexts'
                  },
                  { name: '<input type="checkbox"', id: 'individualWordsMode' }
                ]
              }
            ]
          },
          { name: '<pdf-findbar-options-three-container>', children: [] },
          { name: '<pdf-findbar-message-container>', id: 'findMsg' }
        ]
      }
    ]
  },
  {
    name: '<pdf-secondary-toolbar>',
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
  },
  {
    name: 'toolbar',
    children: [
      {
        name: ' <div id="toolbarViewer">',
        children: [
          {
            name: '<div id="toolbarViewerLeft">',
            children: [
              { name: 'toggle sidebar', id: 'sidebarToggle' },
              { name: 'toolbarButtonSpacer' },
              { name: 'findButton', id: 'viewFind' },
              { name: '<pdf-paging-area>' }
            ]
          },
          {
            name: '<div id="toolbarViewerRight">',
            children: [
              { name: '<pdf-presentation-mode>' },
              { name: '<pdf-open-file>' },
              { name: '<pdf-print>' },
              { name: '<pdf-download>' },
              { name: '<pdf-bookmark>' },
              { name: '<div class="verticalToolbarSeparator">' },
              {
                name: '<pdf-show-secondary-toolbar>',
                id: 'secondaryToolbarToggle'
              }
            ]
          },
          {
            name: '<pdf-zoom-toolbar>',
            children: []
          }
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
  treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FoodNode>();

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: FoodNode) =>
    !!node.children && node.children.length > 0;
}
