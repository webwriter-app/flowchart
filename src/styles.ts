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

   .workspace {
      display: block;
      position: relative;
      width: 100%;
      height: 98vh;
      overflow: hidden;
   }

   .flowchart-menu,
   .tool-menu {
      display: flex;
      position: fixed;
      background-color: var(--menu-color);
      border-radius: var(--border-r);
      padding: 15px;
   }

   .flowchart-menu {
      left: 1.5%;
      top: 15%;
      flex-direction: column;
      gap: 10px;
      padding-top: 20px;
   }

   .tool-menu {
      right: 1.5%;
      top: 3%;
      flex-direction: row;
      gap: 10px;
   }

   .flowchart-menu button,
   .tool-menu button {
      background-color: var(--button-color);
      color: white;
      border: none;
      border-radius: var(--border-r);
      transition: background-color 0.3s;
   }

   .flowchart-menu button,
   .tool-menu button {
      font-size: 12px;
      padding: 5px;
   }

   .flowchart-menu button:hover,
   .tool-menu button:hover {
      background-color: var(--hover-color);
   }

   .tool-menu button.active {
      background-color: #EEC900;
   }

   .context-menu {
      position: absolute;
      z-index: 1000;
      background-color: var(--menu-color);
      border-radius: var(--border-r);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      padding: 8px 0;
      display: none;

      font-family: 'Courier New';
      font-size: 12px;
      font-weight: bold;
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

   .task-menu {
      position: fixed;
      display: flex;
      flex-direction: column;
      background-color: #2c3e50;
      padding: 15px;
      right: 1.5%;
      top: 15%;
      width: 300px;
      min-height: 60px;
      max-height: 75%;
      border-radius: var(--border-r);
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
      font-family: 'Arial';
      font-size: 14px;
      padding: 5px;
      margin-bottom: 5px;
      border: 1px solid #34495e;
      border-radius: var(--border-r);
      resize: vertical;
   }

   .add-task-button,
   .delete-task-button {
      background-color: var(--button-color);
      color: white;
      border: none;
      border-radius: var(--border-r);
      font-size: 12px;
      padding: 5px;
      transition: background-color 0.3s;
   }
 
   .delete-task-button {
     margin-left: 80%;
   }

   .add-task-button:hover,
   .delete-task-button:hover {
      background-color: var(--hover-color);
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

   .close-button:hover {
      background-color: var(--hover-color);	
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
      background-color: var(--button-color);;
      transition: background-color 0.3s;
   }

   .show-flowchart-button:hover {
      background-color: var(--hover-color);;
   }

   .help-menu {
      position: fixed;
      display: flex;
      flex-direction: column;
      background-color: #2c3e50;
      padding: 15px;
      right: 1.5%;
      top: 15%;
      width: 200px;
      min-height: 100px;
      max-height: 75%;
      border-radius: var(--border-r);
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
      font-family: 'Arial';
      font-size: 14px;
      padding: 5px;
      margin-bottom: 5px;
      border: 1px solid #34495e;
      border-radius: var(--border-r);
      resize: vertical;
   }

   .add-help-button,
   .delete-help-button {
      background-color: var(--button-color);
      color: white;
      border: none;
      border-radius: var(--border-r);
      font-size: 12px;
      padding: 5px;
      transition: background-color 0.3s;
   }
 
   .delete-help-button {
     margin-left: 80%;
   }

   .add-help-button:hover,
   .delete-help-button:hover {
      background-color: var(--hover-color);
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