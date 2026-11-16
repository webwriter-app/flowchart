import { ItemList } from '../../model/item-list';
import { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import { html } from 'lit';
import selectIcon from '@tabler/icons/outline/pointer.svg';

// Render all tasks
export function renderTasks(this: WebwriterFlowchart, taskList: ItemList[]) {
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

        const setSelectionState = (state: boolean) => {
            this.sequenceEditIndex = state ? index : null;
        };

        // `selectSequence` toggles the selection mode, so only dispatch when it
        // really has to change. Leaving it clears the selection and redraws.
        const setSelecting = (active: boolean) => {
            if (this.isSelectingSequence !== active) {
                this.dispatchEvent(selectSequenceEvent);
            }
        };

        const addSequence = () => {
            // Clicking the same task again ends its recording.
            const startRecording = this.sequenceEditIndex !== index;

            // End a running recording, of this or another task, first.
            setSelecting(false);

            if (startRecording) {
                this.setSelectedSequence([]);

                // Preload an already stored sequence if all its elements still exist.
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
                        // Copy, so that "Cancel" leaves the stored sequence untouched:
                        // clicking the canvas extends the selection in place.
                        this.setSelectedSequence([...taskList[index].sequence]);
                    }
                }

                setSelecting(true);
            }

            setSelectionState(startRecording);
        };

        const saveSequence = () => {
            taskList[index].sequence = [...this.getSelectedSequence()];
            this.taskList = [...taskList];

            this.setSelectedSequence([]);
            setSelecting(false);

            setSelectionState(false);
        };

        const cancelSequence = () => {
            this.setSelectedSequence([]);
            setSelecting(false);

            setSelectionState(false);
        };

        const isRecording = this.sequenceEditIndex === index;

        return html`
            <div class="task-wrapper">
                <sl-input
                    placeholder="${this.msg('Heading')}"
                    .value=${task.titel ?? ''}
                    ?disabled=${!this.isEditable()}
                    @sl-change=${onTitleChange}
                ></sl-input>
                <sl-textarea
                    resize="auto"
                    placeholder="${this.msg('Content...')} ${this.msg('Changes are saved automatically.')}"
                    .value=${task.content ?? ''}
                    ?disabled=${!this.isEditable()}
                    @sl-change=${onContentChange}
                ></sl-textarea>
                <div class="task-button-container editMode">
                    <sl-button variant=${isRecording ? 'primary' : 'default'} @click=${addSequence}>
                        ${this.msg('Add path')}
                    </sl-button>
                    ${isRecording
                        ? html`
                              <sl-button @click=${cancelSequence}>${this.msg('Cancel')}</sl-button>
                              <sl-button variant="primary" @click=${saveSequence}>${this.msg('Save path')}</sl-button>
                          `
                        : ''}
                    <sl-button variant="danger" @click=${deleteTask}>${this.msg('Delete')}</sl-button>
                </div>
                ${!this.isEditable() && task.sequence
                    ? html`
                          <div class="task-button-container">
                              <sl-button
                                  id="select-button"
                                  variant=${this.isSelectingSequence ? 'primary' : 'default'}
                                  @click="${this.selectSequence}"
                              >
                                  <sl-icon slot="prefix" src=${selectIcon}></sl-icon>
                                  ${this.msg('Select path')}
                              </sl-button>
                              <sl-button @click=${() => this.checkSolution(task)} ?disabled=${!this.isSelectingSequence}>
                                  ${this.msg('Check solution')}
                              </sl-button>
                          </div>
                      `
                    : ''}
            </div>
        `;
    };

    return html` <div class="task-container">${taskList?.map((task, index) => renderTask(task, index))}</div> `;
}
