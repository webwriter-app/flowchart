import { GraphNode } from "../../model/graph-node";
import { findLast, findLastIndex } from "../../model/graph-edit";

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

// Apply the configured font to the context. Set it before every measurement,
// because node size, and with it the anchor points, follows from the text width.
export function applyGraphFont(ctx: CanvasRenderingContext2D, settings: { font: string; fontSize: number }) {
   ctx.font =
      settings.font === 'Courier New'
         ? `bold ${settings.fontSize}px ${settings.font}`
         : `${settings.fontSize}px ${settings.font}`;
}

// Node dimensions from the text size
export function measureTextSize(ctx: CanvasRenderingContext2D, text: string): { width: number; height: number } {
   const metrics = ctx.measureText(text);
   const width = metrics.width + 60;

   // Read the font size from the canvas context's font
   const fontSizeMatch = ctx.font.match(/\d+px/);
   const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[0], 10) : 16;

   // Height follows from the font size
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

   // Center of the node
   const nodeCenterX = node.x + (measureTextSize(ctx, node.text).width / 2);
   const nodeCenterY = node.y + (measureTextSize(ctx, node.text).height / 2);

   return nodeCenterX >= rectStartX && nodeCenterY >= rectStartY && nodeCenterX <= rectEndX && nodeCenterY <= rectEndY;
}

export function findLastGraphNode(ctx: CanvasRenderingContext2D, graphNodes: GraphNode[], x: number, y: number) {
   const d = 5; // Tolerance
   return findLast(graphNodes, (element) =>
      x >= element.x - d &&
      x <= element.x + measureTextSize(ctx, element.text).width + d &&
      y >= element.y - d &&
      y <= element.y + measureTextSize(ctx, element.text).height + d
   );
}

export function findGraphNodeLastIndex(ctx: CanvasRenderingContext2D, graphNodes: GraphNode[], x: number, y: number) {
   const d = 5; // Tolerance
   return findLastIndex(graphNodes, (element) =>
      x >= element.x - d &&
      x <= element.x + measureTextSize(ctx, element.text).width + d &&
      y >= element.y - d &&
      y <= element.y + measureTextSize(ctx, element.text).height + d
   );
}
