import { GraphNode } from "../../model/graph-node";
import { Arrow } from "../../model/arrow";
import { getNearestCircle } from "../canvas/anchor-helper";
import { generateArrowPoints } from "../drawer/draw-arrow";
import { findLastGraphNode } from "../canvas/utilities";

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
  
  const newArrowID = crypto.randomUUID();

  // A target node was found and differs from the start node
  if (arrowStart && targetElement && arrowStart.node !== targetElement && targetElement.node !== 'text') {
    // Store the arrow connection on the start node
    if (!arrowStart.node.connections) {
      arrowStart.node.connections = [];
    }
    arrowStart.node.connections.push({ anchor: arrowStart.anchor, direction: 'to', connectedToId: targetElement.id, arrowID: newArrowID });

    // Store the arrow connection on the target node
    if (!targetElement.connections) {
      targetElement.connections = [];
    }
    const nearestCircleIndex = getNearestCircle(ctx, { x, y }, targetElement);
    targetElement.connections.push({ anchor: nearestCircleIndex, direction: 'from', connectedToId: arrowStart.node.id,  arrowID: newArrowID });

    const newArrow: Arrow = { id: newArrowID, from: arrowStart.node, to: targetElement, points: [] };
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