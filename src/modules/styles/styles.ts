import { css } from 'lit';

export const papWidgetStyles = css`
   :host {
      display: block;
      position: relative;
      width: 100%;
      height: 98vh;
      overflow: hidden;

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
      --grid-color: #104E8B;
      --grid-size: 50px;
      --scaled-grid-size: var(--grid-size);
      --grid-dot-size: 1.5px;
      --scaled-grid-dot-size: var(--grid-dot-size);
   }

   :host([editable]) .editMode {
      display: none;
   }

   /* Workspace */
   .workspace {
      display: block;
      position: relative;
      width: 100%;
      height: 98vh;
      overflow: hidden;
   }

    /* Menus */
   .flowchart-menu,
   .task-menu,
   .tool-menu,
   .help-menu,
   .preset-menu,
   .translate-menu,
   .setting-menu,
   .solution-menu {
      display: flex;
      position: fixed;
      background-color: var(--menu-color);
      box-shadow: var(--box-shadow);
      border-radius: var(--border-r);
      padding: 15px;
      flex-direction: column;
   }

   /*Side Menus */
   .flowchart-menu {
      left: 1.5%;
      top: 15%;
      gap: 10px;
      padding-top: 20px;
   }

   .tool-menu {
      flex-direction: row;
      gap: 10px;
      top: 3%;
      right: 1.5%;
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
   .tool-menu button,
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
   .zoom-button {
      background-color: var(--button-color);
      color: white;
      border: none;
      border-radius: var(--border-r);
      font-size: 12px;
      padding: 5px;
      transition: var(--hover-transition);
      cursor: pointer;
   }

   .flowchart-menu button:hover,
   .tool-menu button:hover,
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
   .zoom-button:hover {
      background-color: var(--hover-color);
   }

   /* Add active state */
   .flowchart-menu button:active,
   .tool-menu button:active,
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
   .zoom-button:active {
      background-color: var(--button-color); 
      box-shadow: 0px 0px 5px var(--hover-color);
   }

   .solution-button{
      height: 100%;
      font-family: var(--ui-font);
      font-size: 16px;
   }
   
 
   .tool-menu button.active {
      background-color: #EEC900;
   }

    /* Tool Menu - Items */
   .help-menu, 
   .task-menu,
   .translate-menu,
   .preset-menu, 
   .setting-menu {
      right: 1.5%;
      top: 12%;
   }

   /* Task Menu */
   .task-menu {
      width: 25%;
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

   .add-sequence-button,
   .cancel-sequence-button,
   .save-sequence-button,
   .delete-task-button {
      margin-inline: 5px;
      margin-bottom: 5px;
      flex: 1;
   }

   .task-menu button.active {
      background-color: #EEC900;
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

      background-color:	var(--menu-color);
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
      position: fixed;
      left: 40px;
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
      background-color: var(--hover-color);;
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

   .setting-menu {
      align-items: center;
      justify-content: center;
      flex-direction: column;
   }

   .setting-menu-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      margin-top: 5px;
   }

   .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
   }

   .setting-item label {
      color: white;
      font-family: var(--ui-font);
      font-size: 14px;
      flex: 1;
      text-align: left;
      margin-right: 10px;
   }

   .setting-item select {
      background-color: var(--button-color);
      color: white;
      border: none;
      border-radius: var(--border-r);
      font-size: 12px;
      padding: 5px;
      transition: var(--hover-transition);
      flex: 1;
      text-align: left;
      margin-left: 10px;
   }

   .setting-item select:hover {
      background-color: var(--hover-color);
   }

   .zoom-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 45%;
   }
   .zoom-text {
      color: white;
      font-family: var(--ui-font);
      font-size: 14px;
      flex: 1;
      text-align: center;
      margin-left: 5px;
      margin-right: 5px;
   }

   .zoom-button {
      display: flex;
      width: 20px;
      height: 20px;
      align-items: center;
      justify-content: center;
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
      position: fixed;
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

   input,
   textarea {
      background-color:	#546c7e;
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
      width: 100vw;
      height: 100vh;
      z-index: 0;

      background-size: var(--scaled-grid-size) var(--scaled-grid-size);
      background-image: radial-gradient(
         circle,
         var(--grid-color) var(--scaled-grid-dot-size),
         var(--grid-background-color) var(--scaled-grid-dot-size)
      );
      background-position: var(--offset-x) var(--offset-y);
   }
`