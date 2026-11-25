import type { GraphNode } from "../model/graph-node";
import { layoutFlow, readingOrder } from "../model/flow-layout";
import { fromMermaid, toMermaid } from "../model/mermaid";
import { nodeLabel } from "../model/node-labels";
import { createArrowsFromGraphNodes, reconnectArrows } from "../model/preset-helper";
import type { WebwriterFlowchart } from "../widgets/webwriter-flowchart";

type Host = WebwriterFlowchart;

/** Replaces the chart by new nodes. Tasks and hints stay, but a recorded path points at nodes that are gone, so it is dropped. */
function replaceChart(host: Host, nodes: GraphNode[]) {
   host.selectedNode = undefined;
   host.selectedArrow = undefined;
   host.selectedNodes = [];
   host.selectedSequence = [];
   host.graphNodes = nodes;
   host.arrows = createArrowsFromGraphNodes([], nodes);
   reconnectArrows(host.arrows, nodes);
   host.taskList = host.taskList.map(({ sequence: _dropped, ...task }) => task);
   if (host.canvas && host.ctx) host.view.fitToContent();
}

/** Takes over the steps of a list: a start, one process per item, an end. */
export function importList(this: Host, fragment: DocumentFragment): boolean {
   const list = fragment.querySelector('ol, ul');
   const steps = [...(list?.children ?? [])].filter((item) => item.localName === 'li').map((item) => (item.textContent ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean);
   if (!steps.length) return false;
   const flow = [
      { id: 'start', node: 'start', text: nodeLabel('start', this.msg) },
      ...steps.map((text, at) => ({ id: `step${at}`, node: 'op', text })),
      { id: 'end', node: 'end', text: nodeLabel('end', this.msg) },
   ];
   const edges = flow.slice(1).map((node, at) => ({ from: flow[at].id, to: node.id }));
   replaceChart(this, layoutFlow(flow, edges));
   return true;
}

/** The captions in reading order as an ordered list. Branches and loops are flattened. */
export function exportList(this: Host): HTMLOListElement | null {
   const nodes = readingOrder(this.graphNodes);
   if (!nodes.length) return null;
   const list = this.ownerDocument.createElement('ol');
   for (const node of nodes) {
      const item = this.ownerDocument.createElement('li');
      item.textContent = node.text.trim();
      list.append(item);
   }
   return list;
}

/** The whole chart on a white canvas, or null while there is nothing to draw. */
function render(host: Host): HTMLCanvasElement | null {
   if (!host.canvas || !host.ctx || !host.graphNodes.length) return null;
   if (!host.view.beginPrint()) return null;
   try {
      const target = host.ownerDocument.createElement('canvas');
      target.width = host.canvas.width;
      target.height = host.canvas.height;
      const ctx = target.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, target.width, target.height);
      ctx.drawImage(host.canvas, 0, 0);
      return target;
   } finally {
      host.view.endPrint();
   }
}

/** The chart as a PNG picture, fitted to its content; null for an empty chart. */
export function exportPng(this: Host): Promise<File | null> {
   const picture = render(this);
   if (!picture) return Promise.resolve(null);
   return new Promise((resolve) => picture.toBlob((blob) => resolve(blob ? new File([blob], 'flowchart.png', { type: 'image/png' }) : null), 'image/png'));
}

/** The chart as an `img` with a PNG data URL; null for an empty chart. */
export function exportImage(this: Host): HTMLImageElement | null {
   const picture = render(this);
   if (!picture) return null;
   const image = this.ownerDocument.createElement('img');
   image.src = picture.toDataURL('image/png');
   image.alt = this.msg('Flowchart');
   return image;
}

/** The chart as Mermaid text; positions, tasks and hints are not part of it. */
export function exportMermaid(this: Host): File | null {
   if (!this.graphNodes.length) return null;
   return new File([toMermaid(this.graphNodes)], 'flowchart.mmd', { type: 'text/vnd.mermaid' });
}

/** Reads a Mermaid flowchart and returns the function that replaces the chart by it. */
export async function importMermaid(this: Host, file: File): Promise<() => void> {
   const nodes = fromMermaid(await file.text(), {
      notFlowchart: this.msg('This is not a Mermaid flowchart.'),
      unsupported: this.msg('The Mermaid file uses syntax that the flowchart cannot represent.'),
      empty: this.msg('The Mermaid file contains no nodes.'),
   });
   return () => replaceChart(this, nodes);
}
