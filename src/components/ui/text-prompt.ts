import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import { setArrowText } from '../../model/graph-edit';
import { nodeLabel } from '../../model/node-labels';

/** @internal The dialog that edits the caption of a node or an arrow. Its state, `textPrompt`, lives on the widget. */
export class TextPrompt {
    constructor(private host: WebwriterFlowchart) {}

    /** Open the prompt for the node or arrow at `index`. */
    show(type: 'node' | 'arrow', index: number) {
        const { graphNodes, arrows } = this.host;
        const currentText = (type === 'node' ? graphNodes[index].text : arrows[index].text || '').trim();
        this.host.textPrompt = { type, index, value: currentText };
    }

    /** Move focus into the input once the dialog is ready for it. */
    focusInput = (event: Event) => {
        event.preventDefault();
        (this.host.shadowRoot?.getElementById('text-prompt-input') as SlInput | null)?.focus();
    };

    /** Enter submits; Escape is handled by `sl-dialog` itself. */
    handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            this.submit();
        }
    };

    /** Apply the text to the node or arrow the prompt was opened for. */
    submit = () => {
        const host = this.host;
        const prompt = host.textPrompt;
        if (!prompt) {
            return;
        }

        const input = host.shadowRoot?.getElementById('text-prompt-input') as SlInput | null;
        const value = (input?.value ?? '').trim();

        if (prompt.type === 'node') {
            const node = host.graphNodes[prompt.index];
            const text = value || nodeLabel(node.node, host.msg);
            node.text = node.node === 'decision' ? '  ' + text + '  ' : text;
        } else {
            setArrowText(host.arrows[prompt.index], value);
        }

        // Both cases change graphNodes only in place; this makes the change visible to the data block
        host.graphNodes = [...host.graphNodes];
        host.view.redrawCanvas();
        host.textPrompt = null;
    };

    /** Close any open prompt. Escape and overlay clicks are handled by `sl-dialog`. */
    hide = () => {
        this.host.textPrompt = null;
        this.host.confirmOpen = false;
    };
}
