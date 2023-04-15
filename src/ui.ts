/*
*   Hier finden sich die Funktionen für die Benutzeroberfläche 
*/

// Zeige oder verstecke die angefragten Benutzeroberflächen 
export function toggleMenu(element: HTMLElement, menu: 'task' | 'flow' | 'context'): void {
   switch (menu) {
      case 'task':
         const taskMenu = element.shadowRoot.querySelector('.task-menu');
         if (taskMenu) {
            taskMenu.classList.toggle('hidden');
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

export function addTask(element: HTMLElement) {
   const taskContainer = element.shadowRoot.querySelector('.task-container');
   // Nutze ein Wrapper um die einzelnen Elemente einer Aufgabe zu bündeln
   const taskWrapper = document.createElement('div');
   taskWrapper.style.position = 'relative';

   const taskTitle = document.createElement('input');
   taskTitle.type = 'text';
   taskTitle.className = 'task-title';
   taskTitle.placeholder = 'Überschrift';

   const taskContent = document.createElement('textarea');
   taskContent.className = 'task-content';
   taskContent.placeholder = 'Inhalt';

   const deleteTask = document.createElement('button');
   deleteTask.className = 'delete-task-button editMode';
   deleteTask.textContent = 'Löschen';
   deleteTask.onclick = () => { taskContainer.removeChild(taskWrapper) };

   // Füge alle Elemente zum Task-Wrapper hinzu
   taskWrapper.appendChild(taskTitle);
   taskWrapper.appendChild(taskContent);
   taskWrapper.appendChild(deleteTask);

   // Der Task-Container beinhaltet alle Aufgaben, so können gezielt einzelne Task-Wrapper hinzu und entfernt werden
   taskContainer.appendChild(taskWrapper);
}

export function grabCanvas(element: HTMLElement, isGrabbing: boolean): boolean {
   const grabButton = element.shadowRoot.getElementById('grab-button');
   isGrabbing ? grabButton?.classList.add('active') : grabButton?.classList.remove('active');
   return !isGrabbing;
}