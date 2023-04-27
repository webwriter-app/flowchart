import { GraphNode } from "../../domain/GraphNode";
import { getArrowInformation } from "../helper/arrowHelper";
import { getAnchors } from "../helper/anchorHelper";

export function drawArrow(ctx: CanvasRenderingContext2D, from: GraphNode, to: GraphNode, isSelected: boolean = false, text?: string) {
 
   const points = generateArrowPoints(ctx, from, to);
   applyArrowStyle(ctx, isSelected);

   ctx.beginPath();
   ctx.setLineDash([])
   ctx.moveTo(points[0].x, points[0].y);
   for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
   }
   ctx.stroke();

   // Zeichne den Pfeilkopf
   drawArrowHead(ctx, points[points.length - 1], points[points.length - 2]);

   if (text) {
      addArrowText(ctx, points, text);
   }

   //Hervorhebung der ausgewählten Sequenz und Anzeige des Counters
   // const sequenceIndex = selectedSequence.findIndex((item) => item.type === 'node');
   // if (sequenceIndex !== -1) {
   //    ctx.save();
   //    ctx.strokeStyle = 'gold';
   //    ctx.lineWidth = 4;
   //    ctx.stroke();

   //    ctx.fillStyle = 'gold';
   //    ctx.font = 'bold 16px Arial';
   //    ctx.fillText(
   //       selectedSequence[sequenceIndex].order.toString(),
   //       x + width + 8,
   //       y - 5
   //    );
   //    ctx.restore();
   //}
}

export function generateArrowPoints(ctx: CanvasRenderingContext2D, fromNode: GraphNode, toNode: GraphNode) {
   const fromArrowInfo = getArrowInformation(ctx, fromNode, toNode);
   const toArrowInfo = getArrowInformation(ctx, toNode, fromNode);
   
   const from = {
      x: fromArrowInfo.x,
      y: fromArrowInfo.y,
      anchor: fromArrowInfo.anchor
   };

   const to = {
      x: toArrowInfo.x,
      y: toArrowInfo.y,
      anchor: toArrowInfo.anchor
   };

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
   return points;
}

export function applyArrowStyle(ctx: CanvasRenderingContext2D, isSelected: boolean) {
   ctx.strokeStyle = isSelected ? '#5CACEE' : 'black';
   ctx.fillStyle = isSelected ? '#5CACEE' : 'black';
   ctx.lineWidth = 2;
}

function drawArrowHead(ctx: CanvasRenderingContext2D, toPoint: { x: number; y: number }, prevPoint: { x: number; y: number }) {
   const headLength = 7;
   const angle = Math.atan2(toPoint.y - prevPoint.y, toPoint.x - prevPoint.x);
   ctx.beginPath();
   ctx.moveTo(toPoint.x, toPoint.y);
   ctx.lineTo(toPoint.x - headLength * Math.cos(angle - Math.PI / 6), toPoint.y - headLength * Math.sin(angle - Math.PI / 6));
   ctx.lineTo(toPoint.x - headLength * Math.cos(angle + Math.PI / 6), toPoint.y - headLength * Math.sin(angle + Math.PI / 6));
   ctx.stroke();
   ctx.fill();
   ctx.closePath();
 }

function addArrowText(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], text: string) {
   const midPointIndex = Math.floor(points.length / 2 - 0.5);
   const midPoint = {
     x: (points[midPointIndex].x + points[midPointIndex + 1].x) / 2,
     y: (points[midPointIndex].y + points[midPointIndex + 1].y) / 2,
   };
 
   ctx.save();
   ctx.font = 'bold 16px Courier New';
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   ctx.translate(midPoint.x, midPoint.y);
   ctx.fillStyle = 'white';
   ctx.fillRect(-ctx.measureText(text).width / 2 - 4, -8, ctx.measureText(text).width + 8, 16);
   ctx.fillStyle = 'black';
   ctx.fillText(text, 0, 0);
   ctx.restore();
 }

// Zeichne die Ankerpunkte einer Verbindung
export function drawArrowAnchor(ctx: CanvasRenderingContext2D, anchor: number, x: number, y: number, ishovered: boolean) {
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
   ishovered ? ctx.globalAlpha = 1 : ctx.globalAlpha = 0.6;    

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

export function drawTempArrow(ctx: CanvasRenderingContext2D, arrowStart: { node: GraphNode; anchor: number }, tempArrowEnd?: { x: number; y: number }) {
   const arrowAnchors = getAnchors(ctx, arrowStart.node);
   const startPoint = arrowAnchors[arrowStart.anchor];
   const endPoint = tempArrowEnd;

   ctx.beginPath();
   ctx.fillStyle = 'black';
   ctx.setLineDash([5, 10]);
   ctx.moveTo(startPoint.x, startPoint.y);
   ctx.lineTo(endPoint.x, endPoint.y);
   ctx.stroke();
   drawArrowHead(ctx, endPoint, startPoint);
   ctx.setLineDash([])
}
