import { ItemList } from '../../definitions/ItemList';
import { FlowchartWidget } from '../../..';
import { html } from 'lit';
import selectIcon from '../../assets/pointer.svg';
import { msg } from '@lit/localize';

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

        const setSelectionState = (state: boolean) => {
            this.sequenceEditIndex = state ? index : null;
        };

        // `selectSequence` schaltet den Auswahlmodus um, daher nur senden, wenn er
        // tatsächlich wechseln soll. Beim Verlassen leert es die Auswahl und zeichnet neu.
        const setSelecting = (active: boolean) => {
            if (this.isSelectingSequence !== active) {
                this.dispatchEvent(selectSequenceEvent);
            }
        };

        const addSequence = () => {
            // Ein erneuter Klick auf denselben Task beendet dessen Aufzeichnung.
            const startRecording = this.sequenceEditIndex !== index;

            // Eine laufende Aufzeichnung – dieses oder eines anderen Tasks – zuerst beenden.
            setSelecting(false);

            if (startRecording) {
                this.setSelectedSequence([]);

                // Bereits gespeicherte Sequenz vorladen, sofern all ihre Elemente noch existieren.
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
                        // Kopie, damit "Abbrechen" die gespeicherte Sequenz unangetastet lässt:
                        // die Auswahl wird beim Klicken auf das Canvas in-place erweitert.
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
                    placeholder="${msg('Heading')}"
                    .value=${task.titel ?? ''}
                    ?disabled=${!this.isEditable()}
                    @sl-change=${onTitleChange}
                ></sl-input>
                <sl-textarea
                    resize="auto"
                    placeholder="${msg('Content...')} ${msg('Changes are saved automatically.')}"
                    .value=${task.content ?? ''}
                    ?disabled=${!this.isEditable()}
                    @sl-change=${onContentChange}
                ></sl-textarea>
                <div class="task-button-container editMode">
                    <sl-button variant=${isRecording ? 'primary' : 'default'} @click=${addSequence}>
                        ${msg('Add path')}
                    </sl-button>
                    ${isRecording
                        ? html`
                              <sl-button @click=${cancelSequence}>${msg('Cancel')}</sl-button>
                              <sl-button variant="primary" @click=${saveSequence}>${msg('Save path')}</sl-button>
                          `
                        : ''}
                    <sl-button variant="danger" @click=${deleteTask}>${msg('Delete')}</sl-button>
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
                                  ${msg('Select path')}
                              </sl-button>
                              <sl-button @click=${() => this.checkSolution(task)} ?disabled=${!this.isSelectingSequence}>
                                  ${msg('Check solution')}
                              </sl-button>
                          </div>
                      `
                    : ''}
            </div>
        `;
    };

    return html` <div class="task-container">${taskList?.map((task, index) => renderTask(task, index))}</div> `;
}
