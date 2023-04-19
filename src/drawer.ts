import { GraphNodeData } from './definitions';
import { measureTextSize, getAnchors } from './helper';

/*
*   Hier finden sich die Funktionen zum Zeichnen auf dem Canvas und der UI
*/

// -------------------- SVG Grafiken für die Buttons --------------------

export function drawButtonElement(element: string, menu: 'flow' | 'tool' | 'task' | 'help') {
   // Funktion zum übersichtlichen setzen der Attribute der SVG Grafiken 
   function setAttributeList(element: SVGElement, attributes: { [key: string]: string }): void {
      for (const key in attributes) {
         element.setAttribute(key, attributes[key]);
      }
   }

   // Setze die Maße für das Parent SVG Element und das Text Element in Abhängigkeit vom Menü 
   const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
   const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

   switch (menu) {
      case 'flow':
         setAttributeList(svg, {
            width: '130',
            height: '55',
         });
         setAttributeList(text, {
            x: '65',
            y: '35',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '13',
            'font-family': 'Arial'
         });
         svg.appendChild(text);
         break;
      case 'tool':
         setAttributeList(svg, {
            width: '40',
            height: '30',
         });
         break;
      case 'task':
         setAttributeList(svg, {
            width: '240',
            height: '30',
         });
         break;
      case 'help':
         setAttributeList(svg, {
            width: '140',
            height: '30',
         });
         break;
      default:
         console.log('Unbekanntes Menü');
   }

   switch (element) {
      case 'start':
      case 'end':
         const terminal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(terminal, {
            x: '15',
            y: '15',
            width: '100',
            height: '30',
            rx: '15',
            ry: '15',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(terminal);
         element === 'start' ? text.textContent = 'Start' : text.textContent = 'Ende';
         break;

      case 'op':
         const operation = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(operation, {
            x: '15',
            y: '15',
            width: '100',
            height: '30',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(operation);
         text.textContent = 'Operation';
         break;

      case 'decision':
         const decision = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
         setAttributeList(decision, {
            points: '65,5 125,27 65,50 5,27',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(decision);
         text.textContent = 'Verzweigung';
         text.setAttribute('y', '32');
         break;

      case 'connector':
         const connector = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
         setAttributeList(connector, {
            cx: '65',
            cy: '24',
            r: '8',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(connector);
         text.textContent = 'Verbindungsstelle';
         text.setAttribute('y', '50');
         break;

      case 'i/o':
         const io = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
         const offsetX = 6;
         const offsetY = 15;
         const width = 115;
         const height = 30;
         const skewX = 20;
      
         const points = [
            offsetX + skewX, offsetY,
            offsetX + width, offsetY,
            offsetX + width - skewX, offsetY + height,
            offsetX, offsetY + height
         ].join(',');
      
         setAttributeList(io, {
            points: points,
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(io);
         text.textContent = 'Ein-/Ausgabe';
         break;

      case 'sub':
         const sub = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(sub, {
            x: '7',
            y: '15',
            width: '114',
            height: '30',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(sub);

         const lineL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
         setAttributeList(lineL, {
            x1: '12',
            y1: '15',
            x2: '12',
            y2: '45',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(lineL);

         const lineR = document.createElementNS('http://www.w3.org/2000/svg', 'line');
         setAttributeList(lineR, {
            x1: '116',
            y1: '15',
            x2: '116',
            y2: '45',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(lineR);

         text.textContent = 'Unterprogramm';
         text.setAttribute('x', '63');
         break;

      case 'text':
         text.textContent = 'Text';
         break;

      // Tool Menü    
      case 'grab':
         const scaleGrab = 0.05;
         const grabX = 100;
         const grabY = 45;

         const hand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(hand, {
            d: 'M408.864 79.052c-22.401-33.898-66.108-42.273-98.813-23.588-29.474-31.469-79.145-31.093-108.334-.022-47.16-27.02-108.71 5.055-110.671 60.806C44.846 105.407 0 140.001 0 187.429v56.953c0 32.741 14.28 63.954 39.18 85.634l97.71 85.081c4.252 3.702 3.11 5.573 3.11 32.903 0 17.673 14.327 32 32 32h252c17.673 0 32-14.327 32-32 0-23.513-1.015-30.745 3.982-42.37l42.835-99.656c6.094-14.177 9.183-29.172 9.183-44.568V146.963c0-52.839-54.314-88.662-103.136-67.911zM464 261.406a64.505 64.505 0 0 1-5.282 25.613l-42.835 99.655c-5.23 12.171-7.883 25.04-7.883 38.25V432H188v-10.286c0-16.37-7.14-31.977-19.59-42.817l-97.71-85.08C56.274 281.255 48 263.236 48 244.381v-56.953c0-33.208 52-33.537 52 .677v41.228a16 16 0 0 0 5.493 12.067l7 6.095A16 16 0 0 0 139 235.429V118.857c0-33.097 52-33.725 52 .677v26.751c0 8.836 7.164 16 16 16h7c8.836 0 16-7.164 16-16v-41.143c0-33.134 52-33.675 52 .677v40.466c0 8.836 7.163 16 16 16h7c8.837 0 16-7.164 16-16v-27.429c0-33.03 52-33.78 52 .677v26.751c0 8.836 7.163 16 16 16h7c8.837 0 16-7.164 16-16 0-33.146 52-33.613 52 .677v114.445z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleGrab}) translate(${grabX} ${grabY})`
         });
         svg.appendChild(hand);
         break;

      case 'delete':
         const scaleDelete = 0.75;
         const deleteX = 5;
         const deleteY = 1;

         const bin = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(bin, {
            d: 'M28,40H11.8c-3.3,0-5.9-2.7-5.9-5.9V16c0-0.6,0.4-1,1-1s1,0.4,1,1v18.1c0,2.2,1.8,3.9,3.9,3.9H28c2.2,0,3.9-1.8,3.9-3.9V16   c0-0.6,0.4-1,1-1s1,0.4,1,1v18.1C33.9,37.3,31.2,40,28,40z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const lid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(lid, {
            d: 'M33.3,4.9h-7.6C25.2,2.1,22.8,0,19.9,0s-5.3,2.1-5.8,4.9H6.5c-2.3,0-4.1,1.8-4.1,4.1S4.2,13,6.5,13h26.9   c2.3,0,4.1-1.8,4.1-4.1S35.6,4.9,33.3,4.9z M19.9,2c1.8,0,3.3,1.2,3.7,2.9h-7.5C16.6,3.2,18.1,2,19.9,2z M33.3,11H6.5   c-1.1,0-2.1-0.9-2.1-2.1c0-1.1,0.9-2.1,2.1-2.1h26.9c1.1,0,2.1,0.9,2.1,2.1C35.4,10.1,34.5,11,33.3,11z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(line, {
            d: 'M12.9,35.1c-0.6,0-1-0.4-1-1V17.4c0-0.6,0.4-1,1-1s1,0.4,1,1v16.7C13.9,34.6,13.4,35.1,12.9,35.1z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(line2, {
            d: 'M26.9,35.1c-0.6,0-1-0.4-1-1V17.4c0-0.6,0.4-1,1-1s1,0.4,1,1v16.7C27.9,34.6,27.4,35.1,26.9,35.1z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(line3, {
            d: 'M19.9,35.1c-0.6,0-1-0.4-1-1V17.4c0-0.6,0.4-1,1-1s1,0.4,1,1v16.7C20.9,34.6,20.4,35.1,19.9,35.1z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });
         svg.appendChild(bin);
         svg.appendChild(lid);
         svg.appendChild(line);
         svg.appendChild(line2);
         svg.appendChild(line3);
         break;

      case 'help':
         const scaleHelp = 0.06;
         const helpX = 85;
         const helpY = 0;

         const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(curve, {
            d: 'M345.1,77.1C317.6,56.2,286.6,49,247.3,49c-29.8,0-55.3,6.1-75.5,19.7C142,89,128,123.1,128,177h76.8   c0-14.4-1.4-29.9,7-43.2c8.4-13.3,20.1-23.5,40.2-23.5c20.4,0,30.9,5.9,40.8,18.1c8.4,10.4,11.6,22.8,11.6,36   c0,11.4-5.8,21.9-12.7,31.4c-3.8,5.6-8.8,10.6-15.1,15.4c0,0-41.5,24.7-56.1,48.1c-10.9,17.4-14.8,39.2-15.7,65.3   c-0.1,1.9,0.6,5.8,7.2,5.8c6.5,0,56,0,61.8,0c5.8,0,7-4.4,7.1-6.2c0.4-9.5,1.6-24.1,3.3-29.6c3.3-10.4,9.7-19.5,19.7-27.3   l20.7-14.3c18.7-14.6,33.6-26.5,40.2-35.9c11.3-15.4,19.2-34.4,19.2-56.9C384,123.5,370.5,96.4,345.1,77.1z M242,370.2   c-25.9-0.8-47.3,17.2-48.2,45.3c-0.8,28.2,19.5,46.7,45.5,47.5c27,0.8,47.9-16.6,48.7-44.7C288.8,390.2,269,371,242,370.2z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleHelp}) translate(${helpX} ${helpY})`
         });
         svg.appendChild(curve);
         break;

         case 'task':
            const scaleTask = 1.5;
            const taskX = 1;
            const taskY = -1;
   
            const board = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            setAttributeList(board, {
               d: 'M5 22h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15c0 1.103.897 2 2 2zM5 5h2v2h10V5h2v15H5V5z',
               fill: 'white',
               stroke: 'white',
               'stroke-width': '0.1',
               transform: `scale(${scaleTask}) translate(${taskX} ${taskY})`
            });
   
            const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            setAttributeList(check, {
               d: 'm11 13.586-1.793-1.793-1.414 1.414L11 16.414l5.207-5.207-1.414-1.414z',
               fill: 'white',
               stroke: 'white',
               'stroke-width': '0.1',
               transform: `scale(${scaleTask}) translate(${taskX} ${taskY})`
            });
            svg.appendChild(board);
            svg.appendChild(check);
            break;

      // Task Menü 
      case 'addTask':
         setAttributeList(text, {
            x: '120',
            y: '22',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Aufgabe Hinzufügen';
         svg.appendChild(text);
         break;

      // Help Menü 
      case 'addHelp':
         setAttributeList(text, {
            x: '70',
            y: '22',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Hilfe Hinzufügen';
         svg.appendChild(text);
         break;
      default:
         console.log('Unbekannte SVG Bezeichnung');
   }

   return svg;
}

// -------------------- Knoten / Elemente --------------------

// Zeichnet den passenden Knoten und seine Ankerpunkte 
export function drawGraphElement(ctx: CanvasRenderingContext2D, element: GraphNodeData, selectedElement: GraphNodeData) {

   // Setze die Schriftart des Textes, dies muss vorher gesetzt werden, damit die größe des Textes richtig berechnet werden kann.
   ctx.font = 'bold 16px Courier New';

   const { node, text, x, y } = element;
   const { width, height } = measureTextSize(ctx, text);

   // Zeichne die passenden Knoten je nach Typ
   switch (node) {
      case 'start':
      case 'end':
         ctx.fillStyle = '#FF6961'//'#FF6A6A';
         // Zeichne ein abgerundetes Rechteck
         const radius = 25; // Radius der abgerundeten Ecken
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
         ctx.fillStyle = '#FFEC8B';
         // Zeichne ein Rechteck
         ctx.beginPath();
         ctx.moveTo(x, y);
         ctx.lineTo(x + width, y);
         ctx.lineTo(x + width, y + height);
         ctx.lineTo(x, y + height);
         ctx.closePath();
         ctx.fill();
         break;
      case 'decision':
         ctx.fillStyle = '#4F94CD';
         // Zeichne einen Diamanten
         ctx.beginPath();
         ctx.moveTo(x + width / 2, y);
         ctx.lineTo(x + width, y + height / 2);
         ctx.lineTo(x + width / 2, y + height);
         ctx.lineTo(x, y + height / 2);
         ctx.closePath();
         ctx.fill();
         break;
      case 'connector':
         ctx.fillStyle = '#C6CBC4';
         // Zeichne einen Kreis
         const circleRadius = Math.min(width, height) / 3;
         ctx.beginPath();
         ctx.arc(x + width / 2, y + height / 2, circleRadius, 0, 2 * Math.PI);
         ctx.fill();
         break;
      case 'i/o':
         ctx.fillStyle = '#49B675'; //85EB66 b2fba5
         // Zeichne ein Parallelogramm
         const s = 20; // Schräge vom Parallelogramm
         ctx.beginPath();
         ctx.moveTo(x + s, y);
         ctx.lineTo(x + width, y);
         ctx.lineTo(x + width - s, y + height);
         ctx.lineTo(x, y + height);
         ctx.closePath();
         ctx.fill();
         break;
      case 'sub':
         ctx.fillStyle = '#C6CBC4';
         // Zeichne ein Rechteck mit 2 vertikalen Linien
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
   ctx.strokeStyle = 'black';
   ctx.setLineDash([]);
   ctx.lineWidth = 2;
   ctx.stroke();

   // Text zum Element hinzufügen
   ctx.fillStyle = 'black';
   ctx.textAlign = 'center'
   ctx.textBaseline = 'middle';
   const textX = x + width / 2; 
   const textY = y + height / 2;
   ctx.fillText(text, textX, textY);


   // Hervorhebung eines ausgewählten Knoten
   // if (selectedElement === element) {
   //    ctx.strokeStyle = '#87cefa';
   //    ctx.setLineDash([5, 10]);
   //    ctx.lineWidth = 2;
   //    ctx.strokeRect(x, y, width, height);
   // }
}

export function drawElementAnchors(ctx: CanvasRenderingContext2D, element: GraphNodeData,  hoveredAnchor: { element: GraphNodeData; anchor: number } | undefined, d: number = 20) {
   if (element.node !== 'text') {
      //ctx.fillStyle = '#87cefa'; 
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

// -------------------- Pfeile / Verbindungen --------------------

// Zeichnet die Verbindungspfeile zwischen den Elementen
export function drawArrow(ctx: CanvasRenderingContext2D, from: { x: number; y: number; anchor?: number }, to: { x: number; y: number; anchor?: number }, isSelected: boolean = false, hoveredArrowAnchor: boolean = false, returnPoints = false) {

   const headLength = 7;
   const padding = 15; // Raum zwischen Elementen und Pfeil

   let points: { x: number; y: number }[] = [from];

   if (from && to) {

      // Halte die Positionen der Knoten zueinander fest
      const isAbove = to.y  < from.y;
      const isLeft = to.x < from.x;

      // Zum Zeichnen der Verbindungen zwischen zwei Knoten 
      // werden verschiedene Punkte in dem Array points festgehalten.
      // Je nach Position zueinander sind die Punkte anders und müssen daher überprüft werden.
      // SA - Startanker; ZA - Zielanker; 

      if (from.anchor === 0) {           // SA oben (0) 
         points.push({ x: from.x, y: from.y - padding });

         if (to.anchor === 0) {         // SA oben -> ZA oben
            if (isAbove) {
               points.push({ x: from.x, y: to.y - padding });
               points.push({ x: to.x, y: to.y - padding });
            } else {
               points.push({ x: to.x, y: from.y - padding });
            }
         } else if (to.anchor === 1) {   // SA oben -> ZA rechts
            if (isAbove) {
               if (isLeft) {
                  points.push({ x: from.x, y: to.y });
               } else {
                  points.push({ x: from.x, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x + padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x + padding, y: to.y });
               }
            } else {
               if (isLeft) {
                  points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
                  points.push({ x: (from.x + to.x) / 2, y: to.y });
               } else {
                  points.push({ x: to.x + padding, y: from.y - padding });
                  points.push({ x: to.x + padding, y: to.y });
               }
            }
         } else if (to.anchor === 2) {   // SA oben -> ZA unten
            if (isAbove) {
               points.push({ x: from.x, y: (from.y + to.y) / 2 });
               points.push({ x: to.x, y: (from.y + to.y) / 2 });
            } else {
               points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
               points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
               points.push({ x: to.x, y: to.y + padding });
            }
         } else if (to.anchor === 3) {   // SA oben -> ZA links
            if (isAbove) {
               if (isLeft) {
                  points.push({ x: from.x, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x - padding, y: to.y });
               } else {
                  points.push({ x: from.x, y: to.y });
               }
            } else {
               if (isLeft) {
                  points.push({ x: to.x - padding, y: from.y - padding });
                  points.push({ x: to.x - padding, y: to.y })
               } else {
                  points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
                  points.push({ x: (from.x + to.x) / 2, y: to.y });
               }
            }
         }
      } else if (from.anchor === 1) {     // SA rechts (1)
         points.push({ x: from.x + padding, y: from.y });

         if (to.anchor === 0) {          // SA rechts -> ZA oben
            if (isAbove) {
               if (isLeft) {
                  points.push({ x: from.x + padding, y: to.y - padding });
                  points.push({ x: to.x, y: to.y - padding });
               } else {
                  points.push({ x: (from.x + to.x) / 2, y: from.y });
                  points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                  points.push({ x: to.x, y: to.y - padding });
               }
            } else {
               if (isLeft) {
                  points.push({ x: from.x + padding, y: to.y - padding });
                  points.push({ x: to.x, y: to.y - padding });
               } else {
                  points.push({ x: to.x, y: from.y });
               }
            }
         } else if (to.anchor === 1) {   // SA rechts -> ZA rechts
            if (isLeft) {
               points.push({ x: from.x + padding, y: to.y });
            } else {
               points.push({ x: to.x + padding, y: from.y });
               points.push({ x: to.x + padding, y: to.y });
            }
         } else if (to.anchor === 2) {   // SA rechts -> ZA unten 
            if (isLeft) {
               if (isAbove) {
                  points.push({ x: from.x + padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x, y: (from.y + to.y) / 2 });
               } else {
                  points.push({ x: from.x + padding, y: to.y + padding });
                  points.push({ x: to.x, y: to.y + padding });
               }
            } else {
               if (isAbove) {
                  points.push({ x: to.x, y: from.y });
               } else {
                  points.push({ x: (from.x + to.x) / 2, y: from.y });
                  points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                  points.push({ x: to.x, y: to.y + padding });
               }
            }
         } else if (to.anchor === 3) {   // SA rechts -> ZA links 
            if (isLeft) {
               points.push({ x: from.x + padding, y: (from.y + to.y) / 2 });
               points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
               points.push({ x: to.x - padding, y: to.y });
            } else {
               points.push({ x: (from.x + to.x) / 2, y: from.y });
               points.push({ x: (from.x + to.x) / 2, y: to.y });
            }
         }
      } else if (from.anchor === 2) {     // SA unten (2)
         points.push({ x: from.x, y: from.y + padding });

         if (to.anchor === 0) {          // SA unten -> ZA oben
            if (isAbove) {
               points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
               points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
               points.push({ x: to.x, y: to.y - padding });
            } else {
               points.push({ x: from.x, y: (from.y + to.y) / 2 });
               points.push({ x: to.x, y: (from.y + to.y) / 2 });
            }
         } else if (to.anchor === 1) {   // SA unten -> ZA rechts
            if (!isLeft) {
               if (isAbove) {
                  points.push({ x: to.x + padding, y: from.y + padding });
                  points.push({ x: to.x + padding, y: to.y });
               } else {
                  points.push({ x: from.x, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x + padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x + padding, y: to.y });
               }
            } else {
               if (isAbove) {
                  points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                  points.push({ x: (from.x + to.x) / 2, y: to.y });
               } else {
                  points.push({ x: from.x, y: to.y })
               }
            }
         } else if (to.anchor === 2) {   // SA unten -> ZA unten
            if (isAbove) {
               points.push({ x: to.x, y: from.y + padding });
            } else {
               points.push({ x: from.x, y: to.y + padding });
               points.push({ x: to.x, y: to.y + padding });
            }
         } else if (to.anchor === 3) {   // SA unten -> ZA links
            if (isLeft) {
               if (isAbove) {
                  points.push({ x: to.x - padding, y: from.y + padding });
                  points.push({ x: to.x - padding, y: to.y });
               } else {
                  points.push({ x: from.x, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x - padding, y: to.y });
               }
            } else {
               if (isAbove) {
                  points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                  points.push({ x: (from.x + to.x) / 2, y: to.y });
               } else {
                  points.push({ x: from.x, y: to.y })
               }
            }
         }
      } else if (from.anchor === 3) {     // SA links (3)
         points.push({ x: from.x - padding, y: from.y });
         if (to.anchor === 0) {          // SA links -> ZA oben
            if (!isLeft) {
               if (isAbove) {
                  points.push({ x: from.x - padding, y: to.y - padding });
                  points.push({ x: to.x, y: to.y - padding });
               } else {
                  points.push({ x: from.x - padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x, y: (from.y + to.y) / 2 });
               }
            } else {
               if (isAbove) {
                  points.push({ x: (from.x + to.x) / 2, y: from.y });
                  points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                  points.push({ x: to.x, y: to.y - padding });
               } else {
                  points.push({ x: to.x, y: from.y });
               }
            }
         } else if (to.anchor === 1) {   // SA links -> ZA rechts
            if (isLeft) {
               points.push({ x: (from.x + to.x) / 2, y: from.y });
               points.push({ x: (from.x + to.x) / 2, y: to.y });
            } else {
               points.push({ x: from.x - padding, y: (from.y + to.y) / 2 });
               points.push({ x: to.x + padding, y: (from.y + to.y) / 2 });
               points.push({ x: to.x + padding, y: to.y });
            }
         } else if (to.anchor === 2) {   // SA links -> ZA unten
            if (isAbove) {
               if (isLeft) {
                  points.push({ x: to.x, y: from.y });
               } else {
                  points.push({ x: from.x - padding, y: (from.y + to.y) / 2 });
                  points.push({ x: to.x, y: (from.y + to.y) / 2 });
               }
            } else {
               if (isLeft) {
                  points.push({ x: (from.x + to.x) / 2, y: from.y });
                  points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                  points.push({ x: to.x, y: to.y + padding });
               } else {
                  points.push({ x: from.x - padding, y: to.y + padding });
                  points.push({ x: to.x, y: to.y + padding });
               }
            }
         } else if (to.anchor === 3) {   // SA links -> ZA links
            if (isLeft) {
               points.push({ x: to.x - padding, y: from.y });
               points.push({ x: to.x - padding, y: to.y });
            } else {
               points.push({ x: from.x - padding, y: to.y });
            }
         }

      } else {
         // Setze keine Punkte beim temporären Pfeil oder unbekannten Anker
      }
   }

   points.push(to);

   // Setze den Stil und zeichne die Verbindung
   ctx.strokeStyle = isSelected ? '#5CACEE' : 'black'; 
   ctx.fillStyle = isSelected ? '#5CACEE' : 'black';
   ctx.lineWidth = 2;

   ctx.beginPath();
   // Zeichne gestrichelte Linien, falls noch kein Zielelement ausgewählt wurde
   points.length > 2 ? ctx.setLineDash([]) : ctx.setLineDash([5, 10]);
   ctx.moveTo(points[0].x, points[0].y);
   for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
   }
   ctx.stroke();

   // Zeichne den Pfeilkopf
   const angle = Math.atan2(to.y - points[points.length - 2].y, to.x - points[points.length - 2].x);
   ctx.beginPath();
   ctx.moveTo(to.x, to.y);
   ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
   ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
   ctx.stroke();
   ctx.fill();
   ctx.closePath();


   // Zeichne Ankerpunkte des Pfeils, wenn dieser angeklickt wurde
   if (isSelected) {
      // drawAnchorArrow(ctx, from.anchor, points[0].x, points[0].y); // Anfangspunkt nötig? Dafür benötigt man noch eine reverse drawArrow Function
      drawArrowAnchor(ctx, to.anchor, points[points.length - 1].x, points[points.length - 1].y, hoveredArrowAnchor);
   }
   
   // Gib die Eckpunkte des Pfeils zum abspeichern zurück, falls returnPoints auf true gesetzt wurde
   if (returnPoints) {
      return points;
   }
}

// Zeichne die Ankerpunkte einer Verbindung
function drawArrowAnchor(ctx: CanvasRenderingContext2D, anchor: number, x: number, y: number, hoveredArrowAnchor: boolean) {
   const drawAnchor = (x: number, y: number, radius: number) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'black'; 
      ctx.fill();
      ctx.closePath();
      ctx.font = 'bold 12px Courier New';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white'
      ctx.fillText('×', x, y);
   };
   // Falls ein Ankerpunkt gehovert wird, wird die Transparenz auf 1 gesetzt. 
   hoveredArrowAnchor ? ctx.globalAlpha = 1 : ctx.globalAlpha = 0.6;    

   const offSetAnchor = 0;

   switch (anchor) {
      case 0:
         drawAnchor(x, y - offSetAnchor, 5);
         break;
      case 1:
         drawAnchor(x + offSetAnchor, y, 5);
         break;
      case 2:
         drawAnchor(x, y + offSetAnchor, 5);
         break;
      case 3:
         drawAnchor(x - offSetAnchor, y, 5);
         break;
   }
   // Resette Einstellungen. 
   ctx.globalAlpha = 1;
   ctx.font = 'bold 16px Courier New';
};
