import { GraphNode } from "../../domain/GraphNode";
import { getAnchors } from "../helper/anchorHelper";

export function drawNodeAnchors(ctx: CanvasRenderingContext2D, element: GraphNode,  hoveredAnchor: { element: GraphNode; anchor: number } | undefined, d: number = 20) {
   if (element.node !== 'text') {
      ctx.fillStyle = '#5CACEE';
      const anchors = getAnchors(ctx, element, d);

      // Zeichne die Ankerpunkte
      anchors.forEach((position, index) => {
         // Falls ein Ankerpunkt gehovert wird, wird die Transparenz auf 1 gesetzt. 
         (hoveredAnchor && hoveredAnchor.element === element && hoveredAnchor.anchor === index) ? ctx.globalAlpha = 1 : ctx.globalAlpha = 0.4;         

         let angle: number;
         switch (index) {
            case 0:
               angle = (3 * Math.PI) / 2;
               break;
            case 1:
               angle = 0;
               break;
            case 2:
               angle = Math.PI / 2;
               break;
            case 3:
               angle = Math.PI;
               break;
            default:
               angle = 0;
         }
         drawArrowHead(ctx, position.x, position.y, angle);
      });
      ctx.globalAlpha = 1;
   }
}

// Zeichne den Ankerpunkt als Pfeilspitze für die Knoten 
function drawArrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
   const length = 10;
   const width = 6;

   ctx.save();
   ctx.translate(x, y);
   ctx.rotate(angle);
   ctx.beginPath();
   ctx.moveTo(0, 0);
   ctx.lineTo(-length, -width);
   ctx.lineTo(-length, width);
   ctx.closePath();
   ctx.fill();
   ctx.restore();
}