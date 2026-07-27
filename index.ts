import { LitElementWw, option } from '@webwriter/lit';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

import { GraphNode } from './src/definitions/GraphNode';
import { Arrow } from './src/definitions/Arrow';
import { ItemList } from './src/definitions/ItemList';
import { optionLabels } from './src/definitions/optionLabels';

import { drawButton } from './src/modules/drawer/drawButton';
import { drawGraphNode, drawNodeAnchors } from './src/modules/drawer/drawGraphNode';
import { drawArrow, drawTempArrow, generateArrowPoints, drawArrowAnchor } from './src/modules/drawer/drawArrow';
import { drawSelectionField } from './src/modules/drawer/drawSelectionField';

import {
    handleNodeDragStart,
    handleArrowDragStart,
    handleMultipleNodesDragStart,
} from './src/modules/handler/mouseDownHandler';
import { handleGrabRelease, handleNodeDragStop, handleArrowCreation } from './src/modules/handler/mouseUpHandler';
import { handleSequenceSelection } from './src/modules/handler/handleSequenceSelection';
import { handleGraphNodeDoubleClick, handleArrowDoubleClick } from './src/modules/handler/doubleClickHandler';

import { toggleMenu } from './src/modules/ui/toggleMenu';
import { addHelp, renderHelpList } from './src/modules/ui/helpMenu';
import { addTask, renderTasks } from './src/modules/ui/taskMenu';
import {
    createTooltip,
    removeTooltip,
    updateDisabledState,
    grabCanvas,
    autoDeleteEmptyItems,
} from './src/modules/ui/generalUI';

import {
    snapNodePosition,
    removeOldConnection,
    isNodeInRectangle,
    findLastGraphNode,
    findGraphNodeLastIndex,
} from './src/modules/helper/utilities';
import { isArrowClicked } from './src/modules/helper/arrowHelper';
import { getAnchors, highlightAnchor } from './src/modules/helper/anchorHelper';
import { createArrowsFromGraphNodes, updatePresetIds } from './src/modules/helper/presetHelper';

import { papWidgetStyles } from './src/modules/styles/styles';

import { CustomPrompt } from './src/components/custom-prompt';
import './src/components/custom-prompt';
import { ConfirmPrompt } from './src/components/confirm-prompt';
import './src/components/confirm-prompt';

import { localized, msg } from "@lit/localize"
import LOCALIZE from "./localization/generated"

/**
 * @summary Create programming flowcharts with interactive tasks. Use standardized Elements such as loops and Branchings.
 *
 * @tag webwriter-flowchart
 * @tagname webwriter-flowchart
 *
 * @attr {string} graph-nodes - JSON string representing an array of GraphNode objects. When set, arrows are recomputed.
 * @attr {number} height - Canvas height in pixels. Default 400.
 * @attr {number} zoom-level - Zoom percentage in the range [50, 200]. Default 100.
 * @attr {number} canvas-offset-x - Horizontal pan offset in world units.
 * @attr {number} canvas-offset-y - Vertical pan offset in world units.
 * @attr {boolean} disable-student-edit - Disables student editing (adding, dragging, deleting).
 * @attr {boolean} disable-student-pan - Disables student panning and zoom interaction.
 * @attr {string} font - Font family used for node labels, spaces written as underscores. Default "Courier_New".
 * @attr {number} font-size - Font size used for node labels. Default 16.
 * @attr {string} theme - Color theme; one of "standard" | "pastel" | "mono" | "s/w". Default "standard".
 *
 * @prop {GraphNode[]} graphNodes - Current list of graph nodes (programmatic API).
 * @prop {Arrow[]} arrows - Current list of arrows between nodes (programmatic API).
 * @prop {ItemList[]} taskList - Tasks shown in the task menu.
 * @prop {ItemList[]} helpList - Hints shown in the help menu.
 * @prop {number} zoomLevel - Current zoom percentage (50–200).
 * @prop {number} canvasOffsetX - Horizontal pan offset (world units).
 * @prop {number} canvasOffsetY - Vertical pan offset (world units).
 * @prop {string} font - Font family used for labels, spaces written as underscores.
 * @prop {number} fontSize - Font size used for labels.
 * @prop {string} theme - Color theme name.
 * @prop {boolean} fullscreen - Whether the widget is currently in fullscreen mode.
 * @prop {string} solutionMessage - Message shown in the solution prompt.
 * @prop {boolean} showSolution - Whether the solution prompt is visible.
 *
 * @cssprop [--scaled-grid-size=50px] - Spacing between grid dots (derived from zoom).
 * @cssprop [--scaled-grid-dot-size=1.5px] - Dot radius for the background grid (derived from zoom).
 * @cssprop --offset-x - Internal canvas left offset (managed by the widget).
 * @cssprop --offset-y - Internal canvas top offset (managed by the widget).
 * @cssprop --widget-height - Workspace height in pixels.
 */
@customElement('webwriter-flowchart')
@localized()
export class FlowchartWidget extends LitElementWw {
    public localize = LOCALIZE;

    /**
     * List of graph nodes comprising the flowchart.
     * Reflected as the 'graph-nodes' attribute (expects JSON when set externally).
     */
    @property({ type: Array, reflect: true, attribute: true }) accessor graphNodes: GraphNode[] = [];

    /** @internal Currently selected/focused node. */
    @property({ type: Object }) accessor selectedNode: GraphNode;

    /** List of arrows connecting nodes. */
    @property({ type: Array }) accessor arrows: Arrow[] = [];

    /** @internal Currently selected/focused arrow. */
    @property({ type: Object }) accessor selectedArrow: Arrow;

    /**
     * Get the current nodes.
     * @returns {GraphNode[]} Array of nodes
     */
    getGraphNodes = () => this.graphNodes;

    /**
     * Get the current arrows.
     * @returns {Arrow[]} Array of arrows
     */
    getArrows = () => this.arrows;

    /** Tasks visible in the task menu. */
    @property({ type: Array, reflect: true, attribute: true }) accessor taskList: ItemList[] = [];

    /** Hints visible in the help menu. */
    @property({ type: Array, reflect: true, attribute: true }) accessor helpList: ItemList[] = [];

    /** Canvas height (px). */
    @property({ type: Number, reflect: true, attribute: true }) accessor height: number = 400;

    /** @internal Runtime canvas height; tracks drag-resize/fullscreen. */
    @property({ type: Number }) accessor currentHeight: number = this.height;

    /** @internal Rendering settings handed to the drawers; derived from the options so that changing one takes effect on the next redraw. */
    private get graphSettings(): { font: string; fontSize: number; theme: string } {
        return { font: this.fontFamily, fontSize: Number(this.fontSize), theme: this.theme };
    }

    /**
     * @internal CSS font family for the selected `font` option.
     */
    private get fontFamily(): string {
        return this.font.replace(/_/g, ' ');
    }

    /** Zoom level in percent [50–200]. */
    @property({ type: Number, reflect: true, attribute: true })
    @option({
        type: Number,
        label: optionLabels.zoom,
        min: 50,
        max: 200,
        step: 10
    })
    accessor zoomLevel: number = 100;

    /** @internal Base grid spacing (world units). */
    private gridSize: number = 50;

    /** @internal Background grid dot radius (world units). */
    private dotSize: number = 1.5;

    /** Horizontal pan offset (world units). */
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetX: number = 0;

    /** Vertical pan offset (world units). */
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetY: number = 0;

    /** Disables interactive editing (adding/dragging/deleting). */
    @property({ type: Boolean, reflect: true, attribute: true }) accessor disableStudentEdit: boolean = false;

    /** Whether students may add, drag and delete elements. */
    // @ts-ignore: `option` is typed for accessors, but works on a getter/setter pair as well
    @option({ type: Boolean, label: optionLabels.allowEditing })
    get allowStudentEdit(): boolean {
        return !this.disableStudentEdit;
    }
    set allowStudentEdit(value: boolean) {
        this.disableStudentEdit = !value;
    }

    /** Disables panning/zooming interactions. */
    @property({ type: Boolean, reflect: true, attribute: true }) accessor disableStudentPan: boolean = false;

    /** Whether students may pan and zoom the canvas. */
    // @ts-ignore: `option` is typed for accessors, but works on a getter/setter pair as well
    @option({ type: Boolean, label: optionLabels.allowMoving })
    get allowStudentPan(): boolean {
        return !this.disableStudentPan;
    }
    set allowStudentPan(value: boolean) {
        this.disableStudentPan = !value;
    }

    /** Font family for node labels, multi-word families are underscored (see `fontFamily`). */
    @property({ type: String, reflect: true, attribute: true })
    @option({
        type: "select",
        label: optionLabels.font,
        options: [
            { value: "Arial", label: { "en": "Arial" } },
            { value: "Courier_New", label: { "en": "Courier New" } },
            { value: "Times_New_Roman", label: { "en": "Times New Roman" } },
            { value: "Verdana", label: { "en": "Verdana" } }
        ]
     })
    accessor font = 'Courier_New';

    /** Font size for node labels. */
    @property({ type: Number, reflect: true, attribute: true })
    @option({
        type: Number,
        label: optionLabels.fontSize,
        min: 8,
        max: 40,
        step: 1
    })
    accessor fontSize = 16;

    /** Color theme name. */
    @property({ type: String, reflect: true, attribute: true })
    @option({
        type: "select",
        label: optionLabels.theme,
        options: [
            { value: "standard", label: optionLabels.themeStandard },
            { value: "pastel", label: optionLabels.themePastel },
            { value: "mono", label: optionLabels.themeMono },
            { value: "s/w", label: optionLabels.themeBlackWhite }
        ]
    })
    accessor theme = 'standard';

    /** Whether the widget is in fullscreen mode. */
    @property({ type: Boolean }) accessor fullscreen = false;

    /** @internal Focus delegation for better keyboard support. */
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    /** @internal Keeps the canvas in sync with the host box (fullscreen, window resize). */
    private resizeObserver = new ResizeObserver(() => this.syncLayout());

    /** @internal Canvas element reference. */
    private canvas: HTMLCanvasElement;

    /** @internal 2D drawing context for the canvas. */
    private ctx: CanvasRenderingContext2D;

    /** @internal Drag state. */
    private isDragging = false;
    /** @internal Node currently being dragged. */
    private draggedNode: GraphNode;
    /** @internal Drag offset from the pointer to node origin. */
    private dragOffset = { x: 0, y: 0 };
    /** @internal Group drag: the set of nodes being dragged. */
    private draggedNodes: GraphNode[] = [];

    /** @internal Arrow drawing state. */
    private isDrawingArrow = false;
    /** @internal Arrow start anchor. */
    private arrowStart?: { node: GraphNode; anchor: number };
    /** @internal Temporary arrow endpoint while dragging. */
    private tempArrowEnd?: { x: number; y: number };

    /** @internal Currently active pointers on the canvas (id → last screen position). Drives multi-touch gestures. */
    private activePointers = new Map<number, { x: number; y: number }>();

    /** @internal Type of the most recent pointer ("mouse" | "touch" | "pen"). Used to enlarge hit targets for touch. */
    private lastPointerType: string = 'mouse';

    /** @internal Active two-finger pinch/pan gesture state (zoom + pan around the finger midpoint). */
    private pinchState?: { startDist: number; startZoom: number; lastMidX: number; lastMidY: number };

    /** @internal Blocks single-pointer handling for leftover fingers after a multi-touch gesture. */
    private suppressSinglePointer = false;

    /** @internal Pending long-press timer; opens the context menu on touch devices. */
    private longPressTimer?: ReturnType<typeof setTimeout>;

    /** @internal Viewport position where the current long-press candidate started. */
    private longPressOrigin?: { x: number; y: number };

    /** @internal Delay before a stationary touch counts as a long press (ms). */
    private static readonly LONG_PRESS_DELAY = 500;

    /** @internal Movement (px) that cancels a long press, tolerating natural finger jitter. */
    private static readonly LONG_PRESS_MOVE_TOLERANCE = 10;

    /** @internal Swallows the synthetic click after a long press, which would close the menu again. */
    private suppressNextClick = false;

    /** @internal Viewport position where the current single-pointer contact started. */
    private singlePointerStart?: { x: number; y: number };

    /** @internal Timestamp of the last recognised tap, for double-tap detection (0 = none). */
    private lastTapTime = 0;

    /** @internal Viewport position of the last recognised tap. */
    private lastTapPosition?: { x: number; y: number };

    /** @internal Maximum gap between two taps to count as a double tap (ms). */
    private static readonly DOUBLE_TAP_DELAY = 300;

    /** @internal Maximum distance between two taps to count as a double tap (px). */
    private static readonly DOUBLE_TAP_DISTANCE = 25;

    /**
     * @internal Swallows a native `dblclick` that a browser may emit in addition to the
     * double tap we already handled ourselves, so the edit prompt does not open twice.
     */
    private suppressNativeDoubleClick = false;

    /** @internal Canvas panning (grab) state. */
    private isGrabbing = false;
    /** @internal Start pointer position for grab. */
    private grabStartPosition?: { x: number; y: number };
    /** @internal Start offset for grab. */
    private grabStartOffset?: { x: number; y: number };

    /** @internal Currently hovered anchor on a node. */
    private hoveredAnchor?: { element: GraphNode; anchor: number };
    /** @internal Whether an arrow anchor is hovered. */
    private isArrowAnchorHovered: boolean;

    /** @internal Path selection mode (for solution checking). */
    private _isSelectingSequence = false;

    /** @internal Currently selected path sequence. */
    private selectedSequence: { id: string; order: number; type: string }[] = [];

    /**
     * Get the currently selected path sequence.
     * 
     * @returns {Array<{ id: string; order: number; type: string }>} The currently selected sequence of path elements.
     */
    getSelectedSequence = () => this.selectedSequence;

    /** @internal Sequence button reference. */
    private activeSequenceButton: HTMLButtonElement | null = null;

    /** Get the active sequence button.
     * @returns {HTMLButtonElement|null} */
    getActiveSequenceButton = () => this.activeSequenceButton;

    /** Set the active sequence button.
     * @param {HTMLButtonElement|null} btn */
    setActiveSequenceButton = (btn: HTMLButtonElement | null) => {
        this.activeSequenceButton = btn;
    };

    /** Whether path-selection mode is active.
     * @returns {boolean} */
    get isSelectingSequence() {
        return this._isSelectingSequence;
    }

    /** Set path-selection mode.
     * @param {boolean} value */
    set isSelectingSequence(value: boolean) {
        const oldValue = this._isSelectingSequence;
        this._isSelectingSequence = value;
        if (oldValue !== value) {
            //this.showSolutionMenu();
        }
    }

    /** @internal prompt type and index for edit dialogs. */
    private promptType: 'node' | 'arrow' | null;
    /** @internal prompt index for edit dialogs. */
    private promptIndex: number | null;

    /** Message to show in the solution prompt. */
    @property({ type: String }) accessor solutionMessage: string = '';

    /** Whether to show the solution prompt. */
    @property({ type: Boolean }) accessor showSolution: boolean = false;

    /** @internal Multi-select of nodes (drag box). */
    @property({ type: Array }) accessor selectedNodes: GraphNode[] = [];

    /** @internal Selection rectangle during drag-select. */
    private selectionRectangle?: { x: number; y: number; width: number; height: number };

    /** @internal One-time offset gate for multi-drag. */
    private checkOffset = true;

    /** @internal Component style (provided by papWidgetStyles). */
    static style = papWidgetStyles;

    /** @internal Localized default labels per node type. */
    static label(node: string): string {
        switch (node) {
            case 'start': return msg('Start');
            case 'op': return msg('Process');
            case 'decision': return msg('Decision');
            case 'i/o': return msg('Input/Output');
            case 'sub': return msg('Subprogram');
            case 'connector': return '';
            case 'end': return msg('End');
            case 'text': return msg('Comment');
            default: return '';
        }
    }

    /** @internal Scoped child elements used by the widget. */
    static scopedElements = {
        'custom-prompt': CustomPrompt,
        'confirm-prompt': ConfirmPrompt
    };

    /**
     * Returns whether the widget is currently in an editable state
     * based on the `contenteditable` attribute.
     * @returns {boolean}
     */
    public isEditable(): boolean {
        return this.contentEditable === 'true' || this.contentEditable === '';
    }

    render() {
        return html`
            <style>
                ${papWidgetStyles}
            </style>
            <div class="workspace" @scroll="${this.handleScroll}">
                <canvas
                    width="100%"
                    height="${this.currentHeight * (window.devicePixelRatio || 1)}"
                    @pointerdown="${this.handlePointerDown}"
                    @pointerup="${this.handlePointerUp}"
                    @pointermove="${this.handlePointerMove}"
                    @pointercancel="${this.handlePointerCancel}"
                    @dblclick="${(event: MouseEvent) => {
                        if (this.suppressNativeDoubleClick) {
                            this.suppressNativeDoubleClick = false;
                            return;
                        }
                        this.handleDoubleClick(event);
                    }}"
                    @click="${(event: MouseEvent) => {
                        if (this.suppressNextClick) {
                            this.suppressNextClick = false;
                            return;
                        }
                        this.handleClick(event);
                        this.toggleMenu('context');
                    }}"
                    @contextmenu="${(event: MouseEvent) => {
                        event.preventDefault();
                        this.showContextMenu(event);
                    }}"
                    @wheel="${this.handleWheel}"
                ></canvas>

                <div class="action-menu" style=${this.fullscreen ? 'top:10px;left:10px;' : ''}>
                    <button
                        id="grab-button"
                        @mouseenter="${(e) => createTooltip(e, msg('Move the canvas'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.grabCanvas}"
                        class="${this.isGrabbing ? 'active' : ''}"
                        style=${(!this.allowStudentPan && !this.hasAttribute("contenteditable")) || (this.allowStudentPan && !this.allowStudentEdit && !this.hasAttribute("contenteditable")) ? 'display:none' : ''}
                    >
                        ${drawButton('grab', 'tool')}
                    </button>
                    <!-- <button
                        @mouseenter="${(e) => createTooltip(e, msg('Tasks'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${() => this.toggleMenu('task')}"
                        style=${!this.isEditable() && this.taskList?.length == 0 ? 'display:none' : ''}
                    >
                        ${drawButton('task', 'tool')}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, msg('Hints'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${() => this.toggleMenu('help')}"
                        style=${!this.isEditable() && this.helpList?.length == 0 ? 'display:none' : ''}
                    >
                        ${drawButton('help', 'tool')}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, msg('Delete all'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.showConfirmPrompt}"
                        style=${!this.allowStudentEdit ? 'display:none' : ''}
                    >
                        ${drawButton('delete', 'tool')}
                    </button> -->
                    <button
                        @mouseenter="${(e) => createTooltip(e, msg('Fullscreen'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.toggleFullscreen}"
                        class="fullscreen-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"
                            />
                        </svg>
                    </button>
                </div>

                <div class="flowchart-menu" style=${(!this.allowStudentEdit && !this.hasAttribute("contenteditable")) ? 'display:none' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('flow')}">×</button>
                    <button @click="${() => this.addGraphNode('start', FlowchartWidget.label('start'))}">
                        ${drawButton('start', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('op', FlowchartWidget.label('op'))}">${drawButton('op', 'flow')}</button>
                    <button @click="${() => this.addGraphNode('decision', '  ' + FlowchartWidget.label('decision') + '  ')}">
                        ${drawButton('decision', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('i/o', FlowchartWidget.label('i/o'))}">
                        ${drawButton('i/o', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('sub', FlowchartWidget.label('sub'))}">
                        ${drawButton('sub', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('connector', '')}">
                        ${drawButton('connector', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('end', FlowchartWidget.label('end'))}">${drawButton('end', 'flow')}</button>
                    <button @click="${() => this.addGraphNode('text', FlowchartWidget.label('text'))}">
                        ${drawButton('text', 'flow')}
                    </button>
                </div>

                <button class="show-flowchart-button hidden" @click="${() => this.toggleMenu('flow')}">+</button>

                <div class="solution-menu hidden">
                    <div class="solution-titel">${msg('Check path')}</div>
                    ${this.taskList?.map((task) =>
                        task.sequence
                            ? html`<button class="solution-button" @click="${() => this.checkSolution(task)}">
                                  ${task.titel}
                              </button>`
                            : ''
                    )}
                </div>

                <div class="task-menu hidden" style=${this.fullscreen ? 'top:10px;right:10px;' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('task')}">×</button>
                    <div class="task-menu-wrapper">
                        ${this.taskList?.length === 0
                            ? html`<p class="no-tasks-message">${msg('No tasks!')}</p>`
                            : renderTasks.bind(this)(this.taskList)}
                        <button class="add-task-button editMode" @click="${this.addTask}">
                            ${drawButton('addTask', 'task')}
                        </button>
                    </div>
                </div>

                <div class="help-menu hidden" style=${this.fullscreen ? 'top:10px;right:10px;' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('help')}">×</button>
                    ${this.helpList?.length === 0
                        ? html`<p class="no-help-message">${msg('No hints!')}</p>`
                        : renderHelpList.bind(this)(this.helpList)}
                    <button class="add-help-button editMode" @click="${this.addHelp}">
                        ${drawButton('addHelp', 'help')}
                    </button>
                </div>

                <div class="translate-menu hidden">
                    <button class="close-button" @click="${() => this.toggleMenu('translate')}">×</button>
                    <div class="translate-menu-container">
                        <button class="translate-button" @click="${() => this.translateFlowchart('natural')}">
                            ${drawButton('naturalLanguage', 'translate')}
                        </button>
                        <textarea id="naturalLanguageOutput" class="output-textarea hidden" disabled></textarea>
                    </div>
                    <div class="translate-menu-container">
                        <button class="translate-button" @click="${() => this.translateFlowchart('pseudo')}">
                            ${drawButton('pseudoCode', 'translate')}
                        </button>
                        <textarea id="pseudoCodeOutput" class="output-textarea hidden" disabled></textarea>
                    </div>
                </div>

                <div id="context-menu" class="context-menu">
                    <div class="context-menu-item" @click="${() => this.deleteSelectedObject()}">${msg('Delete')}</div>
                </div>

                <custom-prompt
                    label="${msg('Type in the new text:')}"
                    @submit="${(event: CustomEvent) => this.handlePromptSubmit(event)}"
                    @cancel="${this.hidePrompt}"
                    class="hidden"
                ></custom-prompt>

                <confirm-prompt
                    label="${msg('Are you sure, that you want to delete everything?')}"
                    .onConfirm="${this.clearAll}"
                    .onCancel="${this.hidePrompt}"
                    class="hidden"
                ></confirm-prompt>

                <div class="prompt ${this.showSolution ? '' : 'hidden'}">
                    <p>${this.solutionMessage}</p>
                    <button @click="${this.closeSolution}">${msg('Close')}</button>
                </div>
            </div>
            <div
                class="y-rezise"
                @dragend="${this.handleYResizeEnd}"
                draggable="true"
                style=${(!this.allowStudentEdit && !this.hasAttribute("contenteditable")) || this.fullscreen ? 'display:none' : ''}
            ></div>
        `;
    }

    // ------------------------ User interface Functionality ------------------------

    /**
     * Translate the current flowchart into either natural language or pseudocode.
     * Builds a chat-style message array via `generateMessages()`, shows a busy cursor,
     * calls the Netlify function `/.netlify/functions/translateFlowchart`, and writes the
     * returned `translation` into the corresponding output textarea.
     *
     * @param {'natural'|'pseudo'} language - Target format for the translation.
     * @returns {void}
     */
    private translateFlowchart(language: 'natural' | 'pseudo') {
        const messages = this.generateMessages(language);
        const translateButtons = this.shadowRoot.querySelectorAll('.translate-button');
        translateButtons.forEach((button: HTMLElement) => (button.style.cursor = 'wait'));
        document.body.style.cursor = 'wait';
        fetch('/.netlify/functions/translateFlowchart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: 2000,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (language === 'natural') {
                    let textAreaElement = this.shadowRoot.getElementById(
                        'naturalLanguageOutput'
                    ) as HTMLTextAreaElement;
                    textAreaElement.value = data.translation;
                    textAreaElement.classList.remove('hidden');
                } else {
                    let textAreaElement = this.shadowRoot.getElementById('pseudoCodeOutput') as HTMLTextAreaElement;
                    textAreaElement.value = data.translation;
                    textAreaElement.classList.remove('hidden');
                }
            })
            .finally(() => {
                translateButtons.forEach((button: HTMLElement) => (button.style.cursor = 'pointer'));
                document.body.style.cursor = 'auto';
            });
    }

    
    /**
     * Build a chat-style message array that encodes the current flowchart structure.
     * The system message instructs the translator for either natural language
     * or pseudocode. The user message enumerates all nodes and their connections:
     * ID, node type, text, anchors, directions, and connected node IDs (with optional text).
     *
     * @param {'natural'|'pseudo'} language - Controls the system directive in the messages.
     * @returns {{ role: string; content: string }[]} Messages suitable for chat-completion APIs.
     */
    private generateMessages(language: 'natural' | 'pseudo'): Array<{ role: string; content: string }> {
        let systemMessage: string;
        if (language === 'natural') {
            systemMessage =
                'The following data represents a program flowchart. Describe the flowchart in simple, natural language.';
        } else {
            systemMessage =
                'The following data represents a program flowchart. Generate pseudocode from the given data.';
        }

        let userMessage: string = '';
        // Füge dem Prompt this.graphNodes hinzu
        this.graphNodes.forEach((node) => {
            userMessage += '\nID: ' + node.id;
            userMessage += '\nNode: ' + node.node;
            userMessage += '\nText: ' + node.text;

            if (node.connections) {
                userMessage += '\nConnections: ';
                node.connections.forEach((connection) => {
                    userMessage += '\nAnchor: ' + connection.anchor;
                    userMessage += '\nDirection: ' + connection.direction;
                    userMessage += '\nConnected To ID: ' + connection.connectedToId;
                    if (connection.text) {
                        userMessage += '\nText: ' + connection.text;
                    }
                });
            }
            userMessage += '\n';
        });

        return [
            {
                role: 'system',
                content: systemMessage,
            },
            {
                role: 'user',
                content: userMessage,
            },
        ];
    }

    /**
     * Toggle path-selection mode for solution checking.
     * When turning off the mode, clears the current selected sequence and any selected
     * node/arrow/rectangle, then triggers a redraw. Also toggles the `active` class on
     * the `#select-button` element (if present).
     *
     * @returns {void}
     */
    selectSequence() {
        // Setze css style von Icon auf aktiv
        const selectButton = this.shadowRoot.getElementById('select-button');
        !this.isSelectingSequence ? selectButton?.classList.add('active') : selectButton?.classList.remove('active');

        this.isSelectingSequence = !this.isSelectingSequence;

        if (!this.isSelectingSequence) {
            this.selectedSequence = [];
        }

        // Deaktive alles ausgewählten Graphelemente
        this.selectedNode = undefined;
        this.selectedArrow = undefined;
        this.selectionRectangle = undefined;

        this.redrawCanvas();
    }

    /**
     * Compare the currently selected path sequence with a task's expected sequence.
     * If length and element-wise id/type match, shows a success message; otherwise
     * shows a failure message. Uses `showSolutionWithMessage()` to display the result.
     *
     * @param {ItemList} task - Task item, optionally containing a `sequence` array of {id, order, type}.
     * @returns {void}
     */
    checkSolution(task: ItemList) {
        // Prüfe, ob die Längen der ausgewählten Sequenz und der Aufgabensequenz übereinstimmen
        if (task.sequence && this.selectedSequence.length === task.sequence.length) {
            for (let i = 0; i < this.selectedSequence.length; i++) {
                // Prüfe, ob die IDs und der Typ jeder Sequenz übereinstimmen
                if (
                    this.selectedSequence[i].id !== task.sequence[i].id ||
                    this.selectedSequence[i].type !== task.sequence[i].type
                ) {
                    this.showSolutionWithMessage(msg('Unfortunately, the selected path is wrong!'));
                    return;
                }
            }
            this.showSolutionWithMessage(msg('The selected path is correct!'));
        } else {
            this.showSolutionWithMessage(msg('Unfortunately, the selected path is wrong!'));
        }
    }

        /**
     * Show or hide one of the widget's overlay menus and move focus to the host.
     *
     * @param {'task'|'flow'|'context'|'preset'|'help'|'translate'} menu - Menu identifier to toggle.
     * @returns {void}
     * @internal
     */
    private toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help' | 'translate') {
        toggleMenu(this, menu);
        this.focus();
    }

    /**
     * Display the context menu near the pointer when the user right-clicks a node or arrow (only in editable mode).
     *
     * @param {MouseEvent} event
     * @returns {void}
     * @internal
     */
    private showContextMenu(event: MouseEvent) {
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
    private openContextMenuAt(clientX: number, clientY: number): boolean {
        if ((!this.allowStudentEdit && !this.hasAttribute("contenteditable"))) {
            return false;
        }

        const rect = this.getBoundingClientRect()
        const { x, y } = this.getCanvasCoordinates(clientX, clientY);

        // Finde den angeklickten Knoten oder Verbindung und speichere sie
        const clickedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);
        const clickedArrowIndex = this.arrows.findIndex((arrow) =>
            isArrowClicked(x, y, arrow.points, this.arrowHitTolerance)
        );

        // Falls ein Element angeklickt wurde, wird das Kontextmenü angezeigt
        if (clickedNode || clickedArrowIndex !== -1) {
            const contextMenu = this.shadowRoot.getElementById('context-menu');
            if (contextMenu) {
                contextMenu.style.display = 'block';
                contextMenu.style.left = clientX - rect.left +"px";
                contextMenu.style.top = clientY - rect.top +"px";

                if (clickedNode) {
                    this.selectedNode = clickedNode;
                    this.selectedArrow = undefined;
                } else {
                    this.selectedArrow = this.arrows[clickedArrowIndex];
                    this.selectedNode = undefined;
                }
                this.redrawCanvas();
                return true;
            }
        }
        return false;
    }

    /** @internal Hit tolerance for arrows; widened for touch so thin lines stay tappable. */
    private get arrowHitTolerance(): number {
        return this.lastPointerType === 'touch' ? 16 : 8;
    }

    /**
     * Programmatically set the selected path sequence.
     * Overwrites the internal `selectedSequence` with the provided ordered descriptors.
     *
     * @param {{ id: string; order: number; type: string }[]} sequence - Ordered selection descriptors.
     * @returns {void}
     */
    setSelectedSequence = (sequence: { id: string; order: number; type: string }[]) => {
        this.selectedSequence = sequence;
    };

    /**
     * Append a new editable task with default title/content to the task list.
     * Useful in edit mode to quickly scaffold tasks.
     *
     * @returns {void}
     */
    private addTask() {
        this.taskList = [...this.taskList, { titel: msg('Title'), content: msg('Task') }];
    }

    /**
     * Append a new editable hint with default title/content to the help list.
     * Useful in edit mode to scaffold hints.
     *
     * @returns {void}
     */
    private addHelp() {
        this.helpList = [...this.helpList, { titel: msg('Title'), content: msg('Hint') }];
    }

    /**
     * Show or hide the solution menu depending on:
     * - Whether path-selection mode is active,
     * - Whether at least one task contains a non-empty `sequence`,
     * - And whether the widget is not in editable mode.
     *
     * Adds/removes the `hidden` class on `.solution-menu`.
     *
     * @returns {void}
     */
    private showSolutionMenu() {
        const solutionMenuElement = this.shadowRoot?.querySelector('.solution-menu');

        if (!solutionMenuElement) {
            return;
        }

        // Prüfen, ob es eine Aufgabe mit einer Sequence gibt
        const taskWithSequenceExists = this.taskList.some((task) => task.sequence?.length);
        if (this.isSelectingSequence && taskWithSequenceExists && !this.isEditable()) {
            solutionMenuElement.classList.remove('hidden');
        } else {
            solutionMenuElement.classList.add('hidden');
        }
    }

    /**
     * Toggle canvas panning ("grab") mode and clear node selection.
     * Delegates to the `grabCanvas()` UI utility to update internal state.
     *
     * @returns {void}
     */
    private grabCanvas() {
        this.isGrabbing = grabCanvas(this, this.isGrabbing);
        this.selectedNode = undefined;
    }

    // ------------------------ Reconnect Arrow Functionality ------------------------

    /**
     * Reconnect arrow endpoints after mutations to `graphNodes`,
     * ensuring `arrow.from` and `arrow.to` point to the current node instances
     * (matched by their `id`). Safe to call after nodes are added/removed/reordered.
     *
     * @returns {void}
     */
    private reconnectArrows() {
        this.arrows.forEach((arrow) => {
            const fromId = arrow.from.id;
            const toId = arrow.to.id;

            const fromNode = this.graphNodes.find((node) => node.id === fromId);
            const toNode = this.graphNodes.find((node) => node.id === toId);

            if (fromNode && toNode) {
                arrow.from = fromNode;
                arrow.to = toNode;
            }
        });
    }

    // ------------------------ Drawer Functionality ------------------------

    /**
     * Full render pipeline:
     * - Clears the canvas and applies the current zoom transform,
     * - Draws the background grid (dots) honoring pan offsets,
     * - Translates by pan offsets and reconnects arrows,
     * - Recomputes arrow point geometry and draws arrows/nodes,
     * - Draws anchors for the selected node/arrow,
     * - Draws a temporary arrow while dragging, and a selection rectangle if active.
     *
     * @returns {void}
     */
    private redrawCanvas() {
		const dpi = window.devicePixelRatio || 1;
        // Bereinige das Canvas und berücksichtigt den Zoom Faktor
        const scaleFactor = this.zoomLevel / 100;
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(scaleFactor * dpi, scaleFactor * dpi);

        // Draw the grid
        const gridSize = this.gridSize;         // base spacing between grid points (unscaled)
        const dotSize = this.dotSize;           // radius of each dot (unscaled)
        const width = this.canvas.width / scaleFactor / dpi;
        const height = this.canvas.height / scaleFactor / dpi;

        this.ctx.fillStyle = "#104e8b";

        // Draw dots in grid
        for (let x = this.canvasOffsetX % gridSize; x < width; x += gridSize) {
            for (let y = this.canvasOffsetY % gridSize; y < height; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }

        this.ctx.translate(this.canvasOffsetX, this.canvasOffsetY)

        // this.getUserSettings();

        this.reconnectArrows();

        // Zeichne alle Verbindungen
        this.arrows.forEach((arrow) => {
            const isSelected = arrow === this.selectedArrow;
            arrow.points = generateArrowPoints(this.ctx, arrow);
            drawArrow(this.ctx, arrow, this.graphSettings, isSelected, this.selectedSequence);
        });

        // Zeichne alle Knoten
        this.graphNodes?.forEach((element) => {
            drawGraphNode(this.ctx, element, this.graphSettings, this.selectedNodes, this.selectedSequence);
        });

        // Zeichne die Ankerpunkte für das ausgewählte Element, falls vorhanden
        if (this.selectedNode) {
            drawNodeAnchors(this.ctx, this.selectedNode, this.hoveredAnchor);
        }

        // Zeichne Ankerpunkte des Pfeils, wenn dieser ausgewählt ist
        this.arrows.forEach((arrow) => {
            const isSelected = arrow === this.selectedArrow;
            if (isSelected) {
                drawArrowAnchor(this.ctx, arrow, this.isArrowAnchorHovered, this.graphSettings);
            }
        });

        //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen, falls vorhanden
        if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
            drawTempArrow(this.ctx, this.arrowStart, this.tempArrowEnd);
        }

        if (this.selectionRectangle) {
            drawSelectionField(this.ctx, this.selectionRectangle);
        }

        // Speichere die aktuellen Knoten und Verbindungen als Attribute
        // this.setAttribute('graph-nodes', JSON.stringify(this.graphNodes));
        // this.setAttribute('task-list', JSON.stringify(this.taskList));
        // this.setAttribute('help-list', JSON.stringify(this.helpList));
    }

    /** @internal Cyclic index used by `addGraphNode()` to stagger the placement of quickly inserted nodes, preventing complete overlap. Values rotate through 0 → 1 → 2 → 0 ... */
    private addGraphNodeIndex = 0;

    /**
     * Adds a new graph node of the given type at the current viewport center.
     * The node is appended to `graphNodes` and the canvas is redrawn.
     * @param {'start'|'end'|'op'|'decision'|'connector'|'i/o'|'sub'|'text'} node - Node type.
     * @param {string} text - Initial text label for the node.
     * @returns {void}
     */
    private addGraphNode(
        node: 'start' | 'end' | 'op' | 'decision' | 'connector' | 'i/o' | 'sub' | 'text',
        text: string
    ) {
        const workspace = this.shadowRoot?.querySelector('.workspace') as HTMLElement;
		const dpi = window.devicePixelRatio || 1;
        const scaleFactor = this.zoomLevel / 100;
        let centerX = (this.canvas.width / dpi * 0.4 + workspace.scrollLeft) / scaleFactor - this.canvasOffsetX;
        let centerY = (this.canvas.height / dpi * 0.4 + workspace.scrollTop) / scaleFactor - this.canvasOffsetY;

        switch (this.addGraphNodeIndex) {
            case 0:
                centerX += 0;
                centerY += 0;
                break;
            case 1:
                centerX -= 40;
                centerY += 20;
                break;
            case 2:
                centerX += 40;
                centerY += 40;
                break;
            default:
                centerX += 0;
                centerY += 0;
        }

        const element: GraphNode = {
            id: uuidv4(),
            node: node,
            text: text,
            x: centerX,
            y: centerY,
        };

        this.addGraphNodeIndex = (this.addGraphNodeIndex + 1) % 3;

        this.graphNodes = [...this.graphNodes, element];
        this.reconnectArrows();
        drawGraphNode(this.ctx, element, this.graphSettings, this.selectedNodes, this.selectedSequence);
    }

    // ------------------------ Pointer-Events (mouse / touch / pen) ------------------------

    /**
     * @internal Unified pointer entry point. Tracks every active pointer so that
     * multi-touch gestures (two-finger pinch-zoom and pan) can be distinguished
     * from single-pointer interactions (drag, arrow creation, selection).
     */
    private handlePointerDown(event: PointerEvent) {
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
            this.canvas.setPointerCapture(event.pointerId);
        } catch (e) { }

        if (event.pointerType !== 'mouse') {
            this.startLongPress(event.clientX, event.clientY);
        }

        this.handleMouseDown(event);
    }

    /** @internal Unified pointer move: routes to the pinch gesture or the single-pointer logic. */
    private handlePointerMove(event: PointerEvent) {
        if (this.activePointers.has(event.pointerId)) {
            this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        }

        if (this.longPressOrigin) {
            const moved = Math.hypot(
                event.clientX - this.longPressOrigin.x,
                event.clientY - this.longPressOrigin.y
            );
            if (moved > FlowchartWidget.LONG_PRESS_MOVE_TOLERANCE) {
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
    private handlePointerUp(event: PointerEvent) {
        this.cancelLongPress();
        this.activePointers.delete(event.pointerId);
        try {
            this.canvas.releasePointerCapture(event.pointerId);
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
    private handlePointerCancel(event: PointerEvent) {
        this.cancelLongPress();
        this.activePointers.delete(event.pointerId);
        try {
            this.canvas.releasePointerCapture(event.pointerId);
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
    private endMultiTouchGesture() {
        if (this.activePointers.size === 0) {
            this.suppressSinglePointer = false;
            return;
        }

        if (this.activePointers.size === 1 && this.isGrabbing) {
            const [remaining] = [...this.activePointers.values()];
            const grabCoordinates = this.getCanvasCoordinates(remaining.x, remaining.y, true);
            this.grabStartPosition = { x: grabCoordinates.x, y: grabCoordinates.y };
            this.grabStartOffset = {
                x: parseFloat(this.canvas.style.getPropertyValue('--offset-x')),
                y: parseFloat(this.canvas.style.getPropertyValue('--offset-y')),
            };
            this.suppressSinglePointer = false;
        }
    }

    /** @internal Euclidean distance between the two active pointers (screen px). */
    private pinchDistance(): number {
        const pts = [...this.activePointers.values()];
        return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }

    /** @internal Midpoint between the two active pointers (screen coordinates). */
    private pinchMidpoint(): { x: number; y: number } {
        const pts = [...this.activePointers.values()];
        return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    }

    /** @internal Initialise a two-finger pinch gesture. Requires pan/edit permission. */
    private beginPinch() {
        if (!(this.allowStudentPan || this.hasAttribute('contenteditable'))) {
            return;
        }
        const mid = this.pinchMidpoint();
        this.pinchState = {
            startDist: this.pinchDistance(),
            startZoom: this.zoomLevel,
            lastMidX: mid.x,
            lastMidY: mid.y,
        };
    }

    /** @internal Apply the current two-finger gesture: pan by midpoint movement, zoom by finger spread. */
    private updatePinch() {
        if (!this.pinchState) {
            return;
        }
        const rect = this.canvas.getBoundingClientRect();
        const dist = this.pinchDistance();
        const mid = this.pinchMidpoint();

        // Pan
        const scale = this.zoomLevel / 100;
        this.canvasOffsetX += (mid.x - this.pinchState.lastMidX) / scale;
        this.canvasOffsetY += (mid.y - this.pinchState.lastMidY) / scale;
        this.pinchState.lastMidX = mid.x;
        this.pinchState.lastMidY = mid.y;

        // Zoom
        if (this.pinchState.startDist > 0) {
            const targetZoom = this.pinchState.startZoom * (dist / this.pinchState.startDist);
            this.zoomAtPoint(mid.x - rect.left, mid.y - rect.top, targetZoom);
        } else {
            this.redrawCanvas();
        }
    }

    /** @internal Recognise a double tap and run the double-click logic (label editing). */
    private detectDoubleTap(event: PointerEvent) {
        // Wurde gezogen, ist es kein Tippen; eine begonnene Doppeltipp-Folge verfällt.
        const start = this.singlePointerStart;
        const moved = start
            ? Math.hypot(event.clientX - start.x, event.clientY - start.y)
            : Number.POSITIVE_INFINITY;
        this.singlePointerStart = undefined;

        if (moved > FlowchartWidget.LONG_PRESS_MOVE_TOLERANCE) {
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
            gap <= FlowchartWidget.DOUBLE_TAP_DELAY &&
            distance <= FlowchartWidget.DOUBLE_TAP_DISTANCE
        ) {
            // Zurücksetzen, damit ein drittes Tippen nicht sofort erneut auslöst
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
    private startLongPress(clientX: number, clientY: number) {
        this.cancelLongPress();
        this.longPressOrigin = { x: clientX, y: clientY };
        this.longPressTimer = setTimeout(
            () => this.triggerLongPress(clientX, clientY),
            FlowchartWidget.LONG_PRESS_DELAY
        );
    }

    /** @internal Disarm a pending long press (movement, release or a second finger). */
    private cancelLongPress() {
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
    private triggerLongPress(clientX: number, clientY: number) {
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
    private cancelSinglePointerInteraction() {
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

        this.redrawCanvas();
    }

    // ------------------------ Mouse-Events ------------------------

    /** @internal Handles mousedown on the canvas (selection, drag, arrow creation). */
    private handleMouseDown(event: MouseEvent) {
        const { x, y } = this.getMouseCoordinates(event);
        const nodeUnderCursor = findLastGraphNode(this.ctx, this.graphNodes, x, y);

        if (!nodeUnderCursor || !this.selectedNodes.includes(nodeUnderCursor)) {
            this.selectedNodes = [];
            this.draggedNodes = [];
        }

        // Handhabung wenn Knoten gezogen wird
        if (!this.isGrabbing) {
            if ((!this.allowStudentEdit && !this.hasAttribute("contenteditable"))) {
                return;
            }

            if (this.selectedNodes.length > 1) {
                const { draggedNodes, isDragging, dragOffset } = handleMultipleNodesDragStart(
                    this.ctx,
                    x,
                    y,
                    this.selectedNodes,
                    this.selectedArrow
                );
                this.draggedNodes = draggedNodes;
                this.isDragging = isDragging;
                this.dragOffset = dragOffset;
            } else {
                const { draggedNode, isDragging, dragOffset } = handleNodeDragStart(
                    this.ctx,
                    x,
                    y,
                    this.graphNodes,
                    this.selectedArrow
                );
                this.draggedNode = draggedNode;
                this.isDragging = isDragging;
                this.dragOffset = dragOffset;
            }
        }

        if (this.isGrabbing) {
            // Update Offset von Canvwas wenn dieser gezogen wird
            const grabCoordinates = this.getMouseCoordinates(event, true)
            this.grabStartPosition = { x: grabCoordinates.x, y: grabCoordinates.y };
            const offsetX = parseFloat(this.canvas.style.getPropertyValue('--offset-x'));
            const offsetY = parseFloat(this.canvas.style.getPropertyValue('--offset-y'));
            this.grabStartOffset = { x: offsetX, y: offsetY };
        } else {
            // Wenn ein Pfeil gezogen wird, wird ein temporärer gestrichelter Pfeil gezeichnet
            const { arrowToMove, arrowStart } = handleArrowDragStart(
                this.ctx,
                x,
                y,
                this.graphNodes,
                this.selectedArrow,
                this.handleAnchorClick.bind(this)
            );

            if (arrowToMove && arrowStart) {
                this.arrowStart = arrowStart;
                this.arrows = this.arrows.filter((arrow) => arrow !== arrowToMove);
            }
        }

        if (!nodeUnderCursor && !this.isGrabbing && !this.selectedNode) {
            if ((!this.allowStudentEdit && !this.hasAttribute("contenteditable"))) {
                return;
            }

            this.selectionRectangle = { x, y, width: 0, height: 0 };
        }
    }

    /** @internal Handles mouseup on the canvas (finalizing drag or arrow creation). */
    private handleMouseUp(event: MouseEvent) {
        if (this.selectionRectangle) {
            this.selectionRectangle = undefined;
        } else if (this.isGrabbing && this.grabStartPosition) {
            // Setze die Grabposition des Canvas zurück, nachdem dieser gezogen wurde
            const { grabStartPosition, grabStartOffset } = handleGrabRelease();
            this.grabStartPosition = grabStartPosition;
            this.grabStartOffset = grabStartOffset;
        } else {
            if (this.isDragging) {
                // Füge diese Zeile hinzu, um die Knotenposition basierend auf dem Schwellenwert zu aktualisieren
                if (this.selectedNodes.length === 0) {
                    snapNodePosition(this.ctx, this.draggedNode, this.graphNodes, 8);
                }

                // Setze die Informationen zurück, nachdem ein Knoten gezogen wurde
                const { isDragging } = handleNodeDragStop();
                this.isDragging = isDragging;
            } else if (this.isDrawingArrow) {
                // Erstelle ggf. die Pfeilverbindung, nachdem ein Pfeil losgelassen wurde
                const { x, y } = this.getMouseCoordinates(event);
                const { tempArrowEnd, arrowStart, arrows } = handleArrowCreation(
                    this.ctx,
                    x,
                    y,
                    this.arrowStart,
                    this.graphNodes,
                    this.arrows
                );

                this.tempArrowEnd = tempArrowEnd;
                this.arrowStart = arrowStart;
                this.arrows = arrows;
                this.isDrawingArrow = false;
            }
        }

        // Resette einmalige Schranke fürs draggen mehrerer Knoten
        this.checkOffset = true;

        this.graphNodes = [...this.graphNodes];

        this.redrawCanvas();
    }

    /** @internal Handles mousemove on the canvas (dragging/panning/hover anchors). */
    private handleMouseMove(event: MouseEvent) {
        const { x, y } = this.getMouseCoordinates(event);
        if (this.selectionRectangle) {
            this.selectionRectangle.width = x - this.selectionRectangle.x;
            this.selectionRectangle.height = y - this.selectionRectangle.y;
            this.selectedNodes = this.graphNodes.filter((node) =>
                isNodeInRectangle(this.ctx, node, this.selectionRectangle)
            );
            this.redrawCanvas();
        } else if (this.isGrabbing && this.grabStartPosition && this.grabStartOffset) {
            const grabCoordinates = this.getMouseCoordinates(event, true)
            const deltaX = grabCoordinates.x - this.grabStartPosition.x;
            const deltaY = grabCoordinates.y - this.grabStartPosition.y;

            // Aktualisiere das Canvas Offset
            this.canvasOffsetX = this.canvasOffsetX + deltaX
            this.canvasOffsetY = this.canvasOffsetY + deltaY

            // Aktualisiere das Canvas anhand der Mausbewegung
            const offsetX = parseFloat(this.canvas.style.getPropertyValue('--offset-x'));
            const offsetY = parseFloat(this.canvas.style.getPropertyValue('--offset-y'));
            this.canvas.style.setProperty('--offset-x', `${offsetX + (deltaX * this.zoomLevel) / 100}px`);
            this.canvas.style.setProperty('--offset-y', `${offsetY + (deltaY * this.zoomLevel) / 100}px`);

            // Zeichne das aktualisierte Canvas
            this.redrawCanvas();

            // Aktualisiere die grabStartPosition auf die aktuelle Mausposition
            this.grabStartPosition = { x: grabCoordinates.x, y: grabCoordinates.y };
        } else {
            if (this.isDragging && this.draggedNodes.length > 1) {
                let deltaX: number;
                let deltaY: number;

                if (this.checkOffset) {
                    deltaX = this.dragOffset.x;
                    deltaY = this.dragOffset.y;

                    const nodeUnderCursor = findLastGraphNode(this.ctx, this.graphNodes, x, y);
                    this.draggedNodes.forEach((node) => {
                        node.x = node.x + deltaX + (nodeUnderCursor.x - x);
                        node.y = node.y + deltaY + (nodeUnderCursor.y - y);
                    });

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

                this.redrawCanvas();
            } else if (this.isDragging && this.draggedNode) {
                this.draggedNode.x = x - this.dragOffset.x;
                this.draggedNode.y = y - this.dragOffset.y;
                this.redrawCanvas();
            } else if (this.isDrawingArrow && this.arrowStart && (this.selectedNode || this.selectedArrow)) {
                const { x, y } = this.getMouseCoordinates(event);

                this.tempArrowEnd = { x, y };

                this.redrawCanvas();
            }
        }

        // Highlighte den Ankerpunkt, falls der Benutzer über diesen kommt
        const { hoveredAnchor, isArrowAnchorHovered } = highlightAnchor(
            this.ctx,
            this.selectedNode,
            this.selectedArrow,
            x,
            y
        );
        this.hoveredAnchor = hoveredAnchor;
        this.isArrowAnchorHovered = isArrowAnchorHovered;
        this.redrawCanvas();
    }

    /** @internal Handles clicks (select node/arrow, reorder for z-index, context menu). */
    private handleClick(event: MouseEvent) {
        const { x, y } = this.getMouseCoordinates(event);

        if (this.isSelectingSequence) {
            handleSequenceSelection(this.ctx, this.selectedSequence, this.graphNodes, this.arrows, x, y);
            this.redrawCanvas();
        } else {
            if (!this.isGrabbing) {
                if ((!this.allowStudentEdit && !this.hasAttribute("contenteditable"))) {
                    return;
                }

                if (this.draggedNodes.length === 0) {
                    // Setze das angeklickte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
                    this.selectedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);
                    const selectedNodeIndex = this.graphNodes.lastIndexOf(this.selectedNode);
                    // Packe das ausgewählte Element ans Ende des Arrays, damit es über den anderen Elementen erscheint
                    if (this.selectedNode && !this.isDragging) {
                        this.graphNodes.splice(selectedNodeIndex, 1);
                        this.graphNodes.push(this.selectedNode);
                    }

                    this.updateAnchorListeners();
                }
                // Finde den angeklickte Pfeilindex, oder entferne die Auswahl, wenn kein Pfeil angeklickt wurde
                const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points, this.arrowHitTolerance));
                // Wenn ein Pfeil angeklickt wurde, setze die property selectedArrow auf den angeklickten Pfeil
                // und verändere die Reihenfolge im Array, damit der angeklickte Pfeil immer vollständig gefärbt angezeigt wird
                if (selectedArrowIndex !== -1) {
                    this.selectedArrow = this.arrows[selectedArrowIndex];
                    this.arrows.splice(selectedArrowIndex, 1);
                    this.arrows.push(this.selectedArrow);
                    this.redrawCanvas();
                } else if (this.selectedArrow) {
                    this.selectedArrow = undefined;
                    this.redrawCanvas();
                }

                // Zeichne den Canvas neu, um die aktualisierte Auswahl anzuzeigen
                this.redrawCanvas();
            }
        }
    }

    /** @internal Handles double clicks (open edit prompts). */
    private handleDoubleClick(event: MouseEvent) {
        if ((!this.allowStudentEdit && !this.hasAttribute("contenteditable"))) {
            return;
        }

        const { x, y } = this.getMouseCoordinates(event);
        const clickedNodeIndex = findGraphNodeLastIndex(this.ctx, this.graphNodes, x, y);
        const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points, this.arrowHitTolerance));

        if (clickedNodeIndex !== -1 && this.graphNodes[clickedNodeIndex].node !== 'connector') {
            handleGraphNodeDoubleClick(clickedNodeIndex, (type, index) => this.showCustomPrompt(type, index));
        } else if (selectedArrowIndex !== -1) {
            handleArrowDoubleClick(selectedArrowIndex, (type, index) => this.showCustomPrompt(type, index));
        }
    }

    /** @internal Begin arrow creation from a node anchor. */
    private handleAnchorClick(node: GraphNode, anchor: number) {
        if(this.isArrowAnchorHovered) {
            return
        }
        this.isDrawingArrow = true;
        this.arrowStart = { node, anchor };
    }

    /** @internal Cached mousedown listener for node anchors; installed on the canvas when a node is selected. */
    private anchorMouseDownEvent: ((event: MouseEvent) => void) | null = null;

    /** @internal Update anchor pointer listeners based on the selected node. */
    private updateAnchorListeners() {
        if (this.selectedNode && this.selectedNode.node !== 'text') {
            const anchors = getAnchors(this.ctx, this.selectedNode, 15);

            // Entferne zuerst den bestehenden pointerdown-EventListener, falls vorhanden
            if (this.anchorMouseDownEvent && this.canvas) {
                this.canvas.removeEventListener('pointerdown', this.anchorMouseDownEvent);
                this.anchorMouseDownEvent = null;
            }

            // Erstelle den neuen EventListener und speicher ihn in der anchorMouseDownEvent-Variable
            this.anchorMouseDownEvent = (event) => {
                const { x, y } = this.getMouseCoordinates(event);
                // Größere Trefferfläche für Finger, damit Pfeile auf Touch-Geräten erstellbar sind
                const hitRadius = this.lastPointerType === 'touch' ? 18 : 8;
                anchors.forEach((position, index) => {
                    const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
                    if (distance <= hitRadius) {
                        this.handleAnchorClick(this.selectedNode, index);
                    }
                });
            };

            // Füge den neuen EventListener hinzu
            if (this.canvas) {
                this.canvas.addEventListener('pointerdown', this.anchorMouseDownEvent);
            }
        }
    }

    // ------------------------ Lifecycle ------------------------

    /** @internal Lit lifecycle: canvas setup, zoom/apply, initial redraw. */
    firstUpdated() {
        // console.log('firstUpdated');

        // console.log('this', this.taskList.length);

        this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
		const dpi = window.devicePixelRatio || 1;
        this.canvas.width = this.clientWidth * dpi;
        this.canvas.height = this.currentHeight * dpi;
        const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.updateCanvasOffset(); // Offset aktualisieren

        this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);

        this.applyZoom();
        this.redrawCanvas();
        this.updateTouchAction();

        if(this.allowStudentPan && !this.allowStudentEdit && !this.hasAttribute("contenteditable")){
            this.isGrabbing = true
        }
    }

    /** @internal Lifecycle: wire global listeners and custom events. */
    connectedCallback() {
        super.connectedCallback();
        // window.addEventListener('resize', this.updateCanvasSize);
        window.addEventListener('keydown', this.handleKeyDown);

        // Konvertiert das Array in einen String und setzt es als Attribut
        //this.setAttribute('graph-nodes', JSON.stringify(this.graphNodes));

        this.resizeObserver.observe(this);
        this.addEventListener('fullscreenchange', this.syncLayout);
        this.addEventListener('startSelectSequence', this.selectSequence);
    }

    /** @internal Lifecycle: teardown listeners. */
    disconnectedCallback() {
        // window.removeEventListener('resize', this.updateCanvasSize);
        window.removeEventListener('keydown', this.handleKeyDown);

        this.cancelLongPress();
        this.resizeObserver.disconnect();
        this.removeEventListener('fullscreenchange', this.syncLayout);
        this.removeEventListener('startSelectSequence', this.selectSequence.bind(this));
        super.disconnectedCallback();
    }

    /** @internal Lit lifecycle: re-render after contentEditable changes; auto-delete empty items. */
    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('contentEditable') && this.isEditable()) {
            autoDeleteEmptyItems(
                this,
                this.taskList,
                '.task-container',
                '.task-wrapper',
                '.task-title',
                '.task-content'
            );
            autoDeleteEmptyItems(
                this,
                this.helpList,
                '.help-container',
                '.help-wrapper',
                '.help-title',
                '.help-content'
            );
        }
        updateDisabledState(this, this.isEditable());
        this.updateTouchAction();
        this.applyOptionChanges(changedProperties);
    }

    /** @internal Apply changed options to the running canvas. */
    private applyOptionChanges(changedProperties: Map<string, any>) {
        if (!this.canvas || !this.ctx) {
            return;
        }

        if (changedProperties.has('zoomLevel')) {
            // Also triggers redraw
            this.applyZoom();
        } else if (
            changedProperties.has('font') ||
            changedProperties.has('fontSize') ||
            changedProperties.has('theme')
        ) {
            this.redrawCanvas();
        }
    }

    /**
     * When the 'graph-nodes' attribute changes, parse the JSON to `graphNodes`,
     * recompute `arrows`, and redraw the canvas.
     * @param {string} name
     * @param {string} oldVal
     * @param {string} newVal
     */
    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        super.attributeChangedCallback(name, oldVal, newVal);
        if (name === 'graph-nodes') {
            try {
                // Konvertiert den String zurück in ein Array
                this.graphNodes = JSON.parse(newVal);
                this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);
                this.reconnectArrows();

                this.redrawCanvas();
            } catch (e) {
                console.error('Invalid JSON in graph-nodes attribute:', e);
            }
        }
    }

    // ------------------------ General System Functionality ------------------------

    /** @internal Keep the canvas `touch-action` in sync with interactivity. */
    private updateTouchAction() {
        if (!this.canvas) return;
        const interactive =
            this.allowStudentEdit || this.allowStudentPan || this.hasAttribute('contenteditable');
        this.canvas.style.touchAction = interactive ? 'none' : 'auto';
    }

    /** @internal Recompute canvas dimensions and trigger redraw. */
    updateCanvasSize = () => {
		const dpi = window.devicePixelRatio || 1;
        this.canvas.width = this.clientWidth * dpi;
        this.canvas.height = this.currentHeight * dpi;

        const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.redrawCanvas();
    };

    /** @internal Apply the current zoom level (50–200%) and redraw. */
    private applyZoom() {
		const dpi = window.devicePixelRatio || 1;
        const scaleFactor = this.zoomLevel / 100;
        this.ctx.resetTransform();
        this.ctx.scale(scaleFactor * dpi, scaleFactor * dpi);
        this.canvas.style.setProperty('--scaled-grid-size', `${scaleFactor * this.gridSize}px`);
        this.canvas.style.setProperty('--scaled-grid-dot-size', `${scaleFactor * this.dotSize}px`);
        this.redrawCanvas();
    }

    /**
     * Clears all nodes and arrows; resets selection and temporary state; redraws the canvas.
     * @returns {void}
     */
    private clearAll() {
        this.graphNodes = [];
        this.selectedNode = undefined;
        this.arrows = [];
        this.arrowStart = undefined;
        this.redrawCanvas();
    }

    /** @internal Delete selected node(s) or arrow; maintain connections; redraw. */
    private deleteSelectedObject() {
        // Falls ein Knoten ausgewählt wurde, lösche den Knoten und alle zugehören Verbindungen
        if (this.selectedNodes) {
            this.selectedNodes.forEach((node) => {
                // Entferne ausgewählten Knoten
                this.graphNodes = this.graphNodes.filter((n) => n !== node);
                // console.log('nach dem löschen', this.graphNodes);
                // Entferne die Verbindungsinformationen für alle betroffenen Knoten
                this.arrows.forEach((arrow) => {
                    if (arrow.from === node || arrow.to === node) {
                        removeOldConnection(arrow.from, arrow.to);
                    }
                });

                // Entferne alle Pfeile, die mit den gelöschten Elementen verbunden sind
                this.arrows = this.arrows.filter((arrow) => arrow.from !== node && arrow.to !== node);
            });

            this.selectedNodes = [];
        }

        if (this.selectedNode) {
            this.graphNodes = this.graphNodes.filter((node) => node !== this.selectedNode);

            this.arrows.forEach((arrow) => {
                if (arrow.from === this.selectedNode || arrow.to === this.selectedNode) {
                    removeOldConnection(arrow.from, arrow.to);
                }
            });

            this.arrows = this.arrows.filter(
                (arrow) => arrow.from !== this.selectedNode && arrow.to !== this.selectedNode
            );

            this.selectedNode = undefined;
        } else if (this.selectedArrow) {
            const fromNode = this.selectedArrow.from
            const toNode = this.selectedArrow.to

            // Entferne die Verbindungsinformation vom Startknoten 
            if (fromNode.connections) {
                fromNode.connections = fromNode.connections.filter(
                    (connection) => connection.arrowID !== this.selectedArrow.id
                );
            }

            // Entferne die Verbindungsinformation vom Endknoten 
            if (toNode.connections) {
                toNode.connections = toNode.connections.filter(
                    (connection) => connection.arrowID !== this.selectedArrow.id
                );
            }

            // Entferne den ausgewählten Pfeil
            this.arrows = this.arrows.filter((arrow) => arrow !== this.selectedArrow);
            this.selectedArrow = undefined;
        }

        this.toggleMenu('context');
        this.redrawCanvas();
    }

    /**
     * Converts a mouse event to world coordinates, accounting for zoom and pan.
     * @param {MouseEvent} event
     * @param {boolean} [withoutPan=false] - If true, ignore current pan offsets.
     * @returns {{x:number,y:number}}
     */
    private getMouseCoordinates(event: MouseEvent, withoutPan?: boolean) {
        return this.getCanvasCoordinates(event.clientX, event.clientY, withoutPan);
    }

    /**
     * Converts a viewport position to world coordinates, accounting for zoom and pan.
     *
     * @param {number} clientX - Viewport X position.
     * @param {number} clientY - Viewport Y position.
     * @param {boolean} withoutPan - If true, ignore current pan offsets.
     * @returns {{x:number,y:number}}
     * @internal
     */
    private getCanvasCoordinates(clientX: number, clientY: number, withoutPan?: boolean) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleFactor = this.zoomLevel / 100;
    
        // Position relative to the top-left corner of the canvas
        let x = (clientX - rect.left);
        let y = (clientY - rect.top);
    
        // Apply scaling and panning only if not bypassed
        if (!withoutPan) {
            x = x / scaleFactor - this.canvasOffsetX;
            y = y / scaleFactor - this.canvasOffsetY;
        } else {
            x = x / scaleFactor;
            y = y / scaleFactor;
        }
    
        return { x, y };
    }

    /**
     * Update canvas offset CSS variables when the workspace scrolls.
     * Keeps pointer-to-world mapping consistent during scrolling.
     *
     * @param {Event} event
     * @returns {void}
     */
    private handleScroll(event: Event) {
        this.updateCanvasOffset();
    }

    /**
     * Zoom the canvas around the mouse pointer when panning is allowed or in edit mode.
     * Prevents default wheel behavior, clamps zoom to [50, 200], and adjusts pan offsets
     * so the world point under the cursor remains stable across zoom steps.
     *
     * Requires the widget to be focused (`:focus-within`) to activate.
     *
     * @param {WheelEvent} event
     * @returns {void}
     */
    private handleWheel(event: WheelEvent) {
        if ((this.allowStudentPan || this.hasAttribute("contenteditable")) && this.matches(':focus-within')) {
            event.preventDefault();
    
            // Get pointer position relative to canvas (screen space)
            const rect = this.canvas.getBoundingClientRect();
            const delta = event.deltaY < 0 ? 10 : -10;
            this.zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, this.zoomLevel + delta);
        }
    }

    /**
     * Zoom to a target level while keeping the world point under a given screen position stable.
     * Shared by mouse-wheel zoom and two-finger pinch zoom. Clamps the zoom to [50, 200].
     *
     * @param {number} screenX - X position within the canvas (px, relative to its top-left).
     * @param {number} screenY - Y position within the canvas (px, relative to its top-left).
     * @param {number} targetZoom - Desired zoom percentage (clamped to [50, 200]).
     * @returns {void}
     * @internal
     */
    private zoomAtPoint(screenX: number, screenY: number, targetZoom: number) {
        // Convert to world space before zoom
        const prevScale = this.zoomLevel / 100;
        const worldXBefore = screenX / prevScale - this.canvasOffsetX;
        const worldYBefore = screenY / prevScale - this.canvasOffsetY;
    
        // Apply and clamp the new zoom level
        this.zoomLevel = Math.max(50, Math.min(200, Math.round(targetZoom)));
        const newScale = this.zoomLevel / 100;
    
        // Adjust canvas offset to keep world point under anchor stable
        this.canvasOffsetX = screenX / newScale - worldXBefore;
        this.canvasOffsetY = screenY / newScale - worldYBefore;
    
        // Apply the zoom
        this.applyZoom();
    }
    

    /** @internal Sync CSS offset variables to the canvas bounding rect. */
    private updateCanvasOffset() {
        const offsetX = this.canvas.getBoundingClientRect().left;
        const offsetY = this.canvas.getBoundingClientRect().top;
        this.canvas.style.setProperty('--offset-x', `${offsetX}px`);
        this.canvas.style.setProperty('--offset-y', `${offsetY}px`);
    }

    /** @internal Key bindings (delete/backspace to remove selected item). */
    private handleKeyDown = (event: KeyboardEvent) => {
        const customPrompt = this.shadowRoot?.querySelector('custom-prompt');
        const confirmPrompt = this.shadowRoot?.querySelector('confirm-prompt');

        if (
            (event.key === 'Backspace' || event.key === 'Delete') &&
            customPrompt?.classList.contains('hidden') &&
            confirmPrompt?.classList.contains('hidden')
        ) {
            this.deleteSelectedObject();
        }
    };

    /** @internal Drag-resize handle for widget height. */
    private handleYResizeEnd(event: MouseEvent) {
        this.currentHeight = Math.max(400, this.currentHeight + event.offsetY);
        this.height = this.currentHeight;
        //update css var

        this.updateCanvasSize();
        this.redrawCanvas();
    }

    /** @internal Toggle fullscreen. The resulting layout change is picked up by `syncLayout`. */
    private toggleFullscreen() {
        if (this.isFullscreen) {
            this.ownerDocument.exitFullscreen();
        } else {
            this.requestFullscreen({ navigationUI: 'hide' });
        }
    }

    /** @internal Whether this widget is the fullscreen element. */
    private get isFullscreen(): boolean {
        return this.ownerDocument.fullscreenElement === this;
    }

    /** @internal Update canvas with the current fullscreen state and height. */
    private syncLayout = () => {
        if (!this.canvas) return;

        const fullscreen = this.isFullscreen;

        if (fullscreen !== this.fullscreen) {
            this.shadowRoot.querySelector('.flowchart-menu').classList.toggle('fullscreen', fullscreen);
            this.fullscreen = fullscreen;
        }

        this.currentHeight = fullscreen ? this.clientHeight : this.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '';
        this.updateCanvasSize();
    };

    // ------------------------ Prompt Functionality ------------------------

    /**
     * Store an arrow label so it survives serialization.
     *
     * @param {Arrow} arrow - The arrow whose label changed.
     * @param {string} text - The new label.
     * @returns {void}
     * @internal
     */
    private persistArrowText(arrow: Arrow, text: string) {
        arrow.text = text;

        const connection = arrow.from?.connections?.find(
            (candidate) => candidate.arrowID === arrow.id && candidate.direction === 'to'
        );

        if (connection) {
            connection.text = text;
        }
    }

    /**
     * @internal Make sure Lit notices changes to `graphNodes` after in-place edits.
     */
    private commitGraphNodes() {
        this.graphNodes = [...this.graphNodes];
    }

    /** @internal Open input prompt for node/arrow text editing. */
    private showCustomPrompt(type: 'node' | 'arrow', index: number) {
        const promptElement = this.shadowRoot.querySelector('custom-prompt') as CustomPrompt;
        // console.log(promptElement)
        const currentText = (type === 'node' ? this.graphNodes[index].text : this.arrows[index].text || '').trim();

        promptElement.classList.remove('hidden');
        this.shadowRoot.querySelector('custom-prompt').classList.remove('hidden');

        promptElement.setInputValue(currentText);
        promptElement.focusInput();

        const onSubmit = (rawValue: string) => {
        
            const value = (rawValue || '').trim();

            if (type === 'node') {
                const node = this.graphNodes[index];
                const text = value || FlowchartWidget.label(node.node);
                node.text = node.node === 'decision' ? '  ' + text + '  ' : text;
            } else {
                this.persistArrowText(this.arrows[index], value);
            }

            // Beide Fälle ändern graphNodes nur in-place; erst das macht sie im Attribut sichtbar
            this.commitGraphNodes();
            this.redrawCanvas();
            this.shadowRoot.querySelector('custom-prompt').classList.add('hidden');
        };

        const onCancel = () => {
            this.shadowRoot.querySelector('custom-prompt').classList.add('hidden');
        };

        promptElement.onSubmit = onSubmit;
        promptElement.onCancel = onCancel;
    }

    /** @internal Open confirm prompt to clear all content. */
    private showConfirmPrompt() {
        const confirmPrompt = this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt;
        confirmPrompt.classList.remove('hidden');
        confirmPrompt.enableKeyListener();

        const onSubmit = () => {
            confirmPrompt.disableKeyListener();
            this.clearAll();
            confirmPrompt.classList.add('hidden');
        };

        const onCancel = () => {
            confirmPrompt.classList.add('hidden');
            confirmPrompt.disableKeyListener();
        };

        (this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt).onConfirm = onSubmit;
        (this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt).onCancel = onCancel;
    }

    /** @internal Hide any open prompts and disable related key listeners. */
    private hidePrompt() {
        const customPrompt = this.shadowRoot.querySelector('custom-prompt');
        const confirmPrompt = this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt;

        if (customPrompt) {
            customPrompt.classList.add('hidden');
        }

        if (confirmPrompt) {
            confirmPrompt.classList.add('hidden');
            confirmPrompt.disableKeyListener();
        }
    }

    /** @internal Handle prompt submissions, update text, reorder arrows for z-index. */
    private handlePromptSubmit(event: CustomEvent) {
        const newText = event.detail.value;

        if (this.promptType === 'node') {
            this.graphNodes[this.promptIndex].text = newText;
        } else if (this.promptType === 'arrow') {
            const selectedArrow = this.arrows[this.promptIndex];
            this.persistArrowText(selectedArrow, newText);
            this.arrows.splice(this.promptIndex, 1);
            this.arrows.push(selectedArrow);
        }
        this.commitGraphNodes();
        this.redrawCanvas();
        this.hidePrompt();
    }

    /** @internal Show solution overlay with a message. */
    private showSolutionWithMessage(message: string) {
        this.solutionMessage = message;
        this.showSolution = true;
    }

    /** @internal Close the solution overlay. */
    private closeSolution() {
        this.showSolution = false;
    }
}
