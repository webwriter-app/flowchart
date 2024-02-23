import { html, render } from 'lit';
import { FlowchartWidget } from '../../..';
import { ItemList } from '../../definitions/ItemList';

// Füge eine Hilfskarte hinzu
export function addHelp(element: FlowchartWidget, helpList: ItemList[]) {
    const helpContainer = element.shadowRoot.querySelector('.help-container');

    // const helpWrapper = document.createElement('div');
    // helpWrapper.style.position = 'relative';
    // helpWrapper.dataset.index = helpList.length.toString();
    // helpWrapper.className = 'help-wrapper';

    // const helpTitle = document.createElement('input');
    // helpTitle.type = 'text';
    // helpTitle.className = 'help-title';
    // helpTitle.placeholder = 'Überschrift';
    // helpTitle.addEventListener('change', (event) => {
    //     const index = Array.from(helpContainer.children).indexOf(helpWrapper);
    //     helpList[index].titel = (event.target as HTMLInputElement).value;
    //     showHelp.textContent = helpList[index].titel;

    //     element.helpList = [...helpList];
    // });

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

        element.helpList = [...helpList];
    });

    const deleteHelp = document.createElement('button');
    deleteHelp.className = 'delete-help-button editMode';
    deleteHelp.textContent = 'Löschen';
    deleteHelp.onclick = () => {
        const index = Array.from(helpContainer.children).indexOf(helpWrapper);
        helpList.splice(index, 1);
        helpContainer.removeChild(helpWrapper);

        element.helpList = [...helpList];
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
    element.helpList = [...helpList];
}

// render die Hilfskarten
export function renderHelpList(this: FlowchartWidget, helpList: ItemList[]) {
    const renderHelp = (help, id) => {
        const deleteHelp = () => {
            helpList.splice(id, 1);
            this.helpList = [...helpList];
        };

        const onTitleChange = (event) => {
            help.titel = event.target.value;
            this.helpList = [...helpList];
        };

        const onContentChange = (event) => {
            help.content = event.target.value;
            this.helpList = [...helpList];
        };

        const showHelp = () => {
            const helpContainer = this.shadowRoot.querySelector('.help-container');
            const helpContent = helpContainer.children[id].querySelector('.help-content');
            helpContent.classList.toggle('hidden');
        };

        return html`<div class="help-wrapper" style="position:relative">
            <button class="show-help-button hidden" @click=${showHelp}>${help.titel}</button>
            <input
                type="text"
                class="help-title"
                value="${help.titel}"
                placeholder="Überschrift"
                @change=${onTitleChange}
            />
            <textarea
                class="help-content"
                @change=${onContentChange}
                placeholder="Inhalt... Änderungen werden automatisch gespeichert."
            >
${help.content}</textarea
            >
            <button class="delete-help-button editMode" @click=${deleteHelp}>Löschen</button>
        </div>`;
    };

    return html`<div class="help-container">${helpList?.map((help, i) => renderHelp(help, i))}</div>`;
}
