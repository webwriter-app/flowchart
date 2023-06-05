import { GraphNode } from "../../definitions/GraphNode";
import { measureTextSize } from "../helper/utilities";
import { getAnchors } from "../helper/anchorHelper";
import { ThemeManager } from "../styles/ThemeManager";

// Funktion zum Zeichnen von GraphNode-Elementen
export function drawGraphNode(ctx: CanvasRenderingContext2D, element: GraphNode, settings: { font: string; fontSize: number; theme: string }, selectedNodes: GraphNode[], selectedSequence: any[]) {

   const themeManager: ThemeManager = new ThemeManager();
   const theme = themeManager.getTheme(settings.theme);

   // Setze die Schriftart des Textes, dies muss vorher gesetzt werden, damit die größe des Textes richtig berechnet werden kann.
   if (settings.font === 'Courier New') {
      ctx.font = `bold ${settings.fontSize}px ${settings.font}`;
   } else {
      ctx.font = `${settings.fontSize}px ${settings.font}`;
   }

   const { node, text, x, y } = element;
   let { width, height } = measureTextSize(ctx, text);

   // Zeichne die passenden Knoten je nach Typ
   switch (node) {
      case 'start':
      case 'end':
         // abgerundestes Rechteck
         ctx.fillStyle = theme.startEndColor;
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
         ctx.fillStyle = theme.opColor;
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
         ctx.fillStyle = theme.decisionColor;
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
         ctx.fillStyle = theme.connectorColor;
         const circleRadius = Math.min(width, height) / 3;
         ctx.beginPath();
         ctx.arc(x + width / 2, y + height / 2, circleRadius, 0, 2 * Math.PI);
         ctx.fill();
         break;
      case 'i/o':
         // Parallelogramm
         ctx.fillStyle = theme.ioColor;
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
         ctx.fillStyle = theme.subColor;
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
   if (selectedNodes.some(node => node.id === element.id)) {
      ctx.strokeStyle = '#87cefa';
      ctx.setLineDash([5, 10]);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
   }

    //Hervorhebung der ausgewählten Sequenz und Anzeige des Counters
   if (selectedSequence.length > 0) {
   // Bestimmt die Indizes, an denen die Knoten-ID in der selectedSequence vorkommt.
      const indices = selectedSequence.map((item, index) => item.id === element.id && item.type === 'node' ? index : -1).filter(index => index !== -1);
      // Zeichnet die Zahlen basierend auf den berechneten Indizes.
      indices.forEach((index, i) => {
         ctx.save();
         ctx.strokeStyle = '#990000';
         ctx.lineWidth = 2;
         ctx.stroke();

         ctx.fillStyle = '#990000';
         ctx.font = 'bold 16px Arial';
         ctx.fillText(
            (index + 1).toString(), 
            x + width + ((i + 1) * 20),
            y - 6 - (i * 3)
         );
         ctx.restore();
      });
   }

}

export function drawNodeAnchors(ctx: CanvasRenderingContext2D, element: GraphNode, hoveredAnchor: { element: GraphNode; anchor: number } | undefined) {
   if (element.node !== 'text') {
      ctx.fillStyle = '#5CACEE';

      const distance = 25;
      const anchors = getAnchors(ctx, element, distance);

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
   const length = 15;
   const width = 10;

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