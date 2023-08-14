import { ItemList } from "../../definitions/ItemList";
import { GraphNode } from "../../definitions/GraphNode";
import { Arrow } from "../../definitions/Arrow";

export function addTask(
  element: HTMLElement,
  taskList: ItemList[],
  selectedSequence: { id: string; order: number; type: string }[],
  getActiveSequenceButton: () => HTMLButtonElement | null,
  setActiveSequenceButton: (btn: HTMLButtonElement | null) => void,
  setSelectedSequence: (sequence: { id: string; order: number; type: string }[]) => void,
  getSelectedSequence: () => { id: string; order: number; type: string }[],
  getGraphNodes: () => GraphNode[], 
  getArrows: () => Arrow[]
) {
  const taskContainer = element.shadowRoot.querySelector('.task-container');

  const taskWrapper = document.createElement('div');
  taskWrapper.style.position = 'relative';
  taskWrapper.dataset.index = taskList.length.toString();
  taskWrapper.className = 'task-wrapper';

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
  taskContent.placeholder = 'Inhalt... \nÄnderungen werden automatisch gespeichert.';
  taskContent.addEventListener('input', (event) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  });
  taskContent.addEventListener('change', (event) => {
    const index = Array.from(taskContainer.children).indexOf(taskWrapper);
    taskList[index].content = (event.target as HTMLTextAreaElement).value;
  });

  const taskButtonContainer = document.createElement('div');
  taskButtonContainer.className = 'task-button-container editMode';

  const selectButton = element.shadowRoot.getElementById('select-button');
  selectButton.addEventListener('click', () => {
    if (!selectButton.classList.contains('active')) {
      let activeSequenceButton = getActiveSequenceButton();
      if (activeSequenceButton) {
        activeSequenceButton.classList.remove('active');
        setActiveSequenceButton(null);
      }
    }
  });
  const selectSequenceEvent = new CustomEvent('startSelectSequence');

  const cancelSequence = document.createElement('button');
  cancelSequence.className = 'cancel-sequence-button editMode';
  cancelSequence.style.display = 'none';  
  cancelSequence.textContent = 'Abbrechen';
  cancelSequence.onclick = () => {
    // Breche das hinzufügen von einer Sequenz ab. 
    setActiveSequenceButton(null);
    setSelectedSequence([]);
    element.dispatchEvent(selectSequenceEvent);
   
    cancelSequence.style.display = 'none';
    saveSequence.style.display = 'none';
    addSequence.classList.remove('active');
  };

  const saveSequence = document.createElement('button');
  saveSequence.className = 'save-sequence-button editMode';
  saveSequence.style.display = 'none';  
  saveSequence.textContent = 'Pfad speichern';
  saveSequence.onclick = () => {
    // Speicher die ausgewählte Sequence im TaskList und beende den Auswahlmodus
    const taskIndex = Array.from(taskContainer.children).indexOf(taskWrapper);
    console.log("Index", taskIndex)
    taskList[taskIndex].sequence = getSelectedSequence();

    setActiveSequenceButton(null);
    setSelectedSequence([]);
    element.dispatchEvent(selectSequenceEvent);

    // Verstecke die Buttons "Abbrechen" und "Speichern" und deaktiviere active
    cancelSequence.style.display = 'none';
    saveSequence.style.display = 'none';
    addSequence.classList.remove('active');
  };

  const addSequence = document.createElement('button');
  addSequence.className = 'add-sequence-button editMode';
  addSequence.textContent = 'Pfad hinzufügen';
  addSequence.onclick = () => {
    
    // Überprüfen, ob ein anderer Button bereits aktiv ist.
    let activeSequenceButton = getActiveSequenceButton();
    if (activeSequenceButton && activeSequenceButton !== addSequence) {
      activeSequenceButton.classList.remove('active');  // Deaktiviere den vorherigen Button
    }

    //Überprüfe ob schon eine Lösung vorhanden ist, falls ja zeige diese an:
    const taskIndex = Array.from(taskContainer.children).indexOf(taskWrapper);
    if(taskList[taskIndex].sequence){
      // Überprüfe ob alle Elemente der Sequenz noch in graphNodes oder arrows sind
      const allElementsExist = taskList[taskIndex].sequence.every(sequenceElement => {
        if (sequenceElement.type === 'node') {
          return getGraphNodes().some(node => node.id === sequenceElement.id);
        } else if (sequenceElement.type === 'arrow') {
          return getArrows().some(arrow => arrow.id === sequenceElement.id);
        } else {
          return false;
        }
      });
  
      // Wenn nicht alle Elemente existieren, lösche die Sequenz
      if (!allElementsExist) {
        taskList[taskIndex].sequence = [];
      } else {
        setSelectedSequence(taskList[taskIndex].sequence);
        selectedSequence = taskList[taskIndex].sequence;
      }
    }

    // Beginne mit der Auswahl der Sequenz, wenn der Button angeklickt wird.
    element.dispatchEvent(selectSequenceEvent);

    // Aktiviere den aktuellen Button und setze ihn als den aktiven Button
    if (selectButton.classList.contains('active')) {
      addSequence.classList.add('active');
      setActiveSequenceButton(addSequence);

      // Zeige die Buttons "Abbrechen" und "Sequenz Speichern" an
      cancelSequence.style.display = 'block';
      saveSequence.style.display = 'block';
    } else {
      addSequence.classList.remove('active');
      setActiveSequenceButton(null);  // Setze den aktiven Button zurück, wenn keiner aktiv ist
      cancelSequence.style.display = 'none';
      saveSequence.style.display = 'none';
    }
  } 

  const deleteTask = document.createElement('button');
  deleteTask.className = 'delete-task-button editMode';
  deleteTask.textContent = 'Löschen';
  deleteTask.onclick = () => {
    const index = Array.from(taskContainer.children).indexOf(taskWrapper);
    taskList.splice(index, 1);
    taskContainer.removeChild(taskWrapper);
  };

  taskButtonContainer.appendChild(saveSequence);
  taskButtonContainer.appendChild(cancelSequence);  
  taskButtonContainer.appendChild(addSequence);
  taskButtonContainer.appendChild(deleteTask);
  
  taskWrapper.appendChild(taskTitle);
  taskWrapper.appendChild(taskContent);
  taskWrapper.appendChild(taskButtonContainer);

  taskContainer.appendChild(taskWrapper);
  taskList.push({ titel: '', content: '' });
}
