import { TreeNode } from '../tree-node';
import { Component, Input } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource, MatTree, MatTreeNodeDef, MatTreeNode, MatTreeNodeToggle, MatNestedTreeNode, MatTreeNodeOutlet } from '@angular/material/tree';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { IconInfoComponent } from '../../icons/icon-info/icon-info.component';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-tree',
    
    standalone: true,
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.css'],
    imports: [
        MatTree,
        MatTreeNodeDef,
        MatTreeNode,
        MatTreeNodeToggle,
        MatIconButton,
        MatTooltip,
        IconInfoComponent,
        MatNestedTreeNode,
        MatIcon,
        MatTreeNodeOutlet,
    ],
})
export class TreeComponent {
  public _treeData!: TreeNode[];

  public treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  public dataSource = new MatTreeNestedDataSource<TreeNode>();

  @Input()
  public set treeData(treeData: TreeNode[]) {
    this.dataSource.data = this.enrichTreeData(treeData);
    this.treeControl.dataNodes = this.dataSource.data;
    this.treeControl.expandAll();
  }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  private enrichTreeData(nodes: TreeNode[] | undefined): TreeNode[] {
    if (!nodes) {
      return [];
    }
    nodes.forEach((n) => {
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
