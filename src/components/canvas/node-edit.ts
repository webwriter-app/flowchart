import type { GraphNode } from '../../model/graph-node';
import { deleteArrow, deleteNode, placementOffset, type NodeType } from '../../model/graph-edit';
import { reconnectArrows } from '../../model/preset-helper';
import { drawGraphNode } from '../drawer/draw-graph-node';
import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';

/** Adds a node at the middle of the visible canvas; `step` staggers quickly inserted nodes. */
export function addNodeInView(host: WebwriterFlowchart, node: NodeType, text: string, step: number) {
    const workspace = host.shadowRoot?.querySelector('.workspace') as HTMLElement;
    const dpi = window.devicePixelRatio || 1;
    const scaleFactor = host.zoomLevel / 100;
    const shift = placementOffset(step);
    const element: GraphNode = {
        id: crypto.randomUUID(),
        node,
        text,
        x: (host.canvas.width / dpi * 0.4 + workspace.scrollLeft) / scaleFactor - host.canvasOffsetX + shift.x,
        y: (host.canvas.height / dpi * 0.4 + workspace.scrollTop) / scaleFactor - host.canvasOffsetY + shift.y,
    };
    host.graphNodes = [...host.graphNodes, element];
    reconnectArrows(host.arrows, host.graphNodes);
    drawGraphNode(host.ctx, element, host.graphSettings, host.selectedNodes, host.selectedSequence);
}

/** Removes the selected nodes or the selected arrow together with their connections. */
export function removeSelection(host: WebwriterFlowchart) {
    for (const node of host.selectedNodes) {
        ({ graphNodes: host.graphNodes, arrows: host.arrows } = deleteNode(host.graphNodes, host.arrows, node));
    }
    host.selectedNodes = [];
    if (host.selectedNode) {
        ({ graphNodes: host.graphNodes, arrows: host.arrows } = deleteNode(host.graphNodes, host.arrows, host.selectedNode));
        host.selectedNode = undefined;
    } else if (host.selectedArrow) {
        host.arrows = deleteArrow(host.arrows, host.selectedArrow);
        host.selectedArrow = undefined;
    }
}
