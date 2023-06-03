import { ItemList } from "../../definitions/ItemList";

// Füge eine Aufgabe hinzu
export function addTask(element: HTMLElement, taskList: ItemList[]) {
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
  taskContent.placeholder = 'Inhalt';
  taskContent.addEventListener('input', (event) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  });
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