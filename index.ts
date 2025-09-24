import { LitElementWw } from '@webwriter/lit';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

import { GraphNode } from './src/definitions/GraphNode';
import { Arrow } from './src/definitions/Arrow';
import { ItemList } from './src/definitions/ItemList';

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
 * @attr {boolean} allow-student-edit - Enables student editing (adding, dragging, deleting).
 * @attr {boolean} allow-student-pan - Enables student panning and zoom interaction.
 * @attr {string} font - Font family used for node labels. Default "Courier New".
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
 * @prop {string} font - Font family used for labels.
 * @prop {number} fontSize - Font size used for labels.
 * @prop {string} theme - Color theme name.
 * @prop {boolean} fullscreen - Whether the widget is currently in fullscreen mode.
 * @prop {string} solutionMessage - Message shown in the solution prompt.
 * @prop {boolean} showSolution - Whether the solution prompt is visible.
 *
 * @csspart options - Styles the settings sidebar (tool menu).
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

    /** @internal Runtime graph rendering settings. */
    @property({ type: Object }) accessor graphSettings = { font: 'Courier New', fontSize: 16, theme: 'standard' };

    /** Zoom level in percent [50–200]. */
    @property({ type: Number, reflect: true, attribute: true }) accessor zoomLevel: number = 100;

    /** @internal Base grid spacing (world units). */
    private gridSize: number = 50;

    /** @internal Background grid dot radius (world units). */
    private dotSize: number = 1.5;

    /** Horizontal pan offset (world units). */
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetX: number = 0;

    /** Vertical pan offset (world units). */
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetY: number = 0;

    /** Allow interactive editing (adding/dragging/deleting). */
    @property({ type: Boolean, reflect: true, attribute: true }) accessor allowStudentEdit: boolean = false;

    /** Allow panning/zooming interactions. */
    @property({ type: Boolean, reflect: true, attribute: true }) accessor allowStudentPan: boolean = false;

    /** Font family for node labels. */
    @property({ type: String, reflect: true, attribute: true }) accessor font = 'Courier New';

    /** Font size for node labels. */
    @property({ type: Number, reflect: true, attribute: true }) accessor fontSize = 16;

    /** Color theme name. */
    @property({ type: String, reflect: true, attribute: true }) accessor theme = 'standard';

    /** Whether the widget is in fullscreen mode. */
    @property({ type: Boolean }) accessor fullscreen = false;

    /** @internal Focus delegation for better keyboard support. */
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

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
    static labels: Record<string, string> = {
        "start": "Start",
        "op": "Process",
        "decision": "Decision",
        "i/o": "Input/Output",
        "sub": "Subprogram",
        "connector": "",
        "end": "End",
        "text": "Comment"
    };

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
            ${this.isEditable() ? this.renderToolMenu() : ''}
            <div class="workspace" @scroll="${this.handleScroll}">
                <canvas
                    width="100%"
                    height="${this.currentHeight}"
                    @mousedown="${this.handleMouseDown}"
                    @mouseup="${this.handleMouseUp}"
                    @mousemove="${this.handleMouseMove}"
                    @dblclick="${this.handleDoubleClick}"
                    @click="${(event: MouseEvent) => {
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
                        ${drawButton('grab', 'tool', msg)}
                    </button>
                    <!-- <button
                        @mouseenter="${(e) => createTooltip(e, msg('Tasks'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${() => this.toggleMenu('task')}"
                        style=${!this.isEditable() && this.taskList?.length == 0 ? 'display:none' : ''}
                    >
                        ${drawButton('task', 'tool', msg)}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, msg('Hints'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${() => this.toggleMenu('help')}"
                        style=${!this.isEditable() && this.helpList?.length == 0 ? 'display:none' : ''}
                    >
                        ${drawButton('help', 'tool', msg)}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, msg('Delete all'))}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.showConfirmPrompt}"
                        style=${!this.allowStudentEdit ? 'display:none' : ''}
                    >
                        ${drawButton('delete', 'tool', msg)}
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
                    <button @click="${() => this.addGraphNode('start', msg(FlowchartWidget.labels["start"]))}">
                        ${drawButton('start', 'flow', msg)}
                    </button>
                    <button @click="${() => this.addGraphNode('op', msg(FlowchartWidget.labels["op"]))}">${drawButton('op', 'flow', msg)}</button>
                    <button @click="${() => this.addGraphNode('decision', '  ' + msg(FlowchartWidget.labels["decision"]) + '  ')}">
                        ${drawButton('decision', 'flow', msg)}
                    </button>
                    <button @click="${() => this.addGraphNode('i/o', msg(FlowchartWidget.labels["i/o"]))}">
                        ${drawButton('i/o', 'flow', msg)}
                    </button>
                    <button @click="${() => this.addGraphNode('sub', msg(FlowchartWidget.labels["sub"]))}">
                        ${drawButton('sub', 'flow', msg)}
                    </button>
                    <button @click="${() => this.addGraphNode('connector', '')}">
                        ${drawButton('connector', 'flow', msg)}
                    </button>
                    <button @click="${() => this.addGraphNode('end', msg(FlowchartWidget.labels["end"]))}">${drawButton('end', 'flow', msg)}</button>
                    <button @click="${() => this.addGraphNode('text', msg(FlowchartWidget.labels["text"]))}">
                        ${drawButton('text', 'flow', msg)}
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
                            ${drawButton('addTask', 'task', msg)}
                        </button>
                    </div>
                </div>

                <div class="help-menu hidden" style=${this.fullscreen ? 'top:10px;right:10px;' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('help')}">×</button>
                    ${this.helpList?.length === 0
                        ? html`<p class="no-help-message">${msg('No hints!')}</p>`
                        : renderHelpList.bind(this)(this.helpList)}
                    <button class="add-help-button editMode" @click="${this.addHelp}">
                        ${drawButton('addHelp', 'help', msg)}
                    </button>
                </div>

                <div class="translate-menu hidden">
                    <button class="close-button" @click="${() => this.toggleMenu('translate')}">×</button>
                    <div class="translate-menu-container">
                        <button class="translate-button" @click="${() => this.translateFlowchart('natural')}">
                            ${drawButton('naturalLanguage', 'translate', msg)}
                        </button>
                        <textarea id="naturalLanguageOutput" class="output-textarea hidden" disabled></textarea>
                    </div>
                    <div class="translate-menu-container">
                        <button class="translate-button" @click="${() => this.translateFlowchart('pseudo')}">
                            ${drawButton('pseudoCode', 'translate', msg)}
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

    /**
     * Render the settings sidebar (tool menu).
     * Provides controls for:
     * - Font family and size (updates `font`, `fontSize`, and `graphSettings`)
     * - Theme (updates `theme` and `graphSettings`)
     * - Zoom (updates `zoomLevel` and applies zoom)
     * - Edit/pan toggles (`allowStudentEdit`, `allowStudentPan`)
     *
     * The aside uses `part="options"` to expose a CSS part for styling.
     * Visibility of the sidebar is controlled by the caller in `render()` (shown only in edit mode).
     *
     * @returns {import('lit').TemplateResult} Lit template for the settings sidebar.
     * @internal
     */
    private renderToolMenu() {
        return html`<aside class="tool-menu" part="options">
        <h2>${msg('Settings')}</h2>

        <div class="setting-menu-container">
            <div class="setting-item">
                <label>${msg('Font:')}</label>
                <select id="font-selector"
                    @change="${(e) => {
                        this.font = e.target.value;
                        this.graphSettings.font = e.target.value;
                        this.redrawCanvas();
                    }}"
                >
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New" selected>Courier New</option>
                </select>
            </div>
            <div class="setting-item">
                <label>${msg('Font size:')}</label>
                <select id="font-size-selector"
                    @change="${(e) => {
                        this.fontSize = e.target.value;
                        this.graphSettings.fontSize = parseInt(e.target.value);
                        this.redrawCanvas();
                    }}"
                >
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16" selected>16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="22">22</option>
                </select>
            </div>
            <div class="setting-item">
                <label>${msg('Theme:')}</label>
                <select id="color-theme-selector"
                    @change="${(e) => {
                        this.theme = e.target.value;
                        this.graphSettings.theme = e.target.value;
                        this.redrawCanvas();
                    }}"
                >
                    <option value="standard" selected>${msg('Standard')}</option>
                    <option value="pastel">${msg('Pastel')}</option>
                    <option value="mono">${msg('Mono')}</option>
                    <option value="s/w">${msg('Black/White')}</option>
                </select>
            </div>
            <div class="setting-item">
                <label>${msg('Zoom:')}</label>
                <div class="zoom-selector">
                    <button id="zoom-out-button" class="zoom-button"
                        @click="${(e) => {
                            this.zoomLevel = Math.max(this.zoomLevel - 10, 50); // Begrenze den Zoom auf 50%
                            this.applyZoom();
                        }}"
                    >-</button>
                    <span id="zoom-percentage" class="zoom-text">${this.zoomLevel}%</span>
                    <button id="zoom-in-button" class="zoom-button"
                        @click="${(e) => {
                            this.zoomLevel = Math.min(this.zoomLevel + 10, 200); // Begrenze den Zoom auf 200%
                            this.applyZoom();
                        }}"
                    >+</button>
                </div>
            </div>
            <div class="setting-item">
                <label>${msg('Allow editing:')}</label>
                <input
                    type="checkbox"
                    id="editable-checkbox"
                    @change="${(e) => {
                        this.allowStudentEdit = e.target.checked;
                    }}"
                    ?checked="${this.allowStudentEdit}"
                />
            </div>
            <div class="setting-item">
                <label>${msg('Allow moving:')}</label>
                <input
                    type="checkbox"
                    id="panable-checkbox"
                    @change="${(e) => {
                        this.allowStudentPan = e.target.checked;
                    }}"
                    ?checked="${this.allowStudentPan}"
                />
        </div>
    </aside>`;
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
                    this.showSolutionWithMessage('Der ausgewählte Pfad ist leider falsch!');
                    return;
                }
            }
            this.showSolutionWithMessage('Der ausgewählte Pfad ist korrekt!');
        } else {
            this.showSolutionWithMessage('Der ausgewählte Pfad ist leider falsch!');
        }
    }

        /**
     * Show or hide one of the widget's overlay menus and move focus to the host.
     *
     * @param {'task'|'flow'|'context'|'preset'|'help'|'translate'|'setting'} menu - Menu identifier to toggle.
     * @returns {void}
     * @internal
     */
    private toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help' | 'translate' | 'setting') {
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
        if ((!this.allowStudentEdit && !this.hasAttribute("contenteditable"))) {
            return;
        }

        const rect = this.getBoundingClientRect()
        const { x, y } = this.getMouseCoordinates(event);

        // Finde den angeklickten Knoten oder Verbindung und speichere sie
        const clickedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);
        const clickedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));

        // Falls ein Element angeklickt wurde, wird das Kontextmenü angezeigt
        if (clickedNode || clickedArrowIndex !== -1) {
            const contextMenu = this.shadowRoot.getElementById('context-menu');
            if (contextMenu) {
                contextMenu.style.display = 'block';
                contextMenu.style.left = event.clientX - rect.left +"px";
                contextMenu.style.top = event.clientY - rect.top +"px";

                if (clickedNode) {
                    this.selectedNode = clickedNode;
                    this.selectedArrow = undefined;
                } else {
                    this.selectedArrow = this.arrows[clickedArrowIndex];
                    this.selectedNode = undefined;
                }
            }
        }
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
        this.taskList = [...this.taskList, { titel: 'Title', content: 'Task' }];
    }

    /**
     * Append a new editable hint with default title/content to the help list.
     * Useful in edit mode to scaffold hints.
     *
     * @returns {void}
     */
    private addHelp() {
        this.helpList = [...this.helpList, { titel: 'Title', content: 'Hint' }];
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
        // Bereinige das Canvas und berücksichtigt den Zoom Faktor
        const scaleFactor = this.zoomLevel / 100;
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(scaleFactor, scaleFactor);

        // Draw the grid
        const gridSize = this.gridSize;         // base spacing between grid points (unscaled)
        const dotSize = this.dotSize;           // radius of each dot (unscaled)
        const width = this.canvas.width / scaleFactor;
        const height = this.canvas.height / scaleFactor;

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
        const scaleFactor = this.zoomLevel / 100;
        let centerX = (this.canvas.width * 0.4 + workspace.scrollLeft) / scaleFactor - this.canvasOffsetX;
        let centerY = (this.canvas.height * 0.4 + workspace.scrollTop) / scaleFactor - this.canvasOffsetY;

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
                const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));
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
        const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));

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

            // Entferne zuerst den bestehenden mousedown-EventListener, falls vorhanden
            if (this.anchorMouseDownEvent && this.canvas) {
                this.canvas.removeEventListener('mousedown', this.anchorMouseDownEvent);
                this.anchorMouseDownEvent = null;
            }

            // Erstelle den neuen EventListener und speicher ihn in der anchorMouseDownEvent-Variable
            this.anchorMouseDownEvent = (event) => {
                const { x, y } = this.getMouseCoordinates(event);
                anchors.forEach((position, index) => {
                    const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
                    if (distance <= 8) {
                        this.handleAnchorClick(this.selectedNode, index);
                    }
                });
            };

            // Füge den neuen EventListener hinzu
            if (this.canvas) {
                this.canvas.addEventListener('mousedown', this.anchorMouseDownEvent);
            }
        }
    }

    // ------------------------ Lifecycle ------------------------

    /** @internal Lit lifecycle: canvas setup, zoom/apply, initial redraw. */
    firstUpdated() {
        // console.log('firstUpdated');

        // console.log('this', this.taskList.length);

        this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.currentHeight;
        const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.updateCanvasOffset(); // Offset aktualisieren

        this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);

        this.graphSettings.font = this.font;
        this.graphSettings.fontSize = this.fontSize;
        this.graphSettings.theme = this.theme;

        this.applyZoom();
        this.redrawCanvas();

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

        this.addEventListener('startSelectSequence', this.selectSequence);
    }

    /** @internal Lifecycle: teardown listeners. */
    disconnectedCallback() {
        // window.removeEventListener('resize', this.updateCanvasSize);
        window.removeEventListener('keydown', this.handleKeyDown);

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

    /** @internal Recompute canvas dimensions and trigger redraw. */
    updateCanvasSize = () => {
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.currentHeight;

        const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.redrawCanvas();
    };

    /** @internal Apply the current zoom level (50–200%) and redraw. */
    private applyZoom() {
        const scaleFactor = this.zoomLevel / 100;
        this.ctx.resetTransform();
        this.ctx.scale(scaleFactor, scaleFactor);
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
        const rect = this.canvas.getBoundingClientRect();
        const scaleFactor = this.zoomLevel / 100;
    
        // Mouse position relative to the top-left corner of the canvas
        let x = (event.clientX - rect.left);
        let y = (event.clientY - rect.top);
    
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
    
            const zoomText = this.shadowRoot?.querySelector('#zoom-percentage') as HTMLSpanElement;
    
            // Get mouse position relative to canvas (screen space)
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
    
            // Convert to world space before zoom
            const prevScale = this.zoomLevel / 100;
            const worldXBefore = mouseX / prevScale - this.canvasOffsetX;
            const worldYBefore = mouseY / prevScale - this.canvasOffsetY;
    
            // Apply new zoom level
            if (event.deltaY < 0) {
                this.zoomLevel = Math.min(this.zoomLevel + 10, 200);
            } else {
                this.zoomLevel = Math.max(this.zoomLevel - 10, 50);
            }
    
            const newScale = this.zoomLevel / 100;
    
            // Adjust canvas offset to keep world point under cursor stable
            this.canvasOffsetX = mouseX / newScale - worldXBefore;
            this.canvasOffsetY = mouseY / newScale - worldYBefore;
    
            // Apply the zoom
            this.applyZoom();
        }
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

    /** @internal Toggle fullscreen rendering and size recalculation. */
    private toggleFullscreen() {
        if (this.ownerDocument.fullscreenElement) {
            this.ownerDocument.exitFullscreen();
            this.shadowRoot.querySelector('.flowchart-menu').classList.remove('fullscreen');
            this.fullscreen = false;
            this.currentHeight = this.height;
            this.canvas.style.width = "100%"
            this.canvas.style.height = ""
            this.updateCanvasSize();
        } else {
            this.requestFullscreen({ navigationUI: 'hide' });

            setTimeout(() => {
                const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
                workspace.style.setProperty('--widget-height', `${window.outerHeight}px`);
                this.shadowRoot.querySelector('.flowchart-menu').classList.add('fullscreen');
                this.canvas.width = window.outerWidth;
                this.canvas.height = window.outerHeight;
                this.currentHeight = window.outerHeight;
                this.fullscreen = true;
            }, 100);


            this.addEventListener('fullscreenchange', () => {
                this.requestUpdate()
                this.updateCanvasSize();
            });
        }
    }

    // ------------------------ Prompt Functionality ------------------------

    /** @internal Open input prompt for node/arrow text editing. */
    private showCustomPrompt(type: 'node' | 'arrow', index: number) {
        const promptElement = this.shadowRoot.querySelector('custom-prompt') as CustomPrompt;
        // console.log(promptElement)
        let currentText = '';
        if (type === 'node') {
            currentText = this.graphNodes[index].text;
        } else {
            if (this.arrows[index].text) {
                currentText = this.arrows[index].text;
            }
        }

        promptElement.classList.remove('hidden');
        this.shadowRoot.querySelector('custom-prompt').classList.remove('hidden');

        const onSubmit = (rawValue: string) => {
        
            const value = rawValue || msg(FlowchartWidget.labels[this.graphNodes[index].node]);

            if (type === 'node') {
                if (this.graphNodes[index].node === 'decision') {
                    this.graphNodes[index].text = '  ' + value + '  ';
                } else {
                    this.graphNodes[index].text = value;
                }
            } else {
                this.arrows[index].text = value;
            }
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
            this.arrows[this.promptIndex].text = newText;
            const selectedArrow = this.arrows[this.promptIndex];
            this.arrows.splice(this.promptIndex, 1);
            this.arrows.push(selectedArrow);
        }
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
