import type { MsgFn } from '@lit/localize';
import type { NodeType } from './graph-edit';

/** Default caption of a node type, in the language `msg` answers in. */
export function nodeLabel(node: string, msg: MsgFn): string {
   switch (node) {
      case 'start': return msg('Start');
      case 'op': return msg('Process');
      case 'decision': return msg('Decision');
      case 'i/o': return msg('Input/Output');
      case 'sub': return msg('Subprogram');
      case 'connector': return msg('Connector');
      case 'end': return msg('End');
      case 'text': return msg('Comment');
      default: return '';
   }
}

/**
 * Caption of the node placed on the canvas. It differs from the palette button for `decision`,
 * whose caption is padded so the diamond has room, and for `connector`, which carries none.
 */
export function newNodeText(node: NodeType, msg: MsgFn): string {
   switch (node) {
      case 'decision': return '  ' + nodeLabel(node, msg) + '  ';
      case 'connector': return '';
      default: return nodeLabel(node, msg);
   }
}
