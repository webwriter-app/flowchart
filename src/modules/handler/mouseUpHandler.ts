import { GraphNode } from "../../definitions/GraphNode";
import { Arrow } from "../../definitions/Arrow";
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
  ctx: CanvasRenderingContext2D, x: number, y: number,
  arrowStart: { node: GraphNode; anchor: number } | undefined,
  graphNodes: GraphNode[], arrows: Arrow[]
) {
  const targetElement = findLastGraphNode(ctx, graphNodes, x, y);
  
  const newArrowID = uuidv4();

  // Überprüft ob ein Zielelement gefunden wurde und dieser ungleich dem Startelement
  if (arrowStart && targetElement && arrowStart.node !== targetElement && targetElement.node !== 'text') {
    // Speichere die Pfeilverbindung am Startelement
    if (!arrowStart.node.connections) {
      arrowStart.node.connections = [];
    }
    arrowStart.node.connections.push({ anchor: arrowStart.anchor, direction: 'to', connectedToId: targetElement.id, arrowID: newArrowID });

    // Speichere die Pfeilverbindung am Ziel-Element
    if (!targetElement.connections) {
      targetElement.connections = [];
    }
    const nearestCircleIndex = getNearestCircle(ctx, { x, y }, targetElement);
    targetElement.connections.push({ anchor: nearestCircleIndex, direction: 'from', connectedToId: arrowStart.node.id,  arrowID: newArrowID });

    const newArrow = { id: newArrowID, from: arrowStart.node, to: targetElement, points: [] };
    const points = generateArrowPoints(ctx, newArrow);
    newArrow.points = points;
    arrows.push(newArrow);
  }

  return {
    tempArrowEnd: undefined,
    arrowStart: undefined,
    arrows,
  };
}