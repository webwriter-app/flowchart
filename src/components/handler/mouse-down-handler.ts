import { GraphNode } from "../../model/graph-node";
import { Arrow } from "../../model/arrow";
import { findLastGraphNode } from "../canvas/utilities";
import { removeOldConnection, isWithinCircle } from "../../model/graph-edit";


export function handleNodeDragStart( ctx: CanvasRenderingContext2D, x: number, y: number, graphNodes: GraphNode[], selectedArrow?: Arrow ) {
   
   const draggedNode = findLastGraphNode(ctx, graphNodes, x, y);
   let isDragging = false;
   let dragOffset: { x: number; y: number } | undefined;

   if (draggedNode && !selectedArrow) {
      isDragging = true;
      dragOffset = { x: x - draggedNode.x, y: y - draggedNode.y };
   }

   return { draggedNode, isDragging, dragOffset };
}

export function handleMultipleNodesDragStart( ctx: CanvasRenderingContext2D, x: number, y: number, selectedNodes: GraphNode[],
 selectedArrow?: Arrow ) {

   let draggedNodes: GraphNode[] = [];
   let isDragging = false;
   let dragOffset: { x: number; y: number } | undefined;

   const nodeUnderMouse = findLastGraphNode(ctx, selectedNodes, x, y);
   if (nodeUnderMouse && !selectedArrow) {
      isDragging = true;
      dragOffset = { x: x - nodeUnderMouse.x, y: y - nodeUnderMouse.y };
      draggedNodes = selectedNodes;
   }

   return { draggedNodes, isDragging, dragOffset };
}

export function handleArrowDragStart( ctx: CanvasRenderingContext2D, x: number, y: number, graphNodes: GraphNode[], selectedArrow: Arrow | undefined, handleAnchorClick: ( tempElement: GraphNode, tempAnchor: number) => void) {
   let arrowToMove: Arrow | undefined;
   let arrowStart: { node: GraphNode; anchor: number } | undefined;

   if (selectedArrow) {
      const { points } = selectedArrow;

      // If an anchor point was hit, set up the variables for dragging.
      if (isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
         let tempAnchor: number | undefined;
         const nearestElement = findLastGraphNode(ctx, graphNodes, x, y);

         // Find the start node from which the temporary arrow is drawn
         if (nearestElement) {
            const tempElement = selectedArrow.from;
            const connections = tempElement.connections ?? [];
            for (let i = 0; i < connections.length; i++) {
               if (connections[i].connectedToId === nearestElement.id) { tempAnchor = connections[i].anchor }
            }

            // Without a known anchor the arrow cannot be re-attached.
            if (tempAnchor !== undefined) {
               // Call handleAnchorClick to draw a temporary arrow.
               handleAnchorClick( tempElement, tempAnchor);

               // Remove the old connection data from the nodes and the connection
               removeOldConnection(selectedArrow.from, selectedArrow.to);
               // Remember the arrow that is being moved
               arrowToMove = selectedArrow;
               arrowStart = { node: tempElement, anchor: tempAnchor };
            }
         }
      }
   }

   return { arrowToMove, arrowStart };
}