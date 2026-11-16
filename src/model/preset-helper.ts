import { Arrow } from "./arrow";
import { GraphNode } from "./graph-node";

// Build the arrows from the connections of the given nodes
export function createArrowsFromGraphNodes(arrows: Arrow[], graphNodes: GraphNode[]): Arrow[] {
   arrows = [];

   graphNodes.forEach((fromElement) => {
      if (fromElement.connections) {
         fromElement.connections.forEach((connection) => {
            const toElement = graphNodes.find((element) => element.id === connection.connectedToId);

            if (toElement && connection.direction === 'to') {
               arrows.push({
                  id: connection.arrowID,
                  from: fromElement,
                  to: toElement,
                  points: [], // Filled later by drawArrow
                  text: connection.text,
               });
            }
         });
      }
   });

   return arrows;
}

/**
 * Point the arrows at the current node instances (matched by `id`).
 * Safe to call after nodes were added, removed or replaced.
 */
export function reconnectArrows(arrows: Arrow[], graphNodes: GraphNode[]) {
   arrows.forEach((arrow) => {
      const fromNode = graphNodes.find((node) => node.id === arrow.from.id);
      const toNode = graphNodes.find((node) => node.id === arrow.to.id);

      if (fromNode && toNode) {
         arrow.from = fromNode;
         arrow.to = toNode;
      }
   });
}
