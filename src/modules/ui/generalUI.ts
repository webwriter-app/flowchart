let timerId: number;

export function createTooltip(event: MouseEvent, message: string) {
  const button = event.currentTarget as HTMLElement;
  timerId = window.setTimeout(() => {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.innerText = message;

    button.appendChild(tooltip);
  }, 1000);
}

export function removeTooltip(event: MouseEvent) {
  window.clearTimeout(timerId);
  const button = event.currentTarget as HTMLElement;
  const tooltip = button.parentNode.querySelector('.tooltip');
  if (tooltip) {
    button.removeChild(tooltip);
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

export function autoDeleteEmptyItems(
  element: HTMLElement,
  itemList: any[],
  containerSelector: string,
  wrapperSelector: string,
  titleSelector: string,
  contentSelector: string
) {
  const containers = element.shadowRoot.querySelectorAll(containerSelector);
  containers.forEach((container) => {
    const wrappers = Array.from(container.querySelectorAll(wrapperSelector));
    wrappers.forEach((wrapper: HTMLElement) => {
      const title = wrapper.querySelector(titleSelector) as HTMLInputElement;
      const content = wrapper.querySelector(contentSelector) as HTMLTextAreaElement;
      if ((title.value.trim() === '') && (content.value.trim() === '')) {
        const index = parseInt(wrapper.dataset.index);
        itemList.splice(index, 1);
        container.removeChild(wrapper);
      }
    });
  });
}