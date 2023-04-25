/**
 * Handler Funktionen, die die verschieden Funktionalitäten der Click-Events übernehmen
 */

import { GraphNode, Arrow } from "./definitions";
import { findLastGraphNode, findArrow } from "./helper";

export function handleSequenceSelection(
   ctx: CanvasRenderingContext2D,
   selectedSequence: {
      id: string;
      order: number;
      type: string;
   }[],
   graphNodes: GraphNode[],
   arrows: Arrow[],
   x: number,
   y: number
) {
   const clickedNode = findLastGraphNode(ctx, graphNodes, x, y);
   const clickedArrow = findArrow(arrows, x, y);
   let clickedItem: GraphNode | Arrow;
   let sequenceType: string;

   if (clickedNode) {
      clickedItem = clickedNode;
      sequenceType = 'node';
   } else if (clickedArrow) {
      clickedItem = clickedArrow;
      sequenceType = 'arrow';
   }

   if (clickedItem) {
      const existingIndex = selectedSequence.findIndex(
         (item) => item.id === clickedItem.id && item.type === sequenceType
      );
      const lastIndex = selectedSequence.length - 1;
      const lastItemType = lastIndex >= 0 ? selectedSequence[lastIndex].type : null;

      if (existingIndex === -1) {
         if (lastItemType !== sequenceType) {
            selectedSequence.push({
               id: clickedItem.id,
               order: selectedSequence.length + 1,
               type: sequenceType,
            });
         }
      } else if (existingIndex === lastIndex) {
         selectedSequence.pop();
      } else if (lastItemType !== sequenceType) {
         selectedSequence.push({
            id: clickedItem.id,
            order: selectedSequence.length + 1,
            type: sequenceType,
         });
      }
   }
}