import { Arrow } from "../../definitions/Arrow";
import { GraphNode } from "../../definitions/GraphNode";

// Erzeuge die Verbindungen anhand der gegebenen Knoten 
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
                  points: [], // Initialisiere points als leeres Array, wird später in drawArrow aktualisiert
                  text: connection.text,
               });
            }
         });
      }
   });

   return arrows;
}
