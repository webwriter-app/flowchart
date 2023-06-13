import { GraphNode } from "../../definitions/GraphNode";

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

export function snapNodePosition(ctx: CanvasRenderingContext2D, draggedNode: GraphNode, graphNodes: GraphNode[], threshold: number): void {
   const draggedNodeSize = measureTextSize(ctx, draggedNode.text);

   for (const node of graphNodes) {
      if (node.id === draggedNode.id) {
         continue;
      }

      const nodeSize = measureTextSize(ctx, node.text);

      const xDifference = Math.abs((draggedNode.x + draggedNodeSize.width / 2) - (node.x + nodeSize.width / 2));
      const yDifference = Math.abs((draggedNode.y + draggedNodeSize.height / 2) - (node.y + nodeSize.height / 2));

      if (xDifference <= threshold) {
         draggedNode.x = node.x + nodeSize.width / 2 - draggedNodeSize.width / 2;
      }

      if (yDifference <= threshold) {
         draggedNode.y = node.y + nodeSize.height / 2 - draggedNodeSize.height / 2;
      }
   }
}

export const isWithinCircle = (x: number, y: number, circleX: number, circleY: number, radius: number):
   boolean => Math.sqrt(Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2)) <= radius;

// Bestimmt die Maße des Knotens anhand der Textgrößen
export function measureTextSize(ctx: CanvasRenderingContext2D, text: string): { width: number; height: number } {
   const metrics = ctx.measureText(text);
   const width = metrics.width + 60;

   // Extrahiere die Schriftgröße aus der Font-Eigenschaft des Canvas-Kontexts
   const fontSizeMatch = ctx.font.match(/\d+px/);
   const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[0], 10) : 16;

   // Berechne die Höhe basierend auf der Schriftgröße
   const height = fontSize + 30;

   if (text === '') {
      return { width: 30, height: 30 };
   }

   return { width, height };
}

export function isNodeInRectangle(ctx: CanvasRenderingContext2D, node: GraphNode, rect: { x: number, y: number, width: number, height: number }): boolean {
   const rectStartX = rect.width >= 0 ? rect.x : rect.x + rect.width;
   const rectStartY = rect.height >= 0 ? rect.y : rect.y + rect.height;

   const rectEndX = rect.width >= 0 ? rect.x + rect.width : rect.x;
   const rectEndY = rect.height >= 0 ? rect.y + rect.height : rect.y;

   // Berechne die Mitte des Knotens
   const nodeCenterX = node.x + (measureTextSize(ctx, node.text).width / 2);
   const nodeCenterY = node.y + (measureTextSize(ctx, node.text).height / 2);

   return nodeCenterX >= rectStartX && nodeCenterY >= rectStartY && nodeCenterX <= rectEndX && nodeCenterY <= rectEndY;
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

export function findLastIndex<T>(arr: T[], predicate: (element: T) => boolean): number {
   for (let i = arr.length - 1; i >= 0; i--) {
      const element = arr[i];
      if (predicate(element)) {
         return i;
      }
   }
   return -1;
}
