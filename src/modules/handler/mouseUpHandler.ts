import { GraphNode } from "../../domain/GraphNode";
import { Arrow } from "../../domain/Arrow";
import { getNearestCircle } from "../helper/anchorHelper";
import { generateArrowPoints } from "../drawer/drawArrow";
import { findLastGraphNode } from "../helper/utilities";
import { v4 as uuidv4 } from 'uuid';

export function handleGrabRelease() {
   return {
     grabStartPosition: undefined,
     grabStartOffset: undefined,
   };
 }
 
 export function handleNodeDragStop() {
   return {
     isDragging: false,
   };
 }
 
 export function handleArrowCreation(
   ctx: CanvasRenderingContext2D,  x: number, y: number, 
   arrowStart: { node: GraphNode; anchor: number } | undefined,
   graphNodes: GraphNode[], arrows: Arrow[]
 ) {
   const targetElement = findLastGraphNode(ctx, graphNodes, x, y);
 
   // Überprüft ob ein Zielelement gefunden wurde und dieser ungleich dem Startelement
   if (arrowStart && targetElement && arrowStart.node !== targetElement && targetElement.node !== 'text') {
     // Speichere die Pfeilverbindung am Startelement
     if (!arrowStart.node.connections) {
       arrowStart.node.connections = [];
     }
     arrowStart.node.connections.push({ anchor: arrowStart.anchor, direction: 'to', connectedToId: targetElement.id });
 
     // Speichere die Pfeilverbindung am Ziel-Element
     if (!targetElement.connections) {
       targetElement.connections = [];
     }
     const nearestCircleIndex = getNearestCircle(ctx, { x, y }, targetElement);
     targetElement.connections.push({ anchor: nearestCircleIndex, direction: 'from', connectedToId: arrowStart.node.id });
 
     // Erstelle die Pfeilpunkte und speichere die Pfeilverbindung
     const points = generateArrowPoints(ctx, arrowStart.node, targetElement);
     arrows.push({ id: uuidv4(), from: arrowStart.node, to: targetElement, points });
   }
 
   return {
     tempArrowEnd: undefined,
     arrowStart: undefined,
     arrows,
   };
 }