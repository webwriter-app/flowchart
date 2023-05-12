// Zeige oder verstecke die angefragten Benutzeroberflächen 
export function toggleMenu(element: HTMLElement, menu: 'task' | 'flow' | 'context' | 'preset' | 'help' | 'translate' | 'setting') {
   const taskMenu = element.shadowRoot.querySelector('.task-menu');
   const helpMenu = element.shadowRoot.querySelector('.help-menu');
   const presetMenu = element.shadowRoot.querySelector('.preset-menu');
   const flowchartMenu = element.shadowRoot.querySelector('.flowchart-menu');
   const showFlowchartButton = element.shadowRoot.querySelector('.show-flowchart-button');
   const translateMenu = element.shadowRoot.querySelector('.translate-menu');
   const settingMenu = element.shadowRoot.querySelector('.setting-menu');
   const contextMenu = element.shadowRoot.getElementById('context-menu');
 
   switch (menu) {
     case 'task':
       if (taskMenu) {
         taskMenu.classList.toggle('hidden');
         if (!taskMenu.classList.contains('hidden')) {
           helpMenu.classList.add('hidden');
           presetMenu.classList.add('hidden');
           translateMenu.classList.add('hidden');
           settingMenu.classList.add('hidden');
         }
       }
       break;
     case 'help':
       if (helpMenu) {
         helpMenu.classList.toggle('hidden');
         if (!helpMenu.classList.contains('hidden')) {
           taskMenu.classList.add('hidden');
           presetMenu.classList.add('hidden');
           translateMenu.classList.add('hidden');
           settingMenu.classList.add('hidden');
         }
       }
       break;
     case 'preset':
       if (presetMenu) {
         presetMenu.classList.toggle('hidden');
         if (!presetMenu.classList.contains('hidden')) {
           taskMenu.classList.add('hidden');
           helpMenu.classList.add('hidden');
           translateMenu.classList.add('hidden');
           settingMenu.classList.add('hidden');
         }
       }
       break;
     case 'translate':
       if (translateMenu) {
         translateMenu.classList.toggle('hidden');
         if (!translateMenu.classList.contains('hidden')) {
           taskMenu.classList.add('hidden');
           helpMenu.classList.add('hidden');
           presetMenu.classList.add('hidden');
           settingMenu.classList.add('hidden');
         }
       }
       break;
     case 'setting':
         if (settingMenu) {
           settingMenu.classList.toggle('hidden');
           if (!settingMenu.classList.contains('hidden')) {
             taskMenu.classList.add('hidden');
             helpMenu.classList.add('hidden');
             presetMenu.classList.add('hidden');
             translateMenu.classList.add('hidden');
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