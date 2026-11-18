import type { GraphNode } from "./graph-node";
import { layoutFlow, type FlowEdge, type FlowNode } from "./flow-layout";

/** Mermaid class names written after a node, so that start and end, or a comment, survive a round trip. */
const CLASS_OF: Record<string, string> = { start: 'start', end: 'end', op: 'op', decision: 'decision', connector: 'connector', 'i/o': 'io', sub: 'sub', text: 'text' };
const TYPE_OF = Object.fromEntries(Object.entries(CLASS_OF).map(([type, name]) => [name, type]));

const SHAPES: [open: string, close: string, type: string][] = [
   ['([', '])', 'start'],
   ['[[', ']]', 'sub'],
   ['[/', '/]', 'i/o'],
   ['[\\', '\\]', 'i/o'],
   ['((', '))', 'connector'],
   ['{', '}', 'decision'],
   ['[', ']', 'op'],
   ['(', ')', 'op'],
   ['>', ']', 'text'],
];

const quote = (text: string) => `"${text.replace(/"/g, '#quot;').replace(/\|/g, '#124;').replace(/\s+/g, ' ')}"`;

/** The chart as a Mermaid flowchart: one line per node and one per arrow. Positions, tasks and hints are not part of the format. */
export function toMermaid(nodes: GraphNode[]): string {
   const id = new Map(nodes.map((node, at) => [node.id, `n${at + 1}`]));
   const lines = ['flowchart TD'];
   for (const node of nodes) {
      const text = node.node === 'connector' ? ' ' : node.text.trim();
      const [open, close] = (node.node === 'start' || node.node === 'end') ? ['([', '])']
         : node.node === 'sub' ? ['[[', ']]']
         : node.node === 'i/o' ? ['[/', '/]']
         : node.node === 'connector' ? ['((', '))']
         : node.node === 'decision' ? ['{', '}']
         : node.node === 'text' ? ['>', ']']
         : ['[', ']'];
      lines.push(`    ${id.get(node.id)}${open}${quote(text)}${close}:::${CLASS_OF[node.node] ?? 'op'}`);
   }
   for (const node of nodes) {
      for (const connection of node.connections ?? []) {
         const target = id.get(connection.connectedToId);
         if (connection.direction !== 'to' || !target) continue;
         const label = connection.text?.trim();
         lines.push(`    ${id.get(node.id)} -->${label ? `|${quote(label)}|` : ''} ${target}`);
      }
   }
   return lines.join('\n') + '\n';
}

const unquote = (text: string) => {
   const trimmed = text.trim();
   const inner = trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
   return inner.replace(/#quot;/g, '"').replace(/#124;/g, '|').replace(/<br\s*\/?>/gi, ' ').trim();
};

const NODE_ID = /^[\p{L}\p{N}_]+/u;
const LINK = /^(?:--\s+([^->]+?)\s+-->|==\s+([^=>]+?)\s+==>|-\.\s+([^.>]+?)\s+\.->|(-->|---|-\.->|-\.-|==>|===|--x|--o)(?:\|([^|]*)\|)?)\s*/;

/**
 * Reads a Mermaid flowchart (`flowchart` or `graph`, directions TD, TB, BT, LR, RL) and places its nodes on the canvas.
 * Understood: node shapes `[]`, `([])`, `[[]]`, `[//]`, `(())`, `{}`, `()`, `>]` with quoted or plain labels, the classes
 * `:::start`, `:::end`, `:::op`, `:::decision`, `:::connector`, `:::io`, `:::sub`, `:::text`, chains of arrows with labels.
 * Comments, `classDef`, `class`, `style`, `linkStyle` and `click` lines are skipped.
 * Throws an `Error` with the matching text of `texts` when the file is not a flowchart, uses subgraphs or other syntax, or has no node.
 */
export function fromMermaid(source: string, texts: { notFlowchart: string; unsupported: string; empty: string }): GraphNode[] {
   const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.replace(/%%.*$/, '').trim()).filter(Boolean);
   // A front matter block, as written by Mermaid's own editor
   if (lines[0] === '---') lines.splice(0, lines.indexOf('---', 1) + 1);
   const header = /^(flowchart|graph)(?:\s+(TD|TB|BT|LR|RL))?\s*;?$/i.exec(lines.shift() ?? '');
   if (!header) throw new Error(texts.notFlowchart);
   const horizontal = /^(LR|RL)$/i.test(header[2] ?? '');

   const nodes = new Map<string, FlowNode & { shaped: boolean; typed: boolean }>();
   const edges: FlowEdge[] = [];
   const ensure = (id: string) => {
      if (!nodes.has(id)) nodes.set(id, { id, node: 'op', text: id, shaped: false, typed: false });
      return nodes.get(id)!;
   };

   const readNode = (text: string): { id: string; rest: string } => {
      const id = NODE_ID.exec(text)?.[0];
      if (!id) throw new Error(texts.unsupported);
      const node = ensure(id);
      let rest = text.slice(id.length);
      const shape = SHAPES.find(([open]) => rest.startsWith(open));
      if (shape) {
         const [open, close, type] = shape;
         const body = rest.slice(open.length);
         let end: number;
         if (body.startsWith('"')) {
            const quoteEnd = body.indexOf('"', 1);
            end = quoteEnd < 0 ? -1 : body.indexOf(close, quoteEnd + 1);
         } else {
            end = body.indexOf(close);
         }
         if (end < 0) throw new Error(texts.unsupported);
         node.text = unquote(body.slice(0, end));
         node.shaped = true;
         if (!node.typed) node.node = type;
         rest = body.slice(end + close.length);
      }
      const cls = /^:::([\w-]+)/.exec(rest);
      if (cls) {
         if (TYPE_OF[cls[1]]) { node.node = TYPE_OF[cls[1]]; node.typed = true; }
         rest = rest.slice(cls[0].length);
      }
      return { id, rest };
   };

   for (const line of lines) {
      if (/^subgraph\b/i.test(line)) throw new Error(texts.unsupported);
      if (/^direction\b/i.test(line)) continue;
      if (/^(classDef|class|style|linkStyle|click|accTitle|accDescr)\b/.test(line)) continue;
      for (const statement of line.split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((part) => part.trim()).filter(Boolean)) {
         let current = readNode(statement);
         let rest = current.rest.trim();
         while (rest) {
            const link = LINK.exec(rest);
            if (!link) throw new Error(texts.unsupported);
            const label = unquote(link[1] ?? link[2] ?? link[3] ?? link[5] ?? '');
            const next = readNode(rest.slice(link[0].length).trim());
            edges.push({ from: current.id, to: next.id, ...(label ? { text: label } : {}) });
            current = next;
            rest = next.rest.trim();
         }
      }
   }
   if (!nodes.size) throw new Error(texts.empty);

   const hasIncoming = new Set(edges.map((edge) => edge.to));
   const hasOutgoing = new Set(edges.map((edge) => edge.from));
   const flow = [...nodes.values()].map(({ id, node, text, typed }) => {
      // A stadium shape stands for start or end; without a class the arrows tell which.
      if (!typed && node === 'start') node = hasIncoming.has(id) && !hasOutgoing.has(id) ? 'end' : hasIncoming.has(id) ? 'op' : 'start';
      // Decisions keep room for the diamond, as new ones do.
      if (node === 'decision') text = `  ${text}  `;
      if (node === 'connector') text = '';
      return { id, node, text };
   });
   return layoutFlow(flow, edges, horizontal);
}
