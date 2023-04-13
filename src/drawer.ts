import { GraphNodeData } from './definitions';
import { measureTextSize, getAnchors } from './helper';

/*
*   Hier finden sich die Funktionen zum Zeichnen auf dem Canvas 
*/

// -------------------- SVG Grafiken für die Buttons --------------------

export function drawButtonElement(element: string, menu: 'flow' | 'tool' | 'task') {
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
            width: '120',
            height: '55',
         });
         setAttributeList(text, {
            x: '60',
            y: '35',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '14',
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
      default:
         console.log('Unbekanntes Menü');
   }

   switch (element) {
      case 'start':
      case 'end':
         const terminal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(terminal, {
            x: '10',
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
            x: '10',
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
            points: '60,5 120,27 60,50 0,27',
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
            cx: '60',
            cy: '30',
            r: '10',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(connector);
         break;
      case 'text':
         text.textContent = 'Text';
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
      case 'addTask':
         setAttributeList(text, {
            x: '120',
            y: '20',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Aufgabe Hinzufügen';
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
         ctx.fillStyle = '#FF6A6A';
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
         // ctx.fillRect(x, y, width, height);
         const r = 5; // Radius der abgerundeten Ecken
         ctx.beginPath();
         ctx.moveTo(x + r, y);
         ctx.lineTo(x + width - r, y);
         ctx.quadraticCurveTo(x + width, y, x + width, y + r);
         ctx.lineTo(x + width, y + height - r);
         ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
         ctx.lineTo(x + r, y + height);
         ctx.quadraticCurveTo(x, y + height, x, y + height - r);
         ctx.lineTo(x, y + r);
         ctx.quadraticCurveTo(x, y, x + r, y);
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
         ctx.fillStyle = '#778899';
         // Zeichne einen Kreis
         const circleRadius = Math.min(width, height) / 3;
         ctx.beginPath();
         ctx.arc(x + width / 2, y + height / 2, circleRadius, 0, 2 * Math.PI);
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
   ctx.fillText(text, x + 10, y + (height / 2) + 5);


   // Hervorhebung eines ausgewählten Knoten
   if (selectedElement === element) {
      ctx.strokeStyle = '#87cefa';
      ctx.setLineDash([5, 10]);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
   }
}

export function drawElementAnchors(ctx: CanvasRenderingContext2D, element: GraphNodeData, d: number = 20) {
   if (element.node !== 'text') {
      ctx.fillStyle = '#87cefa';
      const anchors = getAnchors(ctx, element, d);

      // Zeichne die Ankerpunkte
      anchors.forEach((position, index) => {
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
export function drawArrow(ctx: CanvasRenderingContext2D, from: { x: number; y: number; anchor?: number }, to: { x: number; y: number; anchor?: number }, isSelected: boolean = false, returnPoints = false) {

   const headLength = 7;
   const padding = 10; // Raum zwischen Elementen und Pfeil

   let points: { x: number; y: number }[] = [from];

   if (from && to) {

      // Halte die Positionen der Knoten zueinander fest
      const isAbove = to.y < from.y;
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
   ctx.strokeStyle = isSelected ? '#87cefa' : 'black';
   ctx.fillStyle = isSelected ? '#87cefa' : 'black';
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
      drawArrowAnchor(ctx, to.anchor, points[points.length - 1].x, points[points.length - 1].y);
   }

   // Gib die Eckpunkte des Pfeils zum abspeichern zurück, falls returnPoints auf true gesetzt wurde
   if (returnPoints) {
      return points;
   }
}

// Zeichne die Ankerpunkte einer Verbindung
function drawArrowAnchor(ctx: CanvasRenderingContext2D, anchor: number, x: number, y: number) {
   const drawAnchor = (x: number, y: number, radius: number) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#3CB371';
      ctx.fill();
      ctx.closePath();
   };

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
};
