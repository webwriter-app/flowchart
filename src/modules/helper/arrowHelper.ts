import { Arrow } from "../../definitions/Arrow";
import { GraphNode } from "../../definitions/GraphNode";
import { getAnchors } from "./anchorHelper";

// Gibt die Koordinaten und Ankerpunkt eines Pfeils zurück 
export function getArrowInformation(ctx: CanvasRenderingContext2D, from: GraphNode, to: GraphNode, direction: 'to' | 'from') {

   let arrowInformation = {
      x: 0,
      y: 0,
      anchor: 0
   };

   const anchors = getAnchors(ctx, from);

   if (!from.connections) {
      console.log("Keine Verbindung gefunden.");
      return arrowInformation;
   }

   const connection = from.connections.find(
      x => x.connectedToId === to.id && x.direction === direction
   );
   if (connection) {
      arrowInformation.x = anchors[connection.anchor].x;
      arrowInformation.y = anchors[connection.anchor].y;
      arrowInformation.anchor = connection.anchor;
      return arrowInformation;
   }

   return arrowInformation;
}

// Überprüft ob ein Klick eine Verbindung/Pfeil berührt hat, 
export function isArrowClicked(mouseX: number, mouseY: number, points: { x: number; y: number }[]): boolean {
   const clickTolerance = 8;

   for (let i = 0; i < points.length - 1; i++) {
      const startPoint = points[i];
      const endPoint = points[i + 1];

      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      const dot = ((mouseX - startPoint.x) * dx + (mouseY - startPoint.y) * dy) / (length * length);
      const closestX = startPoint.x + dot * dx;
      const closestY = startPoint.y + dot * dy;

      if (dot >= 0 && dot <= 1) {
         const distance = Math.sqrt(Math.pow(closestX - mouseX, 2) + Math.pow(closestY - mouseY, 2));
         if (distance <= clickTolerance) {
            return true;
         }
      }
   }
   return false;
}

export function findArrow(arrows: Arrow[], x: number, y: number) {
   return arrows.find((arrow) => isArrowClicked(x, y, arrow.points));
}