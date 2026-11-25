import type { Arrow } from "./arrow";
import type { GraphNode } from "./graph-node";
import type { SequenceStep } from "./item-list";

export type NodeType = 'start' | 'end' | 'op' | 'decision' | 'connector' | 'i/o' | 'sub' | 'text';

// Remove the old connection data from the nodes
export function removeOldConnection(fromNode: GraphNode, toNode: GraphNode) {

   // Remove the connection data from the start node
   if (fromNode.connections) {
      fromNode.connections = fromNode.connections.filter(
         (connection) => connection.connectedToId !== toNode.id
      );
   }

   // Remove the connection data from the target node
   if (toNode.connections) {
      toNode.connections = toNode.connections.filter(
         (connection) => connection.connectedToId !== fromNode.id
      );
   }
}

/** Remove a node, the connection data it left on its neighbours and the arrows that ended at it. */
export function deleteNode(graphNodes: GraphNode[], arrows: Arrow[], node: GraphNode) {
   arrows.forEach((arrow) => {
      if (arrow.from === node || arrow.to === node) {
         removeOldConnection(arrow.from, arrow.to);
      }
   });
   return {
      graphNodes: graphNodes.filter((candidate) => candidate !== node),
      arrows: arrows.filter((arrow) => arrow.from !== node && arrow.to !== node),
   };
}

/** Remove an arrow and its connection data from both nodes. */
export function deleteArrow(arrows: Arrow[], arrow: Arrow): Arrow[] {
   for (const node of [arrow.from, arrow.to]) {
      if (node.connections) {
         node.connections = node.connections.filter((connection) => connection.arrowID !== arrow.id);
      }
   }
   return arrows.filter((candidate) => candidate !== arrow);
}

/** Store an arrow label on the arrow and on the connection of its start node, so that it survives serialization. */
export function setArrowText(arrow: Arrow, text: string) {
   arrow.text = text;
   const connection = arrow.from?.connections?.find(
      (candidate) => candidate.arrowID === arrow.id && candidate.direction === 'to'
   );
   if (connection) {
      connection.text = text;
   }
}

/** Whether a recorded path equals the expected one, step by step in id and type. */
export function sequencesMatch(selected: SequenceStep[], expected?: SequenceStep[]): boolean {
   return !!expected
      && selected.length === expected.length
      && selected.every((step, index) => step.id === expected[index].id && step.type === expected[index].type);
}

/** Offset that staggers quickly inserted nodes so that they do not cover each other; cycles through three places. */
export function placementOffset(index: number): { x: number; y: number } {
   switch (index) {
      case 1: return { x: -40, y: 20 };
      case 2: return { x: 40, y: 40 };
      default: return { x: 0, y: 0 };
   }
}

export const isWithinCircle = (x: number, y: number, circleX: number, circleY: number, radius: number):
   boolean => Math.sqrt(Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2)) <= radius;

export function findLast<T>(arr: T[], predicate: (element: T) => boolean): T | undefined {
   for (let i = arr.length - 1; i >= 0; i--) {
      const element = arr[i];
      if (predicate(element)) {
         return element;
      }
   }
   return undefined;
}

export function findLastIndex<T>(arr: T[], predicate: (element: T) => boolean): number {
   for (let i = arr.length - 1; i >= 0; i--) {
      const element = arr[i];
      if (predicate(element)) {
         return i;
      }
   }
   return -1;
}
