
import { GraphNode } from "../../definitions/GraphNode";
import { measureTextSize } from "../helper/utilities";
import { getAnchors } from "../helper/anchorHelper";

// Funktion zum Zeichnen von GraphNode-Elementen
export function drawGraphNode(ctx: CanvasRenderingContext2D, element: GraphNode, selectedElement: GraphNode, selectedSequence: any[]) {

   // Setze die Schriftart des Textes, dies muss vorher gesetzt werden, damit die größe des Textes richtig berechnet werden kann.
   ctx.font = 'bold 16px Courier New';

   const { node, text, x, y } = element;
   let { width, height } = measureTextSize(ctx, text);
  
   // Zeichne die passenden Knoten je nach Typ
   switch (node) {
      case 'start':  
      case 'end':
         // abgerundestes Rechteck
         ctx.fillStyle = '#FF6961'
         const radius = 25; 
         ctx.beginPath();
         ctx.moveTo(x + radius, y);
         ctx.lineTo(x + width - radius, y);
         ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
         ctx.lineTo(x + width, y + height - radius);
         ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
         ctx.lineTo(x + radius, y + height);
         ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
         ctx.lineTo(x, y + radius);
         ctx.quadraticCurveTo(x, y, x + radius, y);
         ctx.closePath();
         ctx.fill();
         break;
      case 'op':  
         // Rechteck
         ctx.fillStyle = '#FFEC8B';
         ctx.beginPath();
         ctx.moveTo(x, y);
         ctx.lineTo(x + width, y);
         ctx.lineTo(x + width, y + height);
         ctx.lineTo(x, y + height);
         ctx.closePath();
         ctx.fill();
         break;
      case 'decision':     
         // Diamant
         ctx.fillStyle = '#4F94CD';
         ctx.beginPath();
         ctx.moveTo(x + width / 2, y);
         ctx.lineTo(x + width, y + height / 2);
         ctx.lineTo(x + width / 2, y + height);
         ctx.lineTo(x, y + height / 2);
         ctx.closePath();
         ctx.fill();
         break;
      case 'connector':    
         // Kreis
         ctx.fillStyle = '#C6CBC4';
         const circleRadius = Math.min(width, height) / 3;
         ctx.beginPath();
         ctx.arc(x + width / 2, y + height / 2, circleRadius, 0, 2 * Math.PI);
         ctx.fill();
         break;
      case 'i/o':
         // Parallelogramm
         ctx.fillStyle = '#49B675'; 
         const skew = 20;  
         ctx.beginPath();
         ctx.moveTo(x + skew, y);
         ctx.lineTo(x + width, y);
         ctx.lineTo(x + width - skew, y + height);
         ctx.lineTo(x, y + height);
         ctx.closePath();
         ctx.fill();
         break;
      case 'sub':
         // Rechteck mit 2 vertikalen Linien
         ctx.fillStyle = '#C6CBC4';
         const d = 6; // Abstand der Linien
         ctx.beginPath();
         ctx.moveTo(x, y);
         ctx.lineTo(x + width, y);
         ctx.lineTo(x + width, y + height);
         ctx.lineTo(x, y + height);
         ctx.lineTo(x, y);
         ctx.moveTo(x + d, y);
         ctx.lineTo(x + d, y + height);
         ctx.moveTo(x + width - d, y);
         ctx.lineTo(x + width - d, y + height);
         ctx.closePath();
         ctx.fill();
         break;
      default:
         ctx.fillStyle = '';
   }

   // Fügt den schwarzen Umriss hinzu
   if (element.node !== 'text') {
      ctx.strokeStyle = 'black';
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.stroke();
   }

   // Text zum Element hinzufügen
   ctx.fillStyle = 'black';
   ctx.textAlign = 'center'
   ctx.textBaseline = 'middle';
   const textX = x + width / 2; 
   const textY = y + height / 2;
   ctx.fillText(text, textX, textY);

   // Hervorhebung eines ausgewählten Knoten
   if (selectedElement === element && selectedElement.node === 'text') {
      ctx.strokeStyle = '#87cefa';
      ctx.setLineDash([5, 10]);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
   }

   //Hervorhebung der ausgewählten Sequenz und Anzeige des Counters
   const sequenceIndex = selectedSequence.findIndex((item) => item.id === element.id && item.type === 'node');
   if (sequenceIndex !== -1) {
      ctx.save();
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = 'gold';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(
         selectedSequence[sequenceIndex].order.toString(),
         x + width + 8,
         y - 5
      );
      ctx.restore();
   }

}

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