import { css } from 'lit';

export const papWidgetStyles = css`
    :host {
        overflow: hidden !important;
        display: block;
        position: relative;
        width: 100%;

        --offset-x: 0;
        --offset-y: 0;
        --grid-background-color: white;
        --grid-color: #104e8b;
        --grid-size: 50px;
        --grid-dot-size: 1.5px;

        --scaled-grid-size: var(--grid-size);
        --scaled-grid-dot-size: var(--grid-dot-size);

        --widget-height: 400px;

        border-width: 2px;
        border-style: solid;
        border-radius: var(--sl-border-radius-medium);
        border-color: var(--sl-color-neutral-300);
    }

    :host(:not([contenteditable='true']):not([contenteditable=''])) .editMode {
        display: none;
    }

    /* Workspace */
    .workspace {
        display: block;
        position: relative;
        width: 100%;
        height: var(--widget-height);
    }

    canvas {
        position: absolute;
        left: 0;
        top: 0;
        height: var(--widget-height);

        z-index: 0;

        background-color: white;

        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
    }

    /*
     * Keep dialogs inside the widget instead of covering the whole editor.
     * Shoelace only ships a "contained" mode for sl-drawer, so sl-dialog is pinned
     * to the nearest positioned ancestor (.workspace) by hand.
     */
    sl-dialog::part(base),
    sl-dialog::part(overlay) {
        position: absolute;
    }

    sl-dialog::part(panel) {
        max-height: 90%;
    }

    /* Overlays placed on top of the canvas */
    .action-menu {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        gap: var(--sl-spacing-2x-small);
        padding: var(--sl-spacing-2x-small);
    }

    .flowchart-menu {
        position: absolute;
        left: 5px;
        right: 5px;
        bottom: 5px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--sl-spacing-2x-small);
        padding: 25px 5px 5px 5px;
        background-color: var(--sl-panel-background-color);
        border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
        border-radius: var(--sl-border-radius-medium);
        box-shadow: var(--sl-shadow-large);
    }

    .flowchart-menu.fullscreen {
        top: 60px;
        left: 10px;
        right: unset;
        bottom: unset;

        width: 200px;
        height: auto;

        flex-direction: column;
    }

    .flowchart-menu sl-button {
        flex-grow: 1;
    }

    .flowchart-menu.fullscreen sl-button {
        flex-grow: 0;
    }

    .close-button {
        position: absolute;
        top: 5px;
        right: 5px;
    }

    .show-flowchart-button {
        position: absolute;
        right: 40px;
        bottom: 40px;
    }

    .context-menu {
        position: absolute;
        z-index: 1000;
        box-shadow: var(--sl-shadow-large);
    }

    /* Panel contents */
    .solution-menu,
    .translate-menu-container,
    .task-wrapper,
    .help-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--sl-spacing-x-small);
    }

    .task-wrapper,
    .help-wrapper {
        margin-bottom: var(--sl-spacing-medium);
    }

    .task-button-container {
        display: flex;
        gap: var(--sl-spacing-x-small);
    }

    .task-button-container sl-button {
        flex: 1;
    }

    .no-tasks-message,
    .no-help-message,
    .solution-titel {
        text-align: center;
        color: var(--sl-color-neutral-700);
    }

    .hidden {
        display: none;
    }

    /* Drag handle for the widget height */
    .y-rezise {
        cursor: ns-resize;

        background-color: var(--sl-color-neutral-300);
        width: 100%;
        height: 5px;
    }
`;
