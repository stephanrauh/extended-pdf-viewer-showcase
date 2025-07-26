import { TreeNode } from '../tree-node';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconInfoComponent } from '../../icons/icon-info/icon-info.component';

@Component({
    selector: 'app-tree',
    
    standalone: true,
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.css'],
    imports: [
        CommonModule,
        IconInfoComponent,
    ],
})
export class TreeComponent {
  public _treeData!: TreeNode[];
  public expandedNodes = new Set<TreeNode>();

  @Input()
  public set treeData(treeData: TreeNode[]) {
    this._treeData = this.enrichTreeData(treeData);
    // Auto-expand all nodes initially
    this.expandAllNodes(this._treeData);
  }

  public get treeData(): TreeNode[] {
    return this._treeData || [];
  }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  isExpanded(node: TreeNode): boolean {
    return this.expandedNodes.has(node);
  }

  toggle(node: TreeNode): void {
    if (this.expandedNodes.has(node)) {
      this.expandedNodes.delete(node);
    } else {
      this.expandedNodes.add(node);
    }
  }

  private expandAllNodes(nodes: TreeNode[]): void {
    nodes.forEach(node => {
      if (this.hasChild(0, node)) {
        this.expandedNodes.add(node);
        this.expandAllNodes(node.children!);
      }
    });
  }

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
