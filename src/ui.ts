import { ItemList } from "./definitions";

/*
*   Hier finden sich die Funktionen für die Benutzeroberfläche 
*/

// Zeige oder verstecke die angefragten Benutzeroberflächen 
export function toggleMenu(element: HTMLElement, menu: 'task' | 'flow' | 'context' | 'help') {
   switch (menu) {
      case 'task':
      case 'help':
         const taskMenu = element.shadowRoot.querySelector('.task-menu');
         const helpMenu = element.shadowRoot.querySelector('.help-menu');
         if (taskMenu && helpMenu) {
            if (menu === 'task') {
               taskMenu.classList.toggle('hidden');
               if (!taskMenu.classList.contains('hidden')) {
                  helpMenu.classList.add('hidden');
               }
            } else if (menu === 'help') {
               helpMenu.classList.toggle('hidden');
               if (!helpMenu.classList.contains('hidden')) {
                  taskMenu.classList.add('hidden');
               }
            }
         }
         break;
      case 'flow':
         const flowchartMenu = element.shadowRoot.querySelector('.flowchart-menu');
         const showFlowchartButton = element.shadowRoot.querySelector('.show-flowchart-button');
         if (flowchartMenu && showFlowchartButton) {
            flowchartMenu.classList.toggle('hidden');
            showFlowchartButton.classList.toggle('hidden');
         }
         break;
      case 'context':
         const contextMenu = element.shadowRoot.getElementById('context-menu');
         if (contextMenu) { 
            contextMenu.style.display = 'none'; 
         }
      default:
         console.log('Unbekannter Menü Bezeichnung');
   }
}

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
   });
 
   const helpContent = document.createElement('textarea');
   helpContent.className = 'help-content';
   helpContent.placeholder = 'Inhalt';
   helpContent.addEventListener('change', (event) => {
     const index = Array.from(helpContainer.children).indexOf(helpWrapper);
     helpList[index].content = (event.target as HTMLTextAreaElement).value;
   });
 
   const deletehelp = document.createElement('button');
   deletehelp.className = 'delete-help-button editMode';
   deletehelp.textContent = 'Löschen';
   deletehelp.onclick = () => { 
     const index = Array.from(helpContainer.children).indexOf(helpWrapper);
     helpList.splice(index, 1);
     helpContainer.removeChild(helpWrapper);
   };
 
   helpWrapper.appendChild(helpTitle);
   helpWrapper.appendChild(helpContent);
   helpWrapper.appendChild(deletehelp);
 
   helpContainer.appendChild(helpWrapper);
   helpList.push({ titel: '', content: '' });
 }

export function grabCanvas(element: HTMLElement, isGrabbing: boolean): boolean {
   const grabButton = element.shadowRoot.getElementById('grab-button');
   !isGrabbing ? grabButton?.classList.add('active') : grabButton?.classList.remove('active');
   return !isGrabbing;
}