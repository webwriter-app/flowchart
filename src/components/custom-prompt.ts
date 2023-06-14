import { LitElement, html, css, } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('custom-prompt')
export class CustomPrompt extends LitElement {
   @property({ type: String }) label: string;
   @property({ type: Function }) onSubmit: (value: string) => void;
   @property({ type: Function }) onCancel: () => void;

   static styles = css`
      :host {
         position: fixed;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         padding: 20px;
         box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
         z-index: 1000;
         background-color: var(--menu-color);
         border-radius: var(--border-r);
         display: flex;
         flex-direction: column;
      }
      label {
         color: white;
         font-family: 'Arial';
         margin-bottom: 10px;
         margin-right: 10px;
      }
      input {
         background-color:	#546c7e;
         border-radius: var(--border-r);
         color: white;
         margin-bottom: 10px;
         padding: 10px;
         font-size: 16px;
      }
      button {
         background-color: var(--button-color);
         color: white;
         border: none;
         width: 50%;
         border-radius: var(--border-r);
         font-family: 'Arial';
         font-size: 12px;
         padding: 10px;
         margin-bottom: 5px;
         margin-top: 5px;
         transition: background-color 0.3s;
      }
      button:hover {
         background-color: var(--hover-color);
      }
      button:last-child {
         margin-left: 10px;
      }
      button:active {
         background-color: var(--button-color); 
         box-shadow: 0px 0px 5px var(--hover-color);
      }
      .button-container {
         display: flex;
      }
  `;

   render() {
      return html`
         <div>
            <label>${this.label}</label>
            <input type="text" @keyup="${this.handleKeyUp}" />
            <div class="button-container">
               <button @click="${this.handleCancel}">Abbrechen</button>
               <button @click="${this.handleSubmit}">OK</button>
            </div>
         </div>
    `;
   }

   handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Enter') {
         this.handleSubmit();
      } else if (event.key === 'Escape') {
         this.handleCancel();
      }
   }

   handleSubmit() {
      const input = this.shadowRoot.querySelector('input');
      if (input) {
         this.onSubmit(input.value);
         input.value = '';
      }
   }

   handleCancel() {
      const input = this.shadowRoot.querySelector('input');
      if (input) {
         input.value = '';
      }
      this.onCancel();
   }

   setInputValue(value: string) {
      const inputElement = this.shadowRoot.querySelector('input'); 
      if (inputElement) {
        inputElement.value = value;
      }
    }
}


