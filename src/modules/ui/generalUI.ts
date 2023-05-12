let timerId: number;

export function createTooltip(event: MouseEvent, message: string) {
  const button = event.currentTarget as HTMLElement;
  timerId = window.setTimeout(() => {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.innerText = message;

    button.parentNode.appendChild(tooltip);
    //button.appendChild(tooltip);
    console.log(button.parentNode);
  }, 1000);
}

export function removeTooltip(event: MouseEvent) {
  window.clearTimeout(timerId);
  const button = event.currentTarget as HTMLElement;
  const tooltip = button.parentNode.querySelector('.tooltip');
  if (tooltip) {
    button.parentNode.removeChild(tooltip);
    //button.removeChild(tooltip);
  }
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

// Erlaubt das draggen von Canvas
export function grabCanvas(element: HTMLElement, isGrabbing: boolean): boolean {
  const grabButton = element.shadowRoot.getElementById('grab-button');
  !isGrabbing ? grabButton?.classList.add('active') : grabButton?.classList.remove('active');
  return !isGrabbing;
}

