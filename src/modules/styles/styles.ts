import { css } from 'lit';

export const papWidgetStyles = css`
    :host {
        overflow: hidden!important;
        display: block;
        position: relative;
        width: 100%;
        /* height: 400px; */
        /* overflow: hidden; */

        --border-r: 8px;
        --menu-color: #2c3e50;
        --button-color: #3a4f65;
        --hover-color: #1abc9c;
        --active-color: #1ccfab;
        --hover-transition: background-color 0.3s;
        --box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.6);

        --ui-font: 'Arial';

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
        border-radius: 5px;
        border-color: #6a6a6a;
    }

    :host(:not([contentEditable])) .editMode {
        display: none;
    }

    /* Workspace */
    .workspace {
        display: block;
        position: relative;
        width: 100%;
        height: var(--widget-height);
        /* overflow: hidden; */
    }

    /* Menus */
    .flowchart-menu,
    .task-menu,
    .help-menu,
    .preset-menu,
    .translate-menu,
    .solution-menu {
        display: flex;
        position: fixed;
        background-color: var(--menu-color);
        box-shadow: var(--box-shadow);
        border-radius: var(--border-r);
        padding: 15px;
        flex-direction: column;
    }

    .action-menu {
        position: absolute;
        top: 0;
        left: 0;
    }

    /*Side Menus */
    .flowchart-menu {
        left: 5px;
        bottom: 5px;
        right: 5px;
        gap: 5px;
        padding: 25px 5px 5px 5px;
        position: absolute;
        flex-direction: row;
    }

    .flowchart-menu.fullscreen {
        top: 60px;
        left: 10px;

        height: auto;
        bottom: unset;

        width: 200px;

        flex-direction: column;
    }

    .flowchart-menu.fullscreen button {
        flex-grow: 0;
    }

    .flowchart-menu svg {
        width: 100%;
        position: absolute;

        top: 5px;
        left: 0;

        height: 40px;
    }

    .flowchart-menu button {
        flex-grow: 1;
        margin: 0px !important;
        height: 50px;
        position: relative;
    }

    .solution-menu {
        flex-direction: column;
        gap: 10px;
        margin-right: 15px;
        top: 3%;
        right: 38%;
        align-items: center;
    }

    .solution-titel {
        color: white;
        font-family: var(--ui-font);
        font-size: 16px;
        align-items: center;
    }

    /* Buttons */
    .flowchart-menu button,
    .add-task-button,
    .delete-task-button,
    .add-sequence-button,
    .cancel-sequence-button,
    .save-sequence-button,
    .add-help-button,
    .delete-help-button,
    .show-help-button,
    .preset-button,
    .translate-button,
    .solution-button,
    .prompt button,
    .check-solution-button,
    .action-menu button,
    .select-sequence-button,
    .fullscreen-button {
        background-color: var(--button-color);
        color: white;
        border: none;
        border-radius: var(--border-r);
        font-size: 12px;
        padding: 5px;
        transition: var(--hover-transition);
        cursor: pointer;
        margin:5px
    }

    .flowchart-menu button:hover,
    .add-task-button:hover,
    .delete-task-button:hover,
    .add-sequence-button:hover,
    .cancel-sequence-button:hover,
    .save-sequence-button:hover,
    .add-help-button:hover,
    .delete-help-button:hover,
    .show-help-button:hover,
    .preset-button:hover,
    .translate-button:hover,
    .solution-button:hover,
    .prompt button:hover,
    .check-solution-button:hover,
    .action-menu button:hover,
    .select-sequence-button:hover,
    .fullscreen-button:hover {
        background-color: var(--hover-color);
    }

    /* Add active state */
    .flowchart-menu button:active,
    .add-task-button:active,
    .delete-task-button:active,
    .add-sequence-button:active,
    .cancel-sequence-button:active,
    .save-sequence-button:active,
    .add-help-button:active,
    .delete-help-button:active,
    .show-help-button:active,
    .preset-button:active,
    .translate-button:active,
    .solution-button:active,
    .prompt button:active,
    .check-solution-button:active,
    .action-menu button:active,
    .select-sequence-button:active,
    .fullscreen-button:active {
        background-color: var(--button-color);
        box-shadow: 0px 0px 5px var(--hover-color);
    }

    .fullscreen-button svg {
        fill: white;
        width: 40px;
        height: 30px;
    }

    .select-sequence-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .solution-button {
        height: 100%;
        font-family: var(--ui-font);
        font-size: 16px;
    }

    .action-menu button.active {
        background-color: #eec900;
    }

    .check-solution-button[disabled] {
        background-color: #546c7e;
        color: #ffffff;
        opacity: 1;
        cursor: not-allowed;
    }

    /* Tool Menu - Items */
    .help-menu,
    .task-menu,
    .translate-menu,
    .preset-menu {
        position: absolute;
        right: 0;
        top: 0;
    }

    /* Task Menu */
    .task-menu {
        width: auto;
        min-height: 60px;
        max-height: 75%;
        //resize: both;
        overflow: hidden;
    }

    .task-menu-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        justify-content: space-between;
        overflow-y: auto;
    }

    .task-container {
        flex-grow: 1;
        overflow-y: auto;
        margin-bottom: 5px;
    }

    .task-title {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--ui-font);
        font-size: 18px;
        padding: 5px;
        margin: 10px 0;
        border: 1px solid #34495e;
        border-radius: var(--border-r);
    }

    .task-content {
        width: 100%;
        min-height: 100px;
        //max-height: 200px; /* Die maximale Größe der Textarea festlegen */
        height: auto;
        box-sizing: border-box;
        font-family: var(--ui-font);
        font-size: 16px;
        padding: 5px;
        margin-bottom: 5px;
        border: 1px solid #34495e;
        border-radius: var(--border-r);
        resize: vertical;
    }

    .task-button-container {
        display: flex;
        justify-content: space-between;
    }

    .task-button-container > button:first-child {
        margin-left: 0;
    }

    .task-button-container > button:last-child {
        margin-right: 0;
    }

    .add-sequence-button,
    .cancel-sequence-button,
    .save-sequence-button,
    .delete-task-button {
        margin-inline: 5px;
        margin-bottom: 5px;
        flex: 1;
    }

    .task-menu button.active {
        background-color: #eec900;
    }

    .no-tasks-message,
    .no-help-message {
        color: #ffffff;
        font-family: var(--ui-font);
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .flowchart-menu > .close-button,
    .close-button {
        display: flex;
        position: absolute;
        top: 5px;
        right: 5px;
        width: 15px;
        height: 15px;
        padding: 0;
        border: none;
        border-radius: var(--border-r);

        color: white;
        font-size: 15px;
        font-weight: lighter;
        justify-content: center;
        align-items: center;

        background-color: var(--menu-color);
        transition: background-color 0.3s;
    }

    .flowchart-menu > .close-button:hover,
    .close-button:hover {
        background-color: #ee695e;
    }

    .flowchart-menu > .close-button:active,
    .close-button:active {
        background-color: #fc8b80;
        box-shadow: none;
    }

    .show-flowchart-button {
        display: flex;
        position: absolute;
        right: 40px;
        bottom: 40px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;

        color: white;
        font-size: 46px;
        font-weight: lighter;
        justify-content: center;
        align-items: center;
        background-color: var(--button-color);
        box-shadow: var(--box-shadow);
        transition: background-color 0.3s;
    }

    .show-flowchart-button:hover {
        background-color: var(--hover-color);
    }

    .help-menu {
        flex-direction: column;
        max-width: 25%;
        max-height: 75%;
        overflow: hidden;
    }

    .help-menu-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        justify-content: space-between;
    }

    .help-container {
        flex-grow: 1;
        overflow-y: auto;
    }

    .help-title {
        width: 100%;
        box-sizing: border-box;
        font-size: 18px;
        padding: 5px;
        margin: 10px 0;
        border: 1px solid #34495e;
        border-radius: var(--border-r);
    }

    .help-content {
        width: 100%;
        min-height: 120px;
        box-sizing: border-box;
        font-family: var(--ui-font);
        font-size: 16px;
        padding: 5px;
        margin-bottom: 5px;
        border: 1px solid #34495e;
        border-radius: var(--border-r);
        resize: vertical;
    }

    .delete-help-button {
        //margin: 5px;
        width: 100%;
        margin-bottom: 10px;
    }

    .show-help-button {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--ui-font);
        font-size: 16px;
        padding: 10px;
        margin-bottom: 10px;
        margin-top: 10px;
    }

    .preset-menu {
        align-items: center;
        justify-content: center;
        flex-direction: column;
        max-width: 250px;
        max-height: 75%;
        overflow: hidden;
    }

    .preset-menu-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        align-items: stretch;
        flex-grow: 1;
        overflow-y: auto;
        margin-bottom: 10px;
    }

    .add-help-button {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    .preset-button {
        border: none;
        width: 100%;
        font-family: var(--ui-font);
        font-size: 16px;
        padding: 10px;
        margin-bottom: 10px;
        margin-top: 5px;
    }

    .translate-menu {
        align-items: center;
        justify-content: center;
        width: 25%;
        max-height: 75%;
        overflow: hidden;
    }

    .translate-menu-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        //align-items: stretch;
        flex-grow: 1;
        overflow-y: auto;
    }

    .translate-button {
        width: 100%;
        font-family: var(--ui-font);
        font-size: 16px;
        padding: 10px;
        margin-bottom: 5px;
        margin-top: 5px;
    }

    .output-textarea {
        font-family: var(--ui-font);
        font-size: 16px;
        width: 100%;
        height: 150px;
        box-sizing: border-box;
        resize: vertical;
        overflow: auto;
        margin-bottom: 5px;
        margin-top: 5px;
    }

    /* Context Menu */
    .context-menu {
        position: absolute;
        z-index: 1000;
        background-color: var(--menu-color);
        border-radius: var(--border-r);
        box-shadow: var(--box-shadow);
        padding: 8px 0;
        display: none;

        font-family: var(--ui-font);
        font-size: 12px;
        color: #ffffff;
    }

    .context-menu-item {
        display: block;
        padding: 4px 16px;
        background-color: var(--button-color);
        transition: background-color 0.3s;
        cursor: pointer;
    }

    .context-menu-item:hover {
        background-color: var(--hover-color);
    }

    @media (pointer: coarse) {
        .context-menu {
            font-size: 16px;
        }
    }

    .tooltip {
        position: absolute;
        background-color: var(--menu-color);
        border-radius: var(--border-r);
        box-shadow: var(--box-shadow);
        padding: 10px;
        z-index: 10;
        font-family: var(--ui-font);
    }

    .prompt {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
        z-index: 1000;
        background-color: var(--menu-color);
        border-radius: var(--border-r);
        display: flex;
        flex-direction: column;
        color: white;
        font-family: 'Arial';
        font-size: 14px;
    }

    .prompt button {
        margin-bottom: 5px;
        margin-top: 5px;
    }

    confirm-prompt,
    custom-prompt {
        position: absolute;
    }

    input,
    textarea {
        background-color: #546c7e;
        border-radius: var(--border-r);
        color: #ffffff;
        margin-bottom: 10px;
        padding: 10px;
    }

    input:disabled,
    textarea:disabled {
        background-color: #546c7e;
        color: #ffffff;
        opacity: 1;
    }

    input::placeholder,
    textarea::placeholder {
        color: #c0c0c0;
    }

    .hidden {
        display: none;
    }

    canvas {
        position: absolute;
        left: 0;
        top: 0;
        /* width: 100vw;
        height: 100vh; */

        /* width: 100%; */
        height: var(--widget-height);

        z-index: 0;

        background-color: white;

        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
    }

    .y-rezise {
        cursor: ns-resize;

        background-color: var(--menu-color);
        width: 100%;
        height: 5px;
    }
`;
