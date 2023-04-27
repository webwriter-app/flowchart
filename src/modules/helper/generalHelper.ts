import { GraphNode } from "../../domain/GraphNode";

// Entfernt die alten Verbindungsinformationen innerhalb der Knoten 
export function removeOldConnection(fromNode: GraphNode, toNode: GraphNode) {

   // Entferne die Verbindungsinformation vom Startknoten 
   if (fromNode.connections) {
      fromNode.connections = fromNode.connections.filter(
         (connection) => connection.connectedToId !== toNode.id
      );
   }

   // Entferne die Verbindungsinformation vom Zielknoten
   if (toNode.connections) {
      toNode.connections = toNode.connections.filter(
         (connection) => connection.connectedToId !== fromNode.id
      );
   }
}

// Bestimmt die Maße des Knotens anhand der Textgrößen
export function measureTextSize(ctx: CanvasRenderingContext2D, text: string): { width: number; height: number } {
   const metrics = ctx.measureText(text);
   // const width = Math.max(metrics.width + 20, 80);
   // const height = Math.max(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 20, 60);
   const width = metrics.width + 30;
   const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 30;
   return { width, height };
}

export function findLastGraphNode(ctx: CanvasRenderingContext2D, graphNodes: GraphNode[], x: number, y: number) {
   const d = 5;  // Toleranzbereich
   return findLast(graphNodes, (element) =>
      x >= element.x - d &&
      x <= element.x + measureTextSize(ctx, element.text).width + d &&
      y >= element.y - d &&
      y <= element.y + measureTextSize(ctx, element.text).height + d
   );
}

export function findGraphNodeLastIndex(ctx: CanvasRenderingContext2D, graphNodes: GraphNode[], x: number, y: number) {
   const d = 5;  // Toleranzbereich
   return findLastIndex(graphNodes, (element) =>
      x >= element.x - d &&
      x <= element.x + measureTextSize(ctx, element.text).width + d &&
      y >= element.y - d &&
      y <= element.y + measureTextSize(ctx, element.text).height + d
   );
}

function findLast<T>(arr: T[], predicate: (element: T) => boolean): T | undefined {
   for (let i = arr.length - 1; i >= 0; i--) {
      const element = arr[i];
      if (predicate(element)) {
         return element;
      }
   }
   return undefined;
}

function findLastIndex<T>(arr: T[], predicate: (element: T) => boolean): number {
   for (let i = arr.length - 1; i >= 0; i--) {
      const element = arr[i];
      if (predicate(element)) {
         return i;
      }
   }
   return -1;
}
