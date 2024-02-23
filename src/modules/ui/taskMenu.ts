import { ItemList } from '../../definitions/ItemList';
import { GraphNode } from '../../definitions/GraphNode';
import { Arrow } from '../../definitions/Arrow';
import { FlowchartWidget } from '../../..';
import { html } from 'lit';
import { drawButton } from '../drawer/drawButton';
import { createTooltip, removeTooltip } from './generalUI';

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
        console.log('Index', taskIndex);
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
            activeSequenceButton.classList.remove('active'); // Deaktiviere den vorherigen Button
        }

        //Überprüfe ob schon eine Lösung vorhanden ist, falls ja zeige diese an:
        const taskIndex = Array.from(taskContainer.children).indexOf(taskWrapper);
        if (taskList[taskIndex].sequence) {
            // Überprüfe ob alle Elemente der Sequenz noch in graphNodes oder arrows sind
            const allElementsExist = taskList[taskIndex].sequence.every((sequenceElement) => {
                if (sequenceElement.type === 'node') {
                    return getGraphNodes().some((node) => node.id === sequenceElement.id);
                } else if (sequenceElement.type === 'arrow') {
                    return getArrows().some((arrow) => arrow.id === sequenceElement.id);
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
            setActiveSequenceButton(null); // Setze den aktiven Button zurück, wenn keiner aktiv ist
            cancelSequence.style.display = 'none';
            saveSequence.style.display = 'none';
        }
    };

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

// render alle Tasks in der UI
export function renderTasks(this: FlowchartWidget, taskList: ItemList[]) {
    const renderTask = (task: ItemList, index: number) => {
        const selectSequenceEvent = new CustomEvent('startSelectSequence');

        const deleteTask = (event: MouseEvent) => {
            taskList.splice(index, 1);
            this.taskList = [...taskList];
        };

        const onTitleChange = (event: Event) => {
            task.titel = (event.target as HTMLInputElement).value;
            this.taskList = [...taskList];
        };

        const onContentChange = (event: Event) => {
            task.content = (event.target as HTMLTextAreaElement).value;
            this.taskList = [...taskList];
        };

        const addSequence = (event: MouseEvent) => {
            let activeSequenceButton = this.getActiveSequenceButton();
            if (activeSequenceButton && activeSequenceButton !== event.target) {
                activeSequenceButton.classList.remove('active');
            }

            if (taskList[index].sequence) {
                const allElementsExist = taskList[index].sequence.every((sequenceElement) => {
                    if (sequenceElement.type === 'node') {
                        return this.getGraphNodes().some((node) => node.id === sequenceElement.id);
                    } else if (sequenceElement.type === 'arrow') {
                        return this.getArrows().some((arrow) => arrow.id === sequenceElement.id);
                    } else {
                        return false;
                    }
                });

                if (!allElementsExist) {
                    taskList[index].sequence = [];
                } else {
                    this.setSelectedSequence(taskList[index].sequence);
                }
            }
            this.dispatchEvent(selectSequenceEvent);

            // Aktiviere den aktuellen Button und setze ihn als den aktiven Button
            const selectButton = this.shadowRoot.getElementById('select-button');
            if (selectButton.classList.contains('active')) {
                this.setActiveSequenceButton(event.target as HTMLButtonElement);
                setSelectionState(true);
            } else {
                this.setActiveSequenceButton(null); // Setze den aktiven Button zurück, wenn keiner aktiv ist
                setSelectionState(false);
            }
        };

        const saveSequence = (event: MouseEvent) => {
            taskList[index].sequence = this.getSelectedSequence();
            this.taskList = [...taskList];

            this.setActiveSequenceButton(null);
            this.setSelectedSequence([]);
            this.dispatchEvent(selectSequenceEvent);

            setSelectionState(false);
        };

        const cancelSequence = (event: MouseEvent) => {
            this.setActiveSequenceButton(null);
            this.setSelectedSequence([]);
            this.dispatchEvent(selectSequenceEvent);

            setSelectionState(false);
        };

        const setSelectionState = (state: boolean) => {
            const taskContainer = this.shadowRoot.querySelector('.task-container');
            const taskWrapper = taskContainer.children[index] as HTMLElement;
            const cancelButton = taskWrapper.querySelector('.cancel-sequence-button') as HTMLButtonElement;
            const saveButton = cancelButton.nextElementSibling as HTMLButtonElement;
            const addSequenceButton = saveButton.nextElementSibling as HTMLButtonElement;

            cancelButton.style.display = state ? 'block' : 'none';
            saveButton.style.display = state ? 'block' : 'none';
            addSequenceButton.classList.toggle('active', state);
        };

        return html`
            <div class="task-wrapper" style="position:relative">
                <input
                    type="text"
                    class="task-title"
                    placeholder="Überschrift"
                    value="${task.titel}"
                    @change=${onTitleChange}
                />
                <textarea
                    class="task-content"
                    placeholder="Inhalt... Änderungen werden automatisch gespeichert."
                    @change=${onContentChange}
                >
${task.content}</textarea
                >
                <div class="task-button-container editMode">
                    <button class="add-sequence-button editMode" @click=${addSequence}>Pfad hinzufügen</button>
                    <button class="cancel-sequence-button editMode" style="display:none" @click=${cancelSequence}>
                        Abbrechen
                    </button>
                    <button class="save-sequence-button editMode" style="display:none" @click=${saveSequence}>
                        Pfad speichern
                    </button>
                    <button class="delete-task-button editMode" @click=${deleteTask}>Löschen</button>
                </div>
                <div class="task-button-container" style=${this.isEditable() || !task.sequence ? 'display:none' : ''}>
                    <button id="select-button" @click="${this.selectSequence}" class="select-sequence-button">
                        ${drawButton('select', 'tool')} Pfad auswählen
                    </button>
                    <button
                        class="check-solution-button"
                        style=${task.sequence ? 'block' : 'none'}
                        @click=${() => this.checkSolution(task)}
                        ?disabled=${!this.isSelectingSequence}
                    >
                        Lösung prüfen
                    </button>
                </div>
            </div>
        `;
    };

    return html` <div class="task-container">${taskList?.map((task, index) => renderTask(task, index))}</div> `;
}
