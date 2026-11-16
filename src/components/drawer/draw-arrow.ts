import type { SequenceStep } from "../../model/item-list";
import { GraphNode } from '../../model/graph-node';
import { Arrow } from '../../model/arrow';
import { getArrowInformation } from '../canvas/arrow-helper';
import { getAnchors } from '../canvas/anchor-helper';
import { applyGraphFont } from '../canvas/utilities';

export function drawArrow(
    ctx: CanvasRenderingContext2D,
    arrow: Arrow,
    settings: { font: string; fontSize: number; theme: string },
    isSelected: boolean = false,
    selectedSequence: SequenceStep[]
) {
    const points = generateArrowPoints(ctx, arrow);
    ctx.save();
    applyArrowStyle(ctx, isSelected, arrow, selectedSequence);

    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw the arrow head
    drawArrowHead(ctx, points[points.length - 1], points[points.length - 2]);

    if (arrow.text) {
        addArrowText(ctx, points, arrow.text, settings);
    }

    if (selectedSequence.length > 0) {
        // Draw the numbers at the computed indices.
        // Indices at which the arrow id occurs in selectedSequence.
        const indices = selectedSequence
            .map((item, index) => (item.id === arrow.id && item.type === 'arrow' ? index : -1))
            .filter((index) => index !== -1);
        indices.forEach((index, i) => {
            const midPointIndex = Math.floor(points.length / 2 - 1);
            const midPoint = {
                x: (points[midPointIndex].x + points[midPointIndex + 1].x) / 2,
                y: (points[midPointIndex].y + points[midPointIndex + 1].y) / 2,
            };

            ctx.stroke();
            ctx.font = 'bold 16px Arial';
            ctx.fillText((index + 1).toString(), midPoint.x + (i + 1) * 30, midPoint.y - i * 3);
        });
    }

    ctx.restore();
}

export function generateArrowPoints(ctx: CanvasRenderingContext2D, arrow: Arrow) {
    const fromArrowInfo = getArrowInformation(ctx, arrow.from, arrow.to, 'to');
    const toArrowInfo = getArrowInformation(ctx, arrow.to, arrow.from, 'from');

    const from = {
        x: fromArrowInfo.x,
        y: fromArrowInfo.y,
        anchor: fromArrowInfo.anchor,
    };

    const to = {
        x: toArrowInfo.x,
        y: toArrowInfo.y,
        anchor: toArrowInfo.anchor,
    };

    const padding = 15; // Space between nodes and arrow

    let points: { x: number; y: number }[] = [from];

    if (from && to) {
        // Record the positions of the nodes relative to each other
        const isAbove = to.y < from.y;
        const isLeft = to.x < from.x;

        // To draw the connection between two nodes,
        // several points are collected in the array points.
        // The points depend on the relative position, so each case is checked.
        // SA: start anchor; TA: target anchor

        if (from.anchor === 0) {
            // SA top (0)
            points.push({ x: from.x, y: from.y - padding });

            if (to.anchor === 0) {
                // SA top -> TA top
                if (isAbove) {
                    points.push({ x: from.x, y: to.y - padding });
                    points.push({ x: to.x, y: to.y - padding });
                } else {
                    points.push({ x: to.x, y: from.y - padding });
                }
            } else if (to.anchor === 1) {
                // SA top -> TA right
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
            } else if (to.anchor === 2) {
                // SA top -> TA bottom
                if (from.x === to.x && isAbove) {
                    points.push({ x: from.x + padding, y: from.y - padding });
                    points.push({ x: from.x + padding, y: to.y + padding });
                    points.push({ x: to.x + padding, y: to.y + padding });
                } else if (isAbove) {
                    points.pop();
                    points.push({ x: from.x, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x, y: (from.y + to.y) / 2 });
                } else {
                    points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
                    points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                    points.push({ x: to.x, y: to.y + padding });
                }
            } else if (to.anchor === 3) {
                // SA top -> TA left
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
                        points.push({ x: to.x - padding, y: to.y });
                    } else {
                        points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
                        points.push({ x: (from.x + to.x) / 2, y: to.y });
                    }
                }
            }
        } else if (from.anchor === 1) {
            // SA right (1)
            points.push({ x: from.x + padding, y: from.y });

            if (to.anchor === 0) {
                // SA right -> TA top
                if (isAbove) {
                    if (isLeft) {
                        points.push({ x: from.x + padding, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    } else {
                        points.pop();
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    }
                } else {
                    if (isLeft) {
                        points.push({ x: from.x + padding, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    } else {
                        points.pop();
                        points.push({ x: to.x, y: from.y });
                    }
                }
            } else if (to.anchor === 1) {
                // SA right -> TA right
                if (isLeft) {
                    points.push({ x: from.x + padding, y: to.y });
                } else {
                    points.push({ x: to.x + padding, y: from.y });
                    points.push({ x: to.x + padding, y: to.y });
                }
            } else if (to.anchor === 2) {
                // SA right -> TA bottom
                if (isLeft) {
                    if (isAbove) {
                        points.push({ x: from.x + padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x, y: (from.y + to.y) / 2 });
                    } else {
                        points.push({ x: from.x + padding, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    }
                } else {
                    points.pop();
                    if (isAbove) {
                        points.push({ x: to.x, y: from.y });
                    } else {
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    }
                }
            } else if (to.anchor === 3) {
                // SA right -> TA left
                if (from.y === to.y && isLeft) {
                    points.push({ x: from.x + padding, y: from.y + padding });
                    points.push({ x: to.x - padding, y: from.y + padding });
                    points.push({ x: to.x - padding, y: to.y });
                } else if (isLeft) {
                    points.push({ x: from.x + padding, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x - padding, y: to.y });
                } else {
                    points.pop();
                    points.push({ x: (from.x + to.x) / 2, y: from.y });
                    points.push({ x: (from.x + to.x) / 2, y: to.y });
                }
            }
        } else if (from.anchor === 2) {
            // SA bottom (2)
            points.push({ x: from.x, y: from.y + padding });

            if (to.anchor === 0) {
                // SA bottom -> TA top
                if (from.x === to.x && isAbove) {
                    points.push({ x: from.x + padding, y: from.y + padding });
                    points.push({ x: to.x + padding, y: to.y - padding });
                    points.push({ x: to.x, y: to.y - padding });
                } else if (isAbove) {
                    points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                    points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                    points.push({ x: to.x, y: to.y - padding });
                } else {
                    points.pop();
                    points.push({ x: from.x, y: (from.y + to.y - 7) / 2 });
                    points.push({ x: to.x, y: (from.y + to.y - 7) / 2 });
                }
            } else if (to.anchor === 1) {
                // SA bottom -> TA right
                if (!isLeft) {
                    if (isAbove) {
                        points.push({ x: to.x + padding, y: from.y + padding });
                        points.push({ x: to.x + padding, y: to.y });
                    } else {
                        points.pop();
                        points.push({ x: from.x, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x + padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x + padding, y: to.y });
                    }
                } else {
                    if (isAbove) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                        points.push({ x: (from.x + to.x) / 2, y: to.y });
                    } else {
                        points.pop();
                        points.push({ x: from.x, y: to.y });
                    }
                }
            } else if (to.anchor === 2) {
                // SA bottom -> TA bottom
                if (to.x === from.x && !isAbove) {
                    points.push({ x: from.x, y: to.y - 55 });
                    points.push({ x: from.x + padding, y: to.y - 55 });
                    points.push({ x: from.x + padding, y: to.y + padding });
                    points.push({ x: from.x, y: to.y + padding });
                    points.push({ x: to.x, y: to.y + padding });
                } else if (to.x === from.x && isAbove) {
                    points.push({ x: from.x + padding, y: from.y + padding });
                    points.push({ x: from.x + padding, y: from.y - 55 });
                    points.push({ x: from.x, y: from.y - 55 });
                } else if (isAbove) {
                    points.push({ x: to.x, y: from.y + padding });
                } else {
                    points.push({ x: from.x, y: to.y + padding });
                    points.push({ x: to.x, y: to.y + padding });
                }
            } else if (to.anchor === 3) {
                // SA bottom -> TA left
                if (isLeft) {
                    if (isAbove) {
                        points.push({ x: to.x - padding, y: from.y + padding });
                        points.push({ x: to.x - padding, y: to.y });
                    } else {
                        points.pop();
                        points.push({ x: from.x, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x - padding, y: to.y });
                    }
                } else {
                    if (isAbove) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                        points.push({ x: (from.x + to.x) / 2, y: to.y });
                    } else {
                        points.pop();
                        points.push({ x: from.x, y: to.y });
                    }
                }
            }
        } else if (from.anchor === 3) {
            // SA left (3)
            points.push({ x: from.x - padding, y: from.y });
            if (to.anchor === 0) {
                // SA left -> TA top
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
                        points.pop();
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    } else {
                        points.pop();
                        points.push({ x: to.x, y: from.y });
                    }
                }
            } else if (to.anchor === 1) {
                // SA left -> TA right
                if (from.y === to.y && !isLeft) {
                    points.push({ x: from.x - padding, y: from.y + padding });
                    points.push({ x: to.x + padding, y: from.y + padding });
                    points.push({ x: to.x + padding, y: from.y });
                } else if (isLeft) {
                    points.pop();
                    points.push({ x: (from.x + to.x) / 2, y: from.y });
                    points.push({ x: (from.x + to.x) / 2, y: to.y });
                } else {
                    points.push({ x: from.x - padding, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x + padding, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x + padding, y: to.y });
                }
            } else if (to.anchor === 2) {
                // SA left -> TA bottom
                if (isAbove) {
                    if (isLeft) {
                        points.pop();
                        points.push({ x: to.x, y: from.y });
                    } else {
                        points.push({ x: from.x - padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x, y: (from.y + to.y) / 2 });
                    }
                } else {
                    if (isLeft) {
                        points.pop();
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    } else {
                        points.push({ x: from.x - padding, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    }
                }
            } else if (to.anchor === 3) {
                // SA left -> TA left
                if (isLeft) {
                    points.push({ x: to.x - padding, y: from.y });
                    points.push({ x: to.x - padding, y: to.y });
                } else {
                    points.push({ x: from.x - padding, y: to.y });
                }
            }
        } else {
            // Set no points for the temporary arrow or an unknown anchor
        }
    }

    points.push(to);
    return points;
}

function applyArrowStyle(ctx: CanvasRenderingContext2D, isSelected: boolean, arrow: Arrow, selectedSequence: SequenceStep[]) {
    ctx.strokeStyle = isSelected ? '#5CACEE' : 'black';
    ctx.fillStyle = isSelected ? '#5CACEE' : 'black';
    ctx.lineWidth = 2;
    const isArrowIdInSelectedSequence = selectedSequence.some((item) => item.id === arrow.id && item.type === 'arrow');
    if (isArrowIdInSelectedSequence) {
        ctx.strokeStyle = '#990000';
        ctx.fillStyle = '#990000';
    }
}

function drawArrowHead(
    ctx: CanvasRenderingContext2D,
    toPoint: { x: number; y: number },
    prevPoint: { x: number; y: number }
) {
    const headLength = 7;
    const angle = Math.atan2(toPoint.y - prevPoint.y, toPoint.x - prevPoint.x);
    ctx.beginPath();
    ctx.moveTo(toPoint.x, toPoint.y);
    ctx.lineTo(
        toPoint.x - headLength * Math.cos(angle - Math.PI / 6),
        toPoint.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toPoint.x - headLength * Math.cos(angle + Math.PI / 6),
        toPoint.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function addArrowText(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    text: string,
    settings: { font: string; fontSize: number; theme: string }
) {
    const midPointIndex = Math.floor(points.length / 2 - 0.5);
    const midPoint = {
        x: (points[midPointIndex].x + points[midPointIndex + 1].x) / 2,
        y: (points[midPointIndex].y + points[midPointIndex + 1].y) / 2,
    };

    ctx.save();
    applyGraphFont(ctx, settings);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(midPoint.x, midPoint.y);
    ctx.fillStyle = 'white';
    ctx.fillRect(-ctx.measureText(text).width / 2 - 5, -10, ctx.measureText(text).width + 10, 18);
    ctx.fillStyle = 'black';
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

// Draw the anchor points of a connection
export function drawArrowAnchor(
    ctx: CanvasRenderingContext2D,
    arrow: Arrow,
    ishovered: boolean,
    settings: { font: string; fontSize: number; theme: string }
) {
    const arrowInfo = getArrowInformation(ctx, arrow.to, arrow.from, 'from');
    const x = arrowInfo.x;
    const y = arrowInfo.y;

    const drawAnchor = (x: number, y: number, radius: number) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
        ctx.font = 'bold 12px Courier New';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText('×', x, y);
    };
    // A hovered anchor is drawn fully opaque.
    ishovered ? (ctx.globalAlpha = 1) : (ctx.globalAlpha = 0.6);

    drawAnchor(x, y, 5);

    // Reset settings.
    ctx.globalAlpha = 1;

    applyGraphFont(ctx, settings);
}

export function drawTempArrow(
    ctx: CanvasRenderingContext2D,
    arrowStart: { node: GraphNode; anchor: number },
    tempArrowEnd: { x: number; y: number }
) {
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
    ctx.setLineDash([]);
}
