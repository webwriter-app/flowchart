import type { GraphNode } from "./graph-node";
import { anchorToward } from "./graph-nav";

/** Typical node size of the canvas: the text width plus 60 and the font size plus 30. */
const nodeWidth = (text: string) => (text === '' ? 30 : text.length * 10 + 60);
const NODE_HEIGHT = 46;
const MARGIN = 60;

export interface FlowEdge {
   from: string;
   to: string;
   text?: string;
}

/** A node as read from a file, before it has a place on the canvas. */
export interface FlowNode {
   id: string;
   node: string;
   text: string;
}

/**
 * Places nodes in layers along the edges (longest path from the roots, edges that close a cycle ignored),
 * top to bottom or, with `horizontal`, left to right, and writes the connections into the nodes.
 * The positions and connection anchors are new; ids of nodes and arrows are generated.
 */
export function layoutFlow(nodes: FlowNode[], edges: FlowEdge[], horizontal = false): GraphNode[] {
   const forward: FlowEdge[] = [];
   // Depth-first search from the roots; an edge to a node that is still open closes a cycle.
   const state = new Map<string, 'open' | 'done'>();
   const outgoing = new Map<string, FlowEdge[]>();
   for (const edge of edges) outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge]);
   const visit = (id: string) => {
      state.set(id, 'open');
      for (const edge of outgoing.get(id) ?? []) {
         if (state.get(edge.to) === 'open') continue;
         forward.push(edge);
         if (!state.has(edge.to)) visit(edge.to);
      }
      state.set(id, 'done');
   };
   const hasIncoming = new Set(edges.map((edge) => edge.to));
   for (const node of nodes) if (!hasIncoming.has(node.id) && !state.has(node.id)) visit(node.id);
   for (const node of nodes) if (!state.has(node.id)) visit(node.id);

   const layer = new Map(nodes.map((node) => [node.id, 0]));
   for (let pass = 0; pass < nodes.length; pass++) {
      let changed = false;
      for (const edge of forward) {
         if (layer.get(edge.to)! < layer.get(edge.from)! + 1) {
            layer.set(edge.to, layer.get(edge.from)! + 1);
            changed = true;
         }
      }
      if (!changed) break;
   }

   const rows = new Map<number, FlowNode[]>();
   for (const node of nodes) rows.set(layer.get(node.id)!, [...(rows.get(layer.get(node.id)!) ?? []), node]);
   const placed = new Map<string, GraphNode>();
   for (const [depth, row] of rows) {
      const along = (horizontal ? 280 : 110) * depth + MARGIN;
      const sizes = row.map((node) => horizontal ? NODE_HEIGHT : nodeWidth(node.text));
      const total = sizes.reduce((sum, size) => sum + size, 0) + 50 * (row.length - 1);
      let across = MARGIN + (horizontal ? 0 : Math.max(0, (900 - total) / 2));
      row.forEach((node, at) => {
         const x = horizontal ? along : across;
         const y = horizontal ? across : along;
         placed.set(node.id, { id: crypto.randomUUID(), node: node.node, text: node.text, x, y, connections: [] });
         across += sizes[at] + (horizontal ? 40 : 50);
      });
   }

   const center = (node: GraphNode) => ({ x: node.x + nodeWidth(node.text) / 2, y: node.y + NODE_HEIGHT / 2 });
   const seen = new Set<string>();
   for (const edge of edges) {
      const from = placed.get(edge.from);
      const to = placed.get(edge.to);
      const key = `${edge.from}>${edge.to}`;
      // One arrow per pair of nodes; the canvas keeps connections by the node they lead to.
      if (!from || !to || from === to || seen.has(key)) continue;
      seen.add(key);
      const arrowID = crypto.randomUUID();
      from.connections!.push({ anchor: anchorToward(center(from), center(to)), direction: 'to', connectedToId: to.id, arrowID, ...(edge.text ? { text: edge.text } : {}) });
      to.connections!.push({ anchor: anchorToward(center(to), center(from)), direction: 'from', connectedToId: from.id, arrowID });
   }
   return nodes.map((node) => placed.get(node.id)!);
}

/** The nodes in the order a reader follows the chart: breadth first from the start, then what is left from top to bottom. Comments and empty connectors are left out. */
export function readingOrder(nodes: GraphNode[]): GraphNode[] {
   const byPosition = (a: GraphNode, b: GraphNode) => a.y - b.y || a.x - b.x;
   const byId = new Map(nodes.map((node) => [node.id, node]));
   const seen = new Set<string>();
   const order: GraphNode[] = [];
   const queue: GraphNode[] = [];
   const walk = (root: GraphNode) => {
      if (seen.has(root.id)) return;
      seen.add(root.id);
      queue.push(root);
      while (queue.length) {
         const node = queue.shift()!;
         order.push(node);
         const next = (node.connections ?? []).filter((connection) => connection.direction === 'to').map((connection) => byId.get(connection.connectedToId));
         for (const target of next) {
            if (target && !seen.has(target.id)) {
               seen.add(target.id);
               queue.push(target);
            }
         }
      }
   };
   const sorted = [...nodes].sort(byPosition);
   for (const root of sorted.filter((node) => node.node === 'start')) walk(root);
   for (const root of sorted) walk(root);
   return order.filter((node) => node.node !== 'text' && node.text.trim() !== '');
}
