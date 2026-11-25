import { GraphNode } from '../../model/graph-node';
import { Arrow } from '../../model/arrow';
import { findLastGraphNode } from '../canvas/utilities';
import { findArrow } from '../canvas/arrow-helper';

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
    const clicked = clickedNode ?? clickedArrow;
    const sequenceType = clickedNode ? 'node' : 'arrow';

    if (!clicked) {
        return;
    }

    const clickedItem: GraphNode | Arrow = clicked;

    selectedSequence.push({
        id: clickedItem.id,
        order: selectedSequence.length + 1,
        type: sequenceType,
    });
}
