import { Arrow } from "../../definitions/Arrow";
import { GraphNode } from "../../definitions/GraphNode";
import { measureTextSize } from "./utilities";

// Gibt die Anker Positionen einen Knotens in einem Array zurück
export function getAnchors(ctx: CanvasRenderingContext2D, element: GraphNode, d: number = 0) {
   const anchors = [
      { x: element.x + measureTextSize(ctx, element.text).width / 2, y: element.y - d },
      { x: element.x + measureTextSize(ctx, element.text).width + d, y: element.y + measureTextSize(ctx, element.text).height / 2 },
      { x: element.x + measureTextSize(ctx, element.text).width / 2, y: element.y + measureTextSize(ctx, element.text).height + d },
      { x: element.x - d, y: element.y + measureTextSize(ctx, element.text).height / 2 },
   ];
   return anchors;
}

// Sucht den nähstgelegenten Ankerpunkt und gibt den Index zurück 
export function getNearestCircle(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, element: GraphNode): number {
   const anchors = getAnchors(ctx, element);

   let minDistance = Infinity;
   let nearestCircleIndex = 0;

   anchors.forEach((position, index) => {
      const distance = Math.sqrt((position.x - from.x) ** 2 + (position.y - from.y) ** 2);
      if (distance < minDistance) {
         minDistance = distance;
         nearestCircleIndex = index;
      }
   });

   return nearestCircleIndex;
}

export function highlightAnchor(ctx: CanvasRenderingContext2D, selectedElement: GraphNode | undefined, selectedArrow: Arrow | undefined, x: number, y: number) {
   let found = false;
   let hoveredAnchor: { element: GraphNode; anchor: number };
   let isArrowAnchorHovered = false;

   // Highlight die Anker eines Knotens
   if (selectedElement && selectedElement.node !== 'text') {
       const anchors = getAnchors(ctx, selectedElement, 15);

       anchors.forEach((position, index) => {
           const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);

           if (distance <= 8) {
               hoveredAnchor = { element: selectedElement, anchor: index };
               found = true;
           }
       });
   }

   // Highlight den Anker einer Verbindung
   if (!found && selectedArrow && selectedArrow.points) {
       const points = selectedArrow.points;
       const endPoint = points[points.length - 1];
       const distance = Math.sqrt((endPoint.x - x) ** 2 + (endPoint.y - y) ** 2);

       if (distance <= 8) {
           isArrowAnchorHovered = true;
           found = true;
       }
   }

   if (!found) {
       hoveredAnchor = undefined;
       isArrowAnchorHovered = false;
   }

   return { hoveredAnchor, isArrowAnchorHovered };
}