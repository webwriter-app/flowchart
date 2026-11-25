import { html } from 'lit';
import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import { renderHelpList } from './help-menu';
import { renderTasks } from './task-menu';

import plusIcon from "@tabler/icons/outline/plus.svg";

/** Side panels for tasks and hints, the node context menu and the prompts. */
export function renderDialogs(host: WebwriterFlowchart) {
    return html`
        <sl-dialog
            label="${host.msg('Tasks')}"
            ?open=${host.openMenu === 'task'}
            @sl-after-hide=${host.handleMenuHide}
        >
            ${host.taskList?.length === 0
                ? html`<p class="no-tasks-message">${host.msg('No tasks!')}</p>`
                : renderTasks.bind(host)(host.taskList)}
            ${host.showSolutionMenu
                ? html`
                      <div class="solution-menu">
                          <div class="solution-titel">${host.msg('Check path')}</div>
                          ${host.taskList?.map((task) =>
                              task.sequence
                                  ? html`<sl-button @click="${() => host.checkSolution(task)}">
                                        ${task.titel}
                                    </sl-button>`
                                  : ''
                          )}
                      </div>
                  `
                : ''}
            <sl-button slot="footer" class="editMode" @click="${host.addTask}">
                <sl-icon slot="prefix" src=${plusIcon}></sl-icon>
                ${host.msg('Add task')}
            </sl-button>
        </sl-dialog>

        <sl-dialog
            label="${host.msg('Hints')}"
            ?open=${host.openMenu === 'help'}
            @sl-after-hide=${host.handleMenuHide}
        >
            ${host.helpList?.length === 0
                ? html`<p class="no-help-message">${host.msg('No hints!')}</p>`
                : renderHelpList.bind(host)(host.helpList)}
            <sl-button slot="footer" class="editMode" @click="${host.addHelp}">
                <sl-icon slot="prefix" src=${plusIcon}></sl-icon>
                ${host.msg('Add hint')}
            </sl-button>
        </sl-dialog>

        ${host.contextMenuAt
            ? html`
                  <sl-menu
                      class="context-menu"
                      style="left:${host.contextMenuAt.x}px; top:${host.contextMenuAt.y}px"
                  >
                      <sl-menu-item @click="${() => host.deleteSelectedObject()}">
                          ${host.msg('Delete')}
                      </sl-menu-item>
                  </sl-menu>
              `
            : ''}

        <sl-dialog
            label="${host.msg('Type in the new text:')}"
            ?open=${host.textPrompt !== null}
            @sl-request-close=${host.prompt.hide}
            @sl-after-hide=${host.prompt.hide}
            @sl-initial-focus=${host.prompt.focusInput}
        >
            <sl-input
                id="text-prompt-input"
                .value=${host.textPrompt?.value ?? ''}
                @keyup=${host.prompt.handleKeyUp}
            ></sl-input>
            <sl-button slot="footer" @click="${host.prompt.hide}">${host.msg('Cancel')}</sl-button>
            <sl-button slot="footer" variant="primary" @click="${host.prompt.submit}">OK</sl-button>
        </sl-dialog>

        <sl-dialog
            label="${host.msg('Are you sure, that you want to delete everything?')}"
            ?open=${host.confirmOpen}
            @sl-after-hide=${() => (host.confirmOpen = false)}
        >
            <sl-button slot="footer" @click="${() => (host.confirmOpen = false)}">${host.msg('Cancel')}</sl-button>
            <sl-button
                slot="footer"
                variant="danger"
                @click="${() => {
                    host.clearAll();
                    host.confirmOpen = false;
                }}"
            >
                OK
            </sl-button>
        </sl-dialog>

        <sl-dialog ?open=${host.showSolution} @sl-after-hide=${host.closeSolution} no-header>
            <sl-alert variant=${host.solutionCorrect ? 'success' : 'danger'} open>
                ${host.solutionMessage}
            </sl-alert>
            <sl-button slot="footer" @click="${host.closeSolution}">${host.msg('Close')}</sl-button>
        </sl-dialog>
    `;
}

/** Paper only: the tasks under the chart, or a note where an empty chart would print as a blank box. */
export function renderPrintView(host: WebwriterFlowchart) {
    const tasks = host.taskList.filter((task) => task.titel?.trim() || task.content?.trim());
    return html`
        ${host.graphNodes.length ? '' : html`<div class="print-only print-note">${host.msg('Interactive content: open the document online')}</div>`}
        ${tasks.length ? html`
            <section class="print-only print-tasks">
                <h2>${host.msg('Tasks')}</h2>
                <ol>${tasks.map((task) => html`<li><strong>${task.titel}</strong> ${task.content}</li>`)}</ol>
            </section>
        ` : ''}
    `;
}
