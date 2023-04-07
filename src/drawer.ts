import { GraphNodeData } from "./definitions";
import { measureTextSize, getAnchors } from "./helper";

/*
*   Hier finden sich die Funktionen zum Zeichnen auf dem Canvas 
*/

// -------------------- SVG Grafiken für die Buttons --------------------

export function drawSvgElement(element: string) {
   // Funktion zum übersichtlichen setzen der Attribute der SVG Grafiken 
   function setAttributeList(element: SVGElement, attributes: { [key: string]: string }): void {
      for (const key in attributes) {
         element.setAttribute(key, attributes[key]);
      }
   }

   const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
   setAttributeList(svg, {
      width: "120",
      height: "55",
   });

   // Erzeuge den Text
   const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
   setAttributeList(text, {
      x: "60",
      y: "35",
      fill: "white",
      "text-anchor": "middle",
      "font-size": "14",
      "font-family": "Arial"
   });
   svg.appendChild(text);

   switch (element) {
      case 'start':
      case 'end':
         const terminal = document.createElementNS("http://www.w3.org/2000/svg", "rect");
         setAttributeList(terminal, {
            x: "10",
            y: "15",
            width: "100",
            height: "30",
            rx: "15",
            ry: "15",
            fill: "none",
            stroke: "white",
            'stroke-width': "2"
         });
         svg.appendChild(terminal);
         element === 'start' ? text.textContent = "Start" : text.textContent = "Ende";
         break;
      case 'op':
         const operation = document.createElementNS("http://www.w3.org/2000/svg", "rect");
         setAttributeList(operation, {
            x: "10",
            y: "15",
            width: "100",
            height: "30",
            fill: "none",
            stroke: "white",
            'stroke-width': "2"
         });
         svg.appendChild(operation);
         text.textContent = "Operation";
         break;
      case 'decision':
         const decision = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
         setAttributeList(decision, {
            points: "60,2 120,25 60,48 0,25",
            fill: "none",
            stroke: "white",
            'stroke-width': "2"
         });
         svg.appendChild(decision);
         text.textContent = "Verzweigung";
         text.setAttribute("y", "30");
         break;
      case 'connector':
         const connector = document.createElementNS("http://www.w3.org/2000/svg", "circle");
         setAttributeList(connector, {
            cx: "60",
            cy: "30",
            r: "10",
            fill: "none",
            stroke: "white",
            'stroke-width': "2"
         });
         svg.appendChild(connector);
         break;
      case 'text':
         text.textContent = "Text";
         break;
      case 'delete':
         // Erzeuge den Mülleimer
         // TODO
         text.textContent = "Lösche alles";
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
         ctx.fillStyle = "#FF6A6A";
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
         ctx.fillStyle = "#FFEC8B";
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
         ctx.fillStyle = "#4F94CD";
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
         ctx.fillStyle = "#778899";
         // Zeichne einen Kreis
         const circleRadius = Math.min(width, height) / 3;
         ctx.beginPath();
         ctx.arc(x + width / 2, y + height / 2, circleRadius, 0, 2 * Math.PI);
         ctx.fill();
         break;
      default:
         ctx.fillStyle = "";
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

   const headLength = 8;
   const padding = 15; // Raum zwischen Elementen und Pfeil

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
               if(isAbove) {
                  points.push({ x: to.x + padding, y: from.y + padding });
                  points.push({ x: to.x + padding, y: to.y });
               } else {
                  points.push({ x: from.x, y: (from.y + to.y) / 2  });
                  points.push({ x: to.x + padding, y: (from.y + to.y) / 2  });
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
   const drawAnchor = (x: number, y: number, radius: number ) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#3CB371';
      ctx.fill();
      ctx.closePath();
   };

   const offSetAnchor = 0;

   switch (anchor) {
      case 0:
         drawAnchor(x, y - offSetAnchor, 5 );
         break;
      case 1:
         drawAnchor(x + offSetAnchor, y, 5 );
         break;
      case 2:
         drawAnchor(x, y + offSetAnchor, 5 );
         break;
      case 3:
         drawAnchor(x - offSetAnchor, y, 5 );
         break;
   }
};
