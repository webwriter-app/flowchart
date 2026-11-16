import { css } from 'lit';

export const papWidgetStyles = css`
    :host {
        overflow: hidden !important;
        display: block;
        position: relative;
        width: 100%;

        --offset-x: 0;
        --offset-y: 0;

        --widget-height: 400px;

        border-width: 1px;
        border-style: solid;
        border-radius: var(--sl-border-radius-medium);
        border-color: var(--sl-color-neutral-300);
    }

    :host(:fullscreen), :host(.ww-fullscreen) {
        border: none;
        border-radius: 0;
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

        /* Clips the flowchart menu while it slides out below the bottom edge. */
        overflow: hidden;
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

    canvas:focus-visible {
        outline: none;
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
        left: 0;
        right: 0;
        bottom: 0;

        display: flex;
        flex-direction: column;

        background-color: var(--sl-panel-background-color);
        border-top: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
        box-shadow: var(--sl-shadow-large);

        transition:
            var(--sl-transition-medium) translate,
            var(--sl-transition-medium) border-top-color,
            var(--sl-transition-medium) box-shadow;
    }

    .flowchart-menu.collapsed {
        translate: 0 100%;
        border-top-color: transparent;
        box-shadow: 0 0 0 rgb(0 0 0 / 0);
    }

    .flowchart-menu-handle {
        position: absolute;
        bottom: 100%;
        left: 50%;
        translate: -50%;

        display: flex;
        align-items: center;
        justify-content: center;
        width: 3.5rem;
        height: 1.5rem;
        padding: 0;

        appearance: none;
        border: none;
        background: none;
        color: var(--sl-color-neutral-600);
        font: inherit;
        cursor: pointer;

        transition: var(--sl-transition-fast) color;
    }

    .flowchart-menu-handle::before {
        content: '';
        position: absolute;
        inset: 0;

        background-color: var(--sl-panel-background-color);
        border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
        border-bottom: none;
        border-radius: var(--sl-border-radius-medium) var(--sl-border-radius-medium) 0 0;

        transition: var(--sl-transition-fast) background-color;
    }

    .flowchart-menu-handle:hover {
        color: var(--sl-color-neutral-900);
    }

    .flowchart-menu-handle:hover::before {
        background-color: var(--sl-color-neutral-100);
    }

    .flowchart-menu-handle:focus-visible {
        outline: var(--sl-focus-ring);
        outline-offset: var(--sl-focus-ring-offset);
        border-radius: var(--sl-border-radius-medium);
    }

    .flowchart-menu-chevron {
        position: relative;
        font-size: var(--sl-font-size-medium);
        transition: var(--sl-transition-medium) rotate;
    }

    .flowchart-menu:not(.collapsed) .flowchart-menu-chevron {
        rotate: 180deg;
    }

    .flowchart-menu-content {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--sl-spacing-2x-small);
        padding: var(--sl-spacing-x-small);
    }

    .flowchart-menu-content sl-button {
        flex: 1;
    }

    @media (prefers-reduced-motion: reduce) {
        .flowchart-menu,
        .flowchart-menu-chevron {
            transition: none;
        }
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

    .y-rezise {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        height: 30px;

        cursor: row-resize;

        /* The drag is driven by pointer events, so touch must not scroll or select. */
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;

        background-color: var(--sl-panel-background-color);
        border-top: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
        color: var(--sl-color-neutral-600);
    }

    .y-rezise.resizing {
        color: var(--sl-color-primary-600);
    }

    /* Keep the drag events (and their offsetY) on the handle itself. */
    .y-rezise sl-icon {
        pointer-events: none;
    }
`;
