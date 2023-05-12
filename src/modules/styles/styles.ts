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
      --grid-dot-size: 1px;
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
   .tool-menu,
   .task-menu,
   .help-menu,
   .preset-menu,
   .translate-menu,
   .setting-menu {
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
      right: 1.5%;
      top: 3%;
      gap: 10px;
   }

   /* Buttons */
   .flowchart-menu button,
   .tool-menu button,
   .add-task-button,
   .delete-task-button,
   .add-help-button,
   .delete-help-button,
   .show-help-button,
   .preset-button,
   .translate-button {
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
   .add-help-button:hover,
   .delete-help-button:hover,
   .show-help-button:hover,
   .preset-button:hover,
   .translate-button:hover {
      background-color: var(--hover-color);
   }

   /* Add active state */
   .flowchart-menu button:active,
   .tool-menu button:active,
   .add-task-button:active,
   .delete-task-button:active,
   .add-help-button:active,
   .delete-help-button:active,
   .show-help-button:active,
   .preset-button:active,
   .translate-button:active {
      background-color: var(--button-color); 
      box-shadow: 0px 0px 5px var(--hover-color);
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
      width: 300px;
      min-height: 60px;
      max-height: 75%;
      resize: both;
      overflow: hidden;
   }

   .task-menu-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%; 
      box-sizing: border-box; 
   }

   .task-container {
      flex-grow: 1;
      overflow-y: auto;
      margin-bottom: 10px;
   }

   .task-title {
      width: 100%;
      box-sizing: border-box;
      font-size: 14px;
      font-weight: bold;
      padding: 5px;
      margin: 10px 0;
      border: 1px solid #34495e;
      border-radius: var(--border-r);
   }

   .task-content {
      width: 100%;
      box-sizing: border-box;
      font-family: var(--ui-font);
      font-size: 14px;
      padding: 5px;
      margin-bottom: 5px;
      border: 1px solid #34495e;
      border-radius: var(--border-r);
      resize: vertical;
   }
 
   .delete-task-button {
     margin-left: 80%;
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
      align-items: center;
      justify-content: center;
      flex-direction: column;
  
      max-width: 250px;
      //min-height: 100px;
      max-height: 75%;
      overflow: hidden;
   }

   .help-menu-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%; 
      box-sizing: border-box; 
   }

   .help-container {
      flex-grow: 1;
      overflow-y: auto;
      margin-bottom: 10px;
   }

   .help-title {
      width: 100%;
      box-sizing: border-box;
      font-size: 14px;
      font-weight: bold;
      padding: 5px;
      margin: 10px 0;
      border: 1px solid #34495e;
      border-radius: var(--border-r);
   }

   .help-content {
      width: 100%;
      box-sizing: border-box;
      font-family: var(--ui-font);
      font-size: 14px;
      padding: 5px;
      margin-bottom: 5px;
      border: 1px solid #34495e;
      border-radius: var(--border-r);
      resize: vertical;
   }
 
   .delete-help-button {
     margin-left: 70%;
   }

   .show-help-button {
      width: 100%;
      box-sizing: border-box;
      font-family: var(--ui-font);
      font-size: 16px;
      padding: 10px;
      margin-bottom: 10px;
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
      flex-direction: column;

      max-width: 250px;
      max-height: 75%;
      overflow: hidden;
   }

   .translate-menu-container {
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

   .translate-button {
      width: 100%;
      font-family: var(--ui-font);
      font-size: 16px;
      padding: 10px;
      margin-bottom: 10px;
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
   }

   .context-menu-item:hover {
      background-color: var(--hover-color);
   }

   .tooltip {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: #f9f9f9;
      border: 1px solid #ccc;
      padding: 5px;
      z-index: 15;
   }

   input,
   textarea {
      background-color:	#546c7e;
      border-radius: var(--border-r);
      color: white;
      margin-bottom: 10px;
      padding: 10px;
     
   }

   input:disabled,
   textarea:disabled {
      background-color: #ffffff; 
      color: #000000; 
      opacity: 1; 
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

      background-size: var(--grid-size) var(--grid-size);
      background-image: radial-gradient(
         circle,
         var(--grid-color) var(--grid-dot-size),
         var(--grid-background-color) var(--grid-dot-size)
      );
      background-position: var(--offset-x) var(--offset-y);
   }
`