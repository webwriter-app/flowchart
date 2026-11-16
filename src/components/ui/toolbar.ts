import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import type { NodeType } from '../../model/graph-edit';
import { newNodeText, nodeLabel } from '../../model/node-labels';

import grabIcon from "@tabler/icons/outline/hand-grab.svg";
import fullscreenIcon from "@tabler/icons/outline/arrows-maximize.svg";
import chevronUpIcon from "@tabler/icons/outline/chevron-up.svg";
import gripHorizontalIcon from "@tabler/icons/outline/grip-horizontal.svg";
import nodeTerminalIcon from "../../assets/node-terminal.svg";
import nodeProcessIcon from "../../assets/node-process.svg";
import nodeDecisionIcon from "../../assets/node-decision.svg";
import nodeIoIcon from "../../assets/node-io.svg";
import nodeSubprogramIcon from "../../assets/node-subprogram.svg";
import nodeConnectorIcon from "../../assets/node-connector.svg";
import nodeCommentIcon from "../../assets/node-comment.svg";

/** Node types offered by the palette, in display order. The icons are the flowchart symbols themselves. */
const palette: { node: NodeType; icon: string }[] = [
    { node: 'start', icon: nodeTerminalIcon },
    { node: 'op', icon: nodeProcessIcon },
    { node: 'decision', icon: nodeDecisionIcon },
    { node: 'i/o', icon: nodeIoIcon },
    { node: 'sub', icon: nodeSubprogramIcon },
    { node: 'connector', icon: nodeConnectorIcon },
    { node: 'end', icon: nodeTerminalIcon },
    { node: 'text', icon: nodeCommentIcon },
];

/** Buttons in the top corner: move the canvas, fullscreen. */
export function renderActionMenu(host: WebwriterFlowchart) {
    return html`
        <div class="action-menu" style=${host.fullscreen ? 'top:10px;left:10px;' : ''}>
            ${host.isEditable() || (host.allowStudentEdit && host.allowStudentPan) ? html`
                <sl-tooltip content="${host.msg('Move the canvas')}" placement="bottom">
                    <sl-button
                        id="grab-button"
                        variant=${host.isGrabbing ? 'primary' : 'default'}
                        @click="${host.grabCanvas}"
                    >
                        <sl-icon slot="prefix" src=${grabIcon} label="${host.msg('Move the canvas')}"></sl-icon>
                    </sl-button>
                </sl-tooltip>
            ` : html``}
            <sl-tooltip content="${host.msg('Fullscreen')}" placement="bottom">
                <sl-button @click="${host.view.toggleFullscreen}">
                    <sl-icon slot="prefix" src=${fullscreenIcon} label="${host.msg('Fullscreen')}"></sl-icon>
                </sl-button>
            </sl-tooltip>
        </div>
    `;
}

/** Collapsible palette at the bottom with the node types to place. */
export function renderNodePalette(host: WebwriterFlowchart) {
    if (!(host.allowStudentEdit || host.isEditable())) return html``;
    const toggleLabel = host.flowMenuOpen ? host.msg('Hide elements') : host.msg('Show elements');
    // The abbreviated button label keeps the palette narrow; the node itself keeps the spelled-out caption.
    const buttonLabel = (node: NodeType) => (node === 'i/o' ? host.msg('I/O') : nodeLabel(node, (text) => host.msg(text)));
    return html`
        <div class=${classMap({ 'flowchart-menu': true, collapsed: !host.flowMenuOpen })}>
            <sl-tooltip content="${toggleLabel}" placement="top">
                <button
                    class="flowchart-menu-handle"
                    type="button"
                    aria-expanded=${host.flowMenuOpen ? 'true' : 'false'}
                    aria-controls="flowchart-menu-content"
                    @click="${() => host.toggleMenu('flow')}"
                >
                    <sl-icon class="flowchart-menu-chevron" src=${chevronUpIcon} label=${toggleLabel}></sl-icon>
                </button>
            </sl-tooltip>
            <div class="flowchart-menu-content" id="flowchart-menu-content" ?inert=${!host.flowMenuOpen}>
                ${palette.map(
                    (entry) => html`
                        <sl-button
                            @click="${() => host.addGraphNode(entry.node, newNodeText(entry.node, (text) => host.msg(text)))}"
                            size=${host.fullscreen ? 'medium' : 'small'}
                        >
                            <sl-icon slot="prefix" src=${entry.icon}></sl-icon>
                            ${buttonLabel(entry.node)}
                        </sl-button>
                    `
                )}
            </div>
        </div>
    `;
}

/** Handle below the canvas that drags the widget's height. */
export function renderResizeHandle(host: WebwriterFlowchart) {
    if (!(host.allowStudentEdit || host.isEditable()) || host.fullscreen) return html``;
    return html`<div
        class=${classMap({ 'y-rezise': true, resizing: host.resizing })}
        @pointerdown="${host.view.handleYResizeStart}"
        @pointermove="${host.view.handleYResizeMove}"
        @pointerup="${host.view.handleYResizeEnd}"
        @pointercancel="${host.view.handleYResizeEnd}"
    >
        <sl-icon src=${gripHorizontalIcon}></sl-icon>
    </div>`;
}
