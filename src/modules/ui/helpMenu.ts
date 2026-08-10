import { html } from 'lit';
import { FlowchartWidget } from '../../..';
import { ItemList } from '../../definitions/ItemList';
import { msg } from '@lit/localize';

// render die Hilfskarten
export function renderHelpList(this: FlowchartWidget, helpList: ItemList[]) {
    const renderHelp = (help: ItemList, id: number) => {
        const deleteHelp = () => {
            helpList.splice(id, 1);
            this.helpList = [...helpList];
        };

        const onTitleChange = (event: Event) => {
            help.titel = (event.target as HTMLInputElement).value;
            this.helpList = [...helpList];
        };

        const onContentChange = (event: Event) => {
            help.content = (event.target as HTMLTextAreaElement).value;
            this.helpList = [...helpList];
        };

        if (!this.isEditable()) {
            return html`<div class="help-wrapper">
                <sl-details summary=${help.titel || msg('Hint')}>${help.content}</sl-details>
            </div>`;
        }

        return html`<div class="help-wrapper">
            <sl-input
                .value=${help.titel ?? ''}
                placeholder="${msg('Heading')}"
                @sl-change=${onTitleChange}
            ></sl-input>
            <sl-textarea
                resize="auto"
                .value=${help.content ?? ''}
                @sl-change=${onContentChange}
                placeholder="${msg('Content...')} ${msg('Changes are saved automatically.')}"
            ></sl-textarea>
            <sl-button class="delete-help-button editMode" variant="danger" @click=${deleteHelp}>
                ${msg('Delete')}
            </sl-button>
        </div>`;
    };

    return html`<div class="help-container">${helpList?.map((help, i) => renderHelp(help, i))}</div>`;
}
