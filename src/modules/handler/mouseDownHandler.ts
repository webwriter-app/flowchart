import { GraphNode } from "../../definitions/GraphNode";
import { Arrow } from "../../definitions/Arrow";
import { findLastGraphNode, removeOldConnection, isWithinCircle } from "../helper/utilities";


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

export function handleArrowDragStart( ctx: CanvasRenderingContext2D, x: number, y: number, graphNodes: GraphNode[], selectedArrow: Arrow, handleAnchorClick: ( tempElement: GraphNode, tempAnchor: number) => void) {
   let arrowToMove: Arrow;
   let arrowStart: { node: GraphNode; anchor: number };

   if (selectedArrow) {
      const { points } = selectedArrow;

      // Überprüfe ob einer der Ankerpunkte berührt wurde, wenn ja setze die Variablen zum ziehen.
      if (isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
         let tempElement: GraphNode;
         let tempAnchor: number;
         const nearestElement = findLastGraphNode(ctx, graphNodes, x, y);

         // Bestimme das Startelement von dem der temporäre Pfeil gesetzt werden soll
         if (nearestElement) {
            tempElement = selectedArrow.from;
            for (let i = 0; i < tempElement.connections.length; i++) {
               if (tempElement.connections[i].connectedToId === nearestElement.id) { tempAnchor = tempElement.connections[i].anchor }
            }

            // Rufe handleAnchorClick auf um einen temporären Pfeil zu zeichnen.
            handleAnchorClick( tempElement, tempAnchor);

            // Lösche die alten Verbindungsinformationen innerhalb der Knoten und die Verbindung
            removeOldConnection(selectedArrow.from, selectedArrow.to);
            // Entferne den alte Verbindung 
            arrowToMove = selectedArrow;
            arrowStart = { node: tempElement, anchor: tempAnchor };
         }
      }
   }

   return { arrowToMove, arrowStart };
}