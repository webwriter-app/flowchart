/*
*   Hier finden sich die Funktionen für die Benutzeroberfläche 
*/

import { ItemList } from "./definitions";

// Zeige oder verstecke die angefragten Benutzeroberflächen 
export function toggleMenu(element: HTMLElement, menu: 'task' | 'flow' | 'context' | 'preset' | 'help') {
   const taskMenu = element.shadowRoot.querySelector('.task-menu');
   const helpMenu = element.shadowRoot.querySelector('.help-menu');
   const presetMenu = element.shadowRoot.querySelector('.preset-menu');
   const flowchartMenu = element.shadowRoot.querySelector('.flowchart-menu');
   const showFlowchartButton = element.shadowRoot.querySelector('.show-flowchart-button');
   const contextMenu = element.shadowRoot.getElementById('context-menu');
 
   switch (menu) {
     case 'task':
       if (taskMenu) {
         taskMenu.classList.toggle('hidden');
         if (!taskMenu.classList.contains('hidden')) {
           helpMenu.classList.add('hidden');
           presetMenu.classList.add('hidden');
         }
       }
       break;
     case 'help':
       if (helpMenu) {
         helpMenu.classList.toggle('hidden');
         if (!helpMenu.classList.contains('hidden')) {
           taskMenu.classList.add('hidden');
           presetMenu.classList.add('hidden');
         }
       }
       break;
     case 'preset':
       if (presetMenu) {
         presetMenu.classList.toggle('hidden');
         if (!presetMenu.classList.contains('hidden')) {
           taskMenu.classList.add('hidden');
           helpMenu.classList.add('hidden');
         }
       }
       break;
     case 'flow':
       if (flowchartMenu && showFlowchartButton) {
         flowchartMenu.classList.toggle('hidden');
         showFlowchartButton.classList.toggle('hidden');
       }
       break;
     case 'context':
       if (contextMenu) {
         contextMenu.style.display = 'none';
       }
       break;
     default:
       console.log('Unbekannter Menü Bezeichnung');
   }
 }
 
// Füge eine Aufgabe hinzu
export function addTask(element: HTMLElement, taskList: ItemList[]) {
   const taskContainer = element.shadowRoot.querySelector('.task-container');
   
   const taskWrapper = document.createElement('div');
   taskWrapper.style.position = 'relative';
 
   const taskTitle = document.createElement('input');
   taskTitle.type = 'text';
   taskTitle.className = 'task-title';
   taskTitle.placeholder = 'Überschrift';
   taskTitle.addEventListener('change', (event) => {
     const index = Array.from(taskContainer.children).indexOf(taskWrapper);
     taskList[index].titel = (event.target as HTMLInputElement).value;
   });
 
   const taskContent = document.createElement('textarea');
   taskContent.className = 'task-content';
   taskContent.placeholder = 'Inhalt';
   taskContent.addEventListener('change', (event) => {
     const index = Array.from(taskContainer.children).indexOf(taskWrapper);
     taskList[index].content = (event.target as HTMLTextAreaElement).value;
   });
 
   const deleteTask = document.createElement('button');
   deleteTask.className = 'delete-task-button editMode';
   deleteTask.textContent = 'Löschen';
   deleteTask.onclick = () => { 
     const index = Array.from(taskContainer.children).indexOf(taskWrapper);
     taskList.splice(index, 1);
     taskContainer.removeChild(taskWrapper);
   };
 
   taskWrapper.appendChild(taskTitle);
   taskWrapper.appendChild(taskContent);
   taskWrapper.appendChild(deleteTask);
 
   taskContainer.appendChild(taskWrapper);
   taskList.push({ titel: '', content: '' });
}

// Deaktiviere die Input Möglichkeit falls editable deaktiviert ist
export function updateDisabledState(element: HTMLElement, editable: boolean | undefined) {
   const taskContainers = element.shadowRoot.querySelectorAll('.task-container');
   taskContainers.forEach((taskContainer) => {
     const taskTitles = taskContainer.querySelectorAll('.task-title');
     const taskContents = taskContainer.querySelectorAll('.task-content');

     taskTitles.forEach((taskTitle: HTMLInputElement) => {
       taskTitle.disabled = editable;
       console.log(taskTitle.disabled);
     });

     taskContents.forEach((taskContent: HTMLTextAreaElement) => {
       taskContent.disabled = editable;
     });
   });

   const helpContainers = element.shadowRoot.querySelectorAll('.help-container');
   helpContainers.forEach((helpContainer) => {
     const helpTitles = helpContainer.querySelectorAll('.help-title');
     const helpContents = helpContainer.querySelectorAll('.help-content');
     const showHelpButtons = helpContainer.querySelectorAll('.show-help-button');

      helpTitles.forEach((helpTitle: HTMLInputElement) => {
         helpTitle.disabled = editable;
         editable ? helpTitle.classList.add('hidden') : helpTitle.classList.remove('hidden');
      });

      helpContents.forEach((helpContent: HTMLTextAreaElement) => {
         helpContent.disabled = editable;
         editable ? helpContent.classList.add('hidden') : helpContent.classList.remove('hidden');
      });

      showHelpButtons.forEach((showHelpButton: HTMLButtonElement) => {
         editable ? showHelpButton.classList.remove('hidden') : showHelpButton.classList.add('hidden');
      });
   });
}

// Füge eine Hilfskarte hinzu
export function addHelp(element: HTMLElement, helpList: ItemList[]) {
   const helpContainer = element.shadowRoot.querySelector('.help-container');
   
   const helpWrapper = document.createElement('div');
   helpWrapper.style.position = 'relative';
 
   const helpTitle = document.createElement('input');
   helpTitle.type = 'text';
   helpTitle.className = 'help-title';
   helpTitle.placeholder = 'Überschrift';
   helpTitle.addEventListener('change', (event) => {
     const index = Array.from(helpContainer.children).indexOf(helpWrapper);
     helpList[index].titel = (event.target as HTMLInputElement).value;
     showHelp.textContent = helpList[index].titel;
   });
 
   const helpContent = document.createElement('textarea');
   helpContent.className = 'help-content';
   helpContent.placeholder = 'Inhalt';
   helpContent.addEventListener('change', (event) => {
     const index = Array.from(helpContainer.children).indexOf(helpWrapper);
     helpList[index].content = (event.target as HTMLTextAreaElement).value;
   });
 
   const deleteHelp = document.createElement('button');
   deleteHelp.className = 'delete-help-button editMode';
   deleteHelp.textContent = 'Löschen';
   deleteHelp.onclick = () => { 
     const index = Array.from(helpContainer.children).indexOf(helpWrapper);
     helpList.splice(index, 1);
     helpContainer.removeChild(helpWrapper);
   };
 
   const showHelp = document.createElement('button');
   showHelp.className = 'show-help-button hidden';
   showHelp.textContent = 'Tipp';
   showHelp.onclick = () => {
     helpContent.classList.toggle('hidden');
   };

   // Speichere ggf. die Default Werte
   helpTitle.value = helpList[helpList.length - 1].titel;
   showHelp.textContent = helpList[helpList.length - 1].titel;
   helpContent.value = helpList[helpList.length - 1].content;
 
   helpWrapper.appendChild(showHelp);
   helpWrapper.appendChild(helpTitle);
   helpWrapper.appendChild(helpContent);
   helpWrapper.appendChild(deleteHelp);
 
   helpContainer.appendChild(helpWrapper);
   helpList.push({ titel: '', content: '' });
}

// Erlaubt das draggen von Canvas
export function grabCanvas(element: HTMLElement, isGrabbing: boolean): boolean {
   const grabButton = element.shadowRoot.getElementById('grab-button');
   !isGrabbing ? grabButton?.classList.add('active') : grabButton?.classList.remove('active');
   return !isGrabbing;
}