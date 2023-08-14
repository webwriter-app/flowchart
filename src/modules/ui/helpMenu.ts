import { ItemList } from "../../definitions/ItemList";

// Füge eine Hilfskarte hinzu
export function addHelp(element: HTMLElement, helpList: ItemList[]) {
  const helpContainer = element.shadowRoot.querySelector('.help-container');

  const helpWrapper = document.createElement('div');
  helpWrapper.style.position = 'relative';
  helpWrapper.dataset.index = helpList.length.toString();  
  helpWrapper.className = 'help-wrapper';

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
  helpContent.placeholder = 'Inhalt... \nÄnderungen werden automatisch gespeichert.';
  helpContent.addEventListener('input', (event) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  });
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
  // helpTitle.value = helpList[helpList.length - 1].titel;
  // showHelp.textContent = helpList[helpList.length - 1].titel;
  // helpContent.value = helpList[helpList.length - 1].content;

  helpWrapper.appendChild(showHelp);
  helpWrapper.appendChild(helpTitle);
  helpWrapper.appendChild(helpContent);
  helpWrapper.appendChild(deleteHelp);

  helpContainer.appendChild(helpWrapper);
  helpList.push({ titel: '', content: '' });
}