import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import type { GraphNode } from '../../model/graph-node';
import { distanceBetween, midpointOf, type Point } from '../../model/geometry';
import { handleNodeDragStart, handleArrowDragStart, handleMultipleNodesDragStart } from '../handler/mouse-down-handler';
import { handleGrabRelease, handleNodeDragStop, handleArrowCreation } from '../handler/mouse-up-handler';
import { handleSequenceSelection } from '../handler/handle-sequence-selection';
import { handleGraphNodeDoubleClick, handleArrowDoubleClick } from '../handler/double-click-handler';
import { snapNodePosition, isNodeInRectangle, findLastGraphNode, findGraphNodeLastIndex } from './utilities';
import { isArrowClicked } from './arrow-helper';
import { getAnchors, highlightAnchor } from './anchor-helper';

/**
 * @internal Pointer input of the flowchart canvas: mouse, touch and pen. It owns the
 * transient interaction state (drag, arrow drawing, selection box, pinch, long press,
 * double tap) and works on the nodes, arrows and selection of the widget it serves.
 */
export class CanvasPointer {
    constructor(private host: WebwriterFlowchart) {}

    /** @internal Drag state. */
    isDragging = false;
    /** @internal Node currently being dragged. */
    draggedNode?: GraphNode;
    /** @internal Drag offset from the pointer to node origin. */
    dragOffset = { x: 0, y: 0 };
    /** @internal Group drag: the set of nodes being dragged. */
    draggedNodes: GraphNode[] = [];

    /** @internal Arrow drawing state. */
    isDrawingArrow = false;
    /** @internal Arrow start anchor. */
    arrowStart?: { node: GraphNode; anchor: number };
    /** @internal Temporary arrow endpoint while dragging. */
    tempArrowEnd?: { x: number; y: number };

    /** @internal Currently active pointers on the canvas (id → last screen position). Drives multi-touch gestures. */
    activePointers = new Map<number, { x: number; y: number }>();

    /** @internal Type of the most recent pointer ("mouse" | "touch" | "pen"). Used to enlarge hit targets for touch. */
    lastPointerType: string = 'mouse';

    /** @internal Active two-finger pinch/pan gesture state (zoom + pan around the finger midpoint). */
    pinchState?: { startDist: number; startZoom: number; lastMidX: number; lastMidY: number };

    /** @internal Blocks single-pointer handling for leftover fingers after a multi-touch gesture. */
    suppressSinglePointer = false;

    /** @internal Pending long-press timer; opens the context menu on touch devices. */
    longPressTimer?: ReturnType<typeof setTimeout>;

    /** @internal Viewport position where the current long-press candidate started. */
    longPressOrigin?: { x: number; y: number };

    /** @internal Delay before a stationary touch counts as a long press (ms). */
    static readonly LONG_PRESS_DELAY = 500;

    /** @internal Movement (px) that cancels a long press, tolerating natural finger jitter. */
    static readonly LONG_PRESS_MOVE_TOLERANCE = 10;

    /** @internal Swallows the synthetic click after a long press, which would close the menu again. */
    suppressNextClick = false;

    /** @internal Viewport position where the current single-pointer contact started. */
    singlePointerStart?: { x: number; y: number };

    /** @internal Timestamp of the last recognised tap, for double-tap detection (0 = none). */
    lastTapTime = 0;

    /** @internal Viewport position of the last recognised tap. */
    lastTapPosition?: { x: number; y: number };

    /** @internal Maximum gap between two taps to count as a double tap (ms). */
    static readonly DOUBLE_TAP_DELAY = 300;

    /** @internal Maximum distance between two taps to count as a double tap (px). */
    static readonly DOUBLE_TAP_DISTANCE = 25;

    /**
     * @internal Swallows a native `dblclick` that a browser may emit in addition to the
     * double tap we already handled ourselves, so the edit prompt does not open twice.
     */
    suppressNativeDoubleClick = false;

    /** @internal Start pointer position for grab. */
    grabStartPosition?: { x: number; y: number };
    /** @internal Start offset for grab. */
    grabStartOffset?: { x: number; y: number };

    /** @internal Currently hovered anchor on a node. */
    hoveredAnchor?: { element: GraphNode; anchor: number };
    /** @internal Whether an arrow anchor is hovered. */
    isArrowAnchorHovered = false;


    /** @internal Selection rectangle during drag-select. */
    selectionRectangle?: { x: number; y: number; width: number; height: number };

    /** @internal One-time offset gate for multi-drag. */
    checkOffset = true;


    /**
     * Display the context menu near the pointer when the user right-clicks a node or arrow (only in editable mode).
     *
     * @param {MouseEvent} event
     * @returns {void}
     * @internal
     */
    showContextMenu(event: MouseEvent) {
        this.openContextMenuAt(event.clientX, event.clientY);
    }

    /**
     * Open the context menu for the node or arrow at a viewport position (only in editable mode).
     *
     * @param {number} clientX - Viewport X position.
     * @param {number} clientY - Viewport Y position.
     * @returns {boolean} True if an element was hit and the menu was opened.
     * @internal
     */
    openContextMenuAt(clientX: number, clientY: number): boolean {
        if ((!this.host.allowStudentEdit && !this.host.isEditable())) {
            return false;
        }

        const rect = this.host.getBoundingClientRect()
        const { x, y } = this.host.view.getCanvasCoordinates(clientX, clientY);

        // Find the clicked node or connection and keep it
        const clickedNode = findLastGraphNode(this.host.ctx, this.host.graphNodes, x, y);
        const clickedArrowIndex = this.host.arrows.findIndex((arrow) =>
            isArrowClicked(x, y, arrow.points, this.arrowHitTolerance)
        );

        // If an element was clicked, show the context menu
        if (clickedNode || clickedArrowIndex !== -1) {
            this.host.contextMenuAt = { x: clientX - rect.left, y: clientY - rect.top };

            if (clickedNode) {
                this.host.selectedNode = clickedNode;
                this.host.selectedArrow = undefined;
            } else {
                this.host.selectedArrow = this.host.arrows[clickedArrowIndex];
                this.host.selectedNode = undefined;
            }
            this.host.view.redrawCanvas();
            return true;
        }
        return false;
    }

    /** @internal Hit tolerance for arrows; widened for touch so thin lines stay tappable. */
    get arrowHitTolerance(): number {
        return this.lastPointerType === 'touch' ? 16 : 8;
    }


    // ------------------------ Pointer-Events (mouse / touch / pen) ------------------------

    /**
     * @internal Unified pointer entry point. Tracks every active pointer so that
     * multi-touch gestures (two-finger pinch-zoom and pan) can be distinguished
     * from single-pointer interactions (drag, arrow creation, selection).
     */
    handlePointerDown = (event: PointerEvent) => {
        this.lastPointerType = event.pointerType;

        if (this.activePointers.size === 0) {
            this.suppressNextClick = false;
            this.suppressNativeDoubleClick = false;
            this.singlePointerStart = { x: event.clientX, y: event.clientY };
        }

        this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        // Start pinch gesture if two fingers are down, cancel any single-pointer interaction
        if (this.activePointers.size === 2) {
            this.cancelLongPress();
            this.cancelSinglePointerInteraction();
            this.suppressSinglePointer = true;
            this.beginPinch();
            return;
        }
        // Ignore more than two fingers
        if (this.activePointers.size > 2) {
            return;
        }

        try {
            this.host.canvas.setPointerCapture(event.pointerId);
        } catch (e) { }

        if (event.pointerType !== 'mouse') {
            this.startLongPress(event.clientX, event.clientY);
        }

        this.handleMouseDown(event);
    }

    /** @internal Unified pointer move: routes to the pinch gesture or the single-pointer logic. */
    handlePointerMove = (event: PointerEvent) => {
        if (this.activePointers.has(event.pointerId)) {
            this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        }

        if (this.longPressOrigin) {
            const moved = distanceBetween({ x: event.clientX, y: event.clientY }, this.longPressOrigin);
            if (moved > CanvasPointer.LONG_PRESS_MOVE_TOLERANCE) {
                this.cancelLongPress();
            }
        }

        if (this.pinchState && this.activePointers.size >= 2) {
            this.updatePinch();
            return;
        }

        // Leftover fingers from a multi-touch gesture must not resume a stale interaction
        if (this.suppressSinglePointer || this.activePointers.size > 1) {
            return;
        }

        this.handleMouseMove(event);
    }

    /** @internal Unified pointer up: finalizes a gesture or the single-pointer interaction. */
    handlePointerUp = (event: PointerEvent) => {
        this.cancelLongPress();
        this.activePointers.delete(event.pointerId);
        try {
            this.host.canvas.releasePointerCapture(event.pointerId);
        } catch (e) { }

        if (this.pinchState && this.activePointers.size < 2) {
            this.pinchState = undefined;
            this.endMultiTouchGesture();
            return;
        }

        if (this.suppressSinglePointer) {
            this.endMultiTouchGesture();
            return;
        }

        this.handleMouseUp(event);

        // Touch browsers do not reliably dispatch `dblclick` from a double tap
        if (event.pointerType !== 'mouse') {
            this.detectDoubleTap(event);
        }
    }

    /** @internal Pointer aborted by the system: clean up all transient state. */
    handlePointerCancel = (event: PointerEvent) => {
        this.cancelLongPress();
        this.activePointers.delete(event.pointerId);
        try {
            this.host.canvas.releasePointerCapture(event.pointerId);
        } catch (e) { }
        if (this.activePointers.size < 2) {
            this.pinchState = undefined;
        }
        this.cancelSinglePointerInteraction();
        this.endMultiTouchGesture();
    }

    /**
     * @internal Wind down a multi-touch gesture as fingers are lifted.
     *
     * Once every finger is gone the suppression is released. If exactly one finger
     * remains while the canvas is in grab mode, panning is re-armed from that finger's
     * *current* position — otherwise `handleMouseMove` would keep panning relative to
     * the pre-pinch `grabStartPosition` and make the canvas jump.
     */
    endMultiTouchGesture() {
        if (this.activePointers.size === 0) {
            this.suppressSinglePointer = false;
            return;
        }

        if (this.activePointers.size === 1 && this.host.isGrabbing) {
            const [remaining] = [...this.activePointers.values()];
            const grabCoordinates = this.host.view.getCanvasCoordinates(remaining.x, remaining.y, true);
            this.grabStartPosition = { x: grabCoordinates.x, y: grabCoordinates.y };
            this.grabStartOffset = {
                x: parseFloat(this.host.canvas.style.getPropertyValue('--offset-x')),
                y: parseFloat(this.host.canvas.style.getPropertyValue('--offset-y')),
            };
            this.suppressSinglePointer = false;
        }
    }

    /** @internal Euclidean distance between the two active pointers (screen px). */
    pinchDistance(): number {
        const pts = [...this.activePointers.values()];
        return distanceBetween(pts[0], pts[1]);
    }

    /** @internal Midpoint between the two active pointers (screen coordinates). */
    pinchMidpoint(): { x: number; y: number } {
        const pts = [...this.activePointers.values()];
        return midpointOf(pts[0], pts[1]);
    }

    /** @internal Initialise a two-finger pinch gesture. Requires pan/edit permission. */
    beginPinch() {
        if (!(this.host.allowStudentPan || this.host.isEditable())) {
            return;
        }
        const mid = this.pinchMidpoint();
        this.pinchState = {
            startDist: this.pinchDistance(),
            startZoom: this.host.zoomLevel,
            lastMidX: mid.x,
            lastMidY: mid.y,
        };
    }

    /** @internal Apply the current two-finger gesture: pan by midpoint movement, zoom by finger spread. */
    updatePinch() {
        if (!this.pinchState) {
            return;
        }
        const rect = this.host.canvas.getBoundingClientRect();
        const dist = this.pinchDistance();
        const mid = this.pinchMidpoint();

        // Pan
        const scale = this.host.zoomLevel / 100;
        this.host.canvasOffsetX += (mid.x - this.pinchState.lastMidX) / scale;
        this.host.canvasOffsetY += (mid.y - this.pinchState.lastMidY) / scale;
        this.pinchState.lastMidX = mid.x;
        this.pinchState.lastMidY = mid.y;

        // Zoom
        if (this.pinchState.startDist > 0) {
            const targetZoom = this.pinchState.startZoom * (dist / this.pinchState.startDist);
            this.host.view.zoomAtPoint(mid.x - rect.left, mid.y - rect.top, targetZoom);
        } else {
            this.host.view.redrawCanvas();
        }
    }

    /** @internal Recognise a double tap and run the double-click logic (label editing). */
    detectDoubleTap(event: PointerEvent) {
        // A drag is not a tap; a started double-tap sequence lapses.
        const start = this.singlePointerStart;
        const moved = start
            ? Math.hypot(event.clientX - start.x, event.clientY - start.y)
            : Number.POSITIVE_INFINITY;
        this.singlePointerStart = undefined;

        if (moved > CanvasPointer.LONG_PRESS_MOVE_TOLERANCE) {
            this.lastTapTime = 0;
            this.lastTapPosition = undefined;
            return;
        }

        const gap = Date.now() - this.lastTapTime;
        const distance = this.lastTapPosition
            ? Math.hypot(event.clientX - this.lastTapPosition.x, event.clientY - this.lastTapPosition.y)
            : Number.POSITIVE_INFINITY;

        if (
            this.lastTapTime !== 0 &&
            gap <= CanvasPointer.DOUBLE_TAP_DELAY &&
            distance <= CanvasPointer.DOUBLE_TAP_DISTANCE
        ) {
            // Reset so that a third tap does not trigger again at once
            this.lastTapTime = 0;
            this.lastTapPosition = undefined;
            this.suppressNativeDoubleClick = true;
            this.handleDoubleClick(event);
            return;
        }

        this.lastTapTime = Date.now();
        this.lastTapPosition = { x: event.clientX, y: event.clientY };
    }

    /** @internal Arm the long-press timer for a fresh touch/pen contact. */
    startLongPress(clientX: number, clientY: number) {
        this.cancelLongPress();
        this.longPressOrigin = { x: clientX, y: clientY };
        this.longPressTimer = setTimeout(
            () => this.triggerLongPress(clientX, clientY),
            CanvasPointer.LONG_PRESS_DELAY
        );
    }

    /** @internal Disarm a pending long press (movement, release or a second finger). */
    cancelLongPress() {
        if (this.longPressTimer !== undefined) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = undefined;
        }
        this.longPressOrigin = undefined;
    }

    /**
     * @internal Fire the long press: abort the drag this touch had started and open the
     * context menu. The press only counts as consumed if an element was actually hit —
     * a long press on empty canvas stays an ordinary interaction.
     */
    triggerLongPress(clientX: number, clientY: number) {
        this.longPressTimer = undefined;
        this.longPressOrigin = undefined;

        if (!this.openContextMenuAt(clientX, clientY)) {
            return;
        }

        this.cancelSinglePointerInteraction();
        this.suppressSinglePointer = true;
        this.suppressNextClick = true;
    }

    /** @internal Reset any in-progress single-pointer interaction. */
    cancelSinglePointerInteraction() {
        this.isDragging = false;
        this.draggedNode = undefined;
        this.draggedNodes = [];
        this.isDrawingArrow = false;
        this.arrowStart = undefined;
        this.tempArrowEnd = undefined;
        this.selectionRectangle = undefined;
        this.checkOffset = true;
        this.grabStartPosition = undefined;
        this.grabStartOffset = undefined;

        this.host.view.redrawCanvas();
    }

    // ------------------------ Mouse-Events ------------------------

    /** @internal Handles mousedown on the canvas (selection, drag, arrow creation). */
    handleMouseDown(event: MouseEvent) {
        const { x, y } = this.host.view.getMouseCoordinates(event);
        const nodeUnderCursor = findLastGraphNode(this.host.ctx, this.host.graphNodes, x, y);

        if (!nodeUnderCursor || !this.host.selectedNodes.includes(nodeUnderCursor)) {
            this.host.selectedNodes = [];
            this.draggedNodes = [];
        }

        // A node is being dragged
        if (!this.host.isGrabbing) {
            if ((!this.host.allowStudentEdit && !this.host.isEditable())) {
                return;
            }

            if (this.host.selectedNodes.length > 1) {
                const { draggedNodes, isDragging, dragOffset } = handleMultipleNodesDragStart(
                    this.host.ctx,
                    x,
                    y,
                    this.host.selectedNodes,
                    this.host.selectedArrow
                );
                this.draggedNodes = draggedNodes;
                this.isDragging = isDragging;
                this.dragOffset = dragOffset ?? { x: 0, y: 0 };
            } else {
                const { draggedNode, isDragging, dragOffset } = handleNodeDragStart(
                    this.host.ctx,
                    x,
                    y,
                    this.host.graphNodes,
                    this.host.selectedArrow
                );
                this.draggedNode = draggedNode;
                this.isDragging = isDragging;
                this.dragOffset = dragOffset ?? { x: 0, y: 0 };
            }
        }

        if (this.host.isGrabbing) {
            // Update the canvas offset while the canvas is dragged
            const grabCoordinates = this.host.view.getMouseCoordinates(event, true)
            this.grabStartPosition = { x: grabCoordinates.x, y: grabCoordinates.y };
            const offsetX = parseFloat(this.host.canvas.style.getPropertyValue('--offset-x'));
            const offsetY = parseFloat(this.host.canvas.style.getPropertyValue('--offset-y'));
            this.grabStartOffset = { x: offsetX, y: offsetY };
        } else {
            // While an arrow is dragged, a temporary dashed arrow is drawn
            const { arrowToMove, arrowStart } = handleArrowDragStart(
                this.host.ctx,
                x,
                y,
                this.host.graphNodes,
                this.host.selectedArrow,
                this.handleAnchorClick.bind(this)
            );

            if (arrowToMove && arrowStart) {
                this.arrowStart = arrowStart;
                this.host.arrows = this.host.arrows.filter((arrow) => arrow !== arrowToMove);
            }
        }

        if (!nodeUnderCursor && !this.host.isGrabbing && !this.host.selectedNode) {
            if ((!this.host.allowStudentEdit && !this.host.isEditable())) {
                return;
            }

            this.selectionRectangle = { x, y, width: 0, height: 0 };
        }
    }

    /** @internal Handles mouseup on the canvas (finalizing drag or arrow creation). */
    handleMouseUp(event: MouseEvent) {
        if (this.selectionRectangle) {
            this.selectionRectangle = undefined;
        } else if (this.host.isGrabbing && this.grabStartPosition) {
            // Reset the grab position after the canvas was dragged
            const { grabStartPosition, grabStartOffset } = handleGrabRelease();
            this.grabStartPosition = grabStartPosition;
            this.grabStartOffset = grabStartOffset;
        } else {
            if (this.isDragging) {
                // Update the node position based on the snap threshold
                if (this.host.selectedNodes.length === 0 && this.draggedNode) {
                    snapNodePosition(this.host.ctx, this.draggedNode, this.host.graphNodes, 8);
                }

                // Reset the state after a node was dragged
                const { isDragging } = handleNodeDragStop();
                this.isDragging = isDragging;
            } else if (this.isDrawingArrow) {
                // Create the arrow connection, if any, after an arrow was released
                const { x, y } = this.host.view.getMouseCoordinates(event);
                const { tempArrowEnd, arrowStart, arrows } = handleArrowCreation(
                    this.host.ctx,
                    x,
                    y,
                    this.arrowStart,
                    this.host.graphNodes,
                    this.host.arrows
                );

                this.tempArrowEnd = tempArrowEnd;
                this.arrowStart = arrowStart;
                this.host.arrows = arrows;
                this.isDrawingArrow = false;
            }
        }

        // Reset the one-time gate for dragging several nodes
        this.checkOffset = true;

        this.host.graphNodes = [...this.host.graphNodes];

        this.host.view.redrawCanvas();
    }

    /** @internal Handles mousemove on the canvas (dragging/panning/hover anchors). */
    handleMouseMove(event: MouseEvent) {
        const { x, y } = this.host.view.getMouseCoordinates(event);
        if (this.selectionRectangle) {
            const selectionRectangle = this.selectionRectangle;
            selectionRectangle.width = x - selectionRectangle.x;
            selectionRectangle.height = y - selectionRectangle.y;
            this.host.selectedNodes = this.host.graphNodes.filter((node) =>
                isNodeInRectangle(this.host.ctx, node, selectionRectangle)
            );
            this.host.view.redrawCanvas();
        } else if (this.host.isGrabbing && this.grabStartPosition && this.grabStartOffset) {
            const grabCoordinates = this.host.view.getMouseCoordinates(event, true)
            const deltaX = grabCoordinates.x - this.grabStartPosition.x;
            const deltaY = grabCoordinates.y - this.grabStartPosition.y;

            // Update the canvas offset
            this.host.canvasOffsetX = this.host.canvasOffsetX + deltaX
            this.host.canvasOffsetY = this.host.canvasOffsetY + deltaY

            // Update the canvas from the mouse movement
            const offsetX = parseFloat(this.host.canvas.style.getPropertyValue('--offset-x'));
            const offsetY = parseFloat(this.host.canvas.style.getPropertyValue('--offset-y'));
            this.host.canvas.style.setProperty('--offset-x', `${offsetX + (deltaX * this.host.zoomLevel) / 100}px`);
            this.host.canvas.style.setProperty('--offset-y', `${offsetY + (deltaY * this.host.zoomLevel) / 100}px`);

            // Draw the updated canvas
            this.host.view.redrawCanvas();

            // Set grabStartPosition to the current mouse position
            this.grabStartPosition = { x: grabCoordinates.x, y: grabCoordinates.y };
        } else {
            if (this.isDragging && this.draggedNodes.length > 1) {
                let deltaX: number;
                let deltaY: number;

                if (this.checkOffset) {
                    deltaX = this.dragOffset.x;
                    deltaY = this.dragOffset.y;

                    const nodeUnderCursor = findLastGraphNode(this.host.ctx, this.host.graphNodes, x, y);
                    if (nodeUnderCursor) {
                        this.draggedNodes.forEach((node) => {
                            node.x = node.x + deltaX + (nodeUnderCursor.x - x);
                            node.y = node.y + deltaY + (nodeUnderCursor.y - y);
                        });
                    }

                    this.checkOffset = false;
                } else {
                    deltaX = x - this.dragOffset.x;
                    deltaY = y - this.dragOffset.y;
                    this.draggedNodes.forEach((node) => {
                        node.x += deltaX;
                        node.y += deltaY;
                    });
                }

                this.dragOffset = { x, y };

                this.host.view.redrawCanvas();
            } else if (this.isDragging && this.draggedNode) {
                this.draggedNode.x = x - this.dragOffset.x;
                this.draggedNode.y = y - this.dragOffset.y;
                this.host.view.redrawCanvas();
            } else if (this.isDrawingArrow && this.arrowStart && (this.host.selectedNode || this.host.selectedArrow)) {
                const { x, y } = this.host.view.getMouseCoordinates(event);

                this.tempArrowEnd = { x, y };

                this.host.view.redrawCanvas();
            }
        }

        // Highlight the anchor point when the pointer is over it
        const { hoveredAnchor, isArrowAnchorHovered } = highlightAnchor(
            this.host.ctx,
            this.host.selectedNode,
            this.host.selectedArrow,
            x,
            y
        );
        this.hoveredAnchor = hoveredAnchor;
        this.isArrowAnchorHovered = isArrowAnchorHovered;
        this.host.view.redrawCanvas();
    }

    /** @internal Canvas `dblclick`: ignored when the double tap was already handled. */
    handleNativeDoubleClick = (event: MouseEvent) => {
        if (this.suppressNativeDoubleClick) {
            this.suppressNativeDoubleClick = false;
            return;
        }
        this.handleDoubleClick(event);
    };

    /** @internal Canvas `click`: ignored right after a long press, otherwise selects and closes the context menu. */
    handleNativeClick = (event: MouseEvent) => {
        if (this.suppressNextClick) {
            this.suppressNextClick = false;
            return;
        }
        this.handleClick(event);
        this.host.toggleMenu('context');
    };

    /** @internal Canvas `contextmenu`: replaces the browser menu. */
    handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        this.showContextMenu(event);
    };

    /** @internal Handles clicks (select node/arrow, reorder for z-index, context menu). */
    handleClick(event: MouseEvent) {
        const { x, y } = this.host.view.getMouseCoordinates(event);

        if (this.host.isSelectingSequence) {
            handleSequenceSelection(this.host.ctx, this.host.selectedSequence, this.host.graphNodes, this.host.arrows, x, y);
            this.host.view.redrawCanvas();
        } else {
            if (!this.host.isGrabbing) {
                if ((!this.host.allowStudentEdit && !this.host.isEditable())) {
                    return;
                }

                if (this.draggedNodes.length === 0) {
                    // Select the clicked element, or clear the selection if none was clicked
                    const clickedNode = findLastGraphNode(this.host.ctx, this.host.graphNodes, x, y);
                    this.host.selectedNode = clickedNode;
                    // Move the selected element to the end of the array so that it is drawn above the others
                    if (clickedNode && !this.isDragging) {
                        const selectedNodeIndex = this.host.graphNodes.lastIndexOf(clickedNode);
                        this.host.graphNodes.splice(selectedNodeIndex, 1);
                        this.host.graphNodes.push(clickedNode);
                    }

                    this.updateAnchorListeners();
                }
                // Find the clicked arrow index, or clear the selection if no arrow was clicked
                const selectedArrowIndex = this.host.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points, this.arrowHitTolerance));
                // If an arrow was clicked, set selectedArrow to it
                // and reorder the array so that the clicked arrow is always drawn fully colored
                if (selectedArrowIndex !== -1) {
                    this.host.selectedArrow = this.host.arrows[selectedArrowIndex];
                    this.host.arrows.splice(selectedArrowIndex, 1);
                    this.host.arrows.push(this.host.selectedArrow);
                    this.host.view.redrawCanvas();
                } else if (this.host.selectedArrow) {
                    this.host.selectedArrow = undefined;
                    this.host.view.redrawCanvas();
                }

                // Redraw the canvas to show the updated selection
                this.host.view.redrawCanvas();
            }
        }
    }

    /** @internal Handles double clicks (open edit prompts). */
    handleDoubleClick(event: MouseEvent) {
        if ((!this.host.allowStudentEdit && !this.host.isEditable())) {
            return;
        }

        const { x, y } = this.host.view.getMouseCoordinates(event);
        const clickedNodeIndex = findGraphNodeLastIndex(this.host.ctx, this.host.graphNodes, x, y);
        const selectedArrowIndex = this.host.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points, this.arrowHitTolerance));

        if (clickedNodeIndex !== -1 && this.host.graphNodes[clickedNodeIndex].node !== 'connector') {
            handleGraphNodeDoubleClick(clickedNodeIndex, (type, index) => this.host.prompt.show(type, index));
        } else if (selectedArrowIndex !== -1) {
            handleArrowDoubleClick(selectedArrowIndex, (type, index) => this.host.prompt.show(type, index));
        }
    }

    /** @internal Begin arrow creation from a node anchor. */
    handleAnchorClick(node: GraphNode, anchor: number) {
        if(this.isArrowAnchorHovered) {
            return
        }
        this.isDrawingArrow = true;
        this.arrowStart = { node, anchor };
    }

    /** @internal Cached mousedown listener for node anchors; installed on the canvas when a node is selected. */
    anchorMouseDownEvent: ((event: MouseEvent) => void) | null = null;

    /** @internal Update anchor pointer listeners based on the selected node. */
    updateAnchorListeners() {
        const selectedNode = this.host.selectedNode;
        if (selectedNode && selectedNode.node !== 'text') {
            const anchors = getAnchors(this.host.ctx, selectedNode, 15);

            // Remove the existing pointerdown listener first, if any
            if (this.anchorMouseDownEvent && this.host.canvas) {
                this.host.canvas.removeEventListener('pointerdown', this.anchorMouseDownEvent);
                this.anchorMouseDownEvent = null;
            }

            // Create the new listener and keep it in anchorMouseDownEvent
            this.anchorMouseDownEvent = (event) => {
                const { x, y } = this.host.view.getMouseCoordinates(event);
                // Larger hit area for fingers so that arrows can be created on touch devices
                const hitRadius = this.lastPointerType === 'touch' ? 18 : 8;
                anchors.forEach((position, index) => {
                    const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
                    if (distance <= hitRadius) {
                        this.handleAnchorClick(selectedNode, index);
                    }
                });
            };

            // Add the new listener
            if (this.host.canvas) {
                this.host.canvas.addEventListener('pointerdown', this.anchorMouseDownEvent);
            }
        }
    }
}
