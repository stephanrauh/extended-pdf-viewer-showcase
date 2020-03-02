import { TreeNode } from './../tree-node';
import { Component, OnInit, Input } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  public _treeData: TreeNode[];

  public treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<TreeNode>();

  constructor() {
  }

  @Input()
   public set treeData(treeData: TreeNode[]) {
    this.dataSource.data = this.enrichTreeData(treeData);
    this.treeControl.dataNodes = this.dataSource.data;
    this.treeControl.expandAll();

  }

  ngOnInit(): void {
  }

  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  private enrichTreeData(nodes: TreeNode[]): TreeNode[] {
    if (!nodes) {
      return;
    }
    nodes.forEach(n => {
      if (n.name.endsWith('>')) {
        n.suffix = '>';
        n.prefix = n.name.substring(0, n.name.length - 1);
      } else {
        n.prefix = n.name;
        n.suffix = '';
      }
      this.enrichTreeData(n.children);
    });
    return nodes;
  }

}
