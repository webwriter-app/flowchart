import { LitElement, html, css, } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('confirm-prompt')
export class ConfirmPrompt extends LitElement {
   @property({ type: String }) label: string;
   @property({ type: Function }) onConfirm: () => void;
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
      margin-top: 10px;
   }
`;

   render() {
      return html`
         <div>
            <label>${this.label}</label>
            <div class="button-container">
               <button @click="${this.handleCancel}">Abbrechen</button>
               <button @click="${this.handleConfirm}">OK</button>
            </div>
         </div>
      `;
   }

   private boundHandleKeyUp: (event: KeyboardEvent) => void;

   public enableKeyListener() {
      this.boundHandleKeyUp = this.handleKeyUp.bind(this);
      window.addEventListener('keyup', this.boundHandleKeyUp);
  }

  public disableKeyListener() {
      window.removeEventListener('keyup', this.boundHandleKeyUp);
   }

   handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Enter') {
         this.handleConfirm();
      } else if (event.key === 'Escape') {
         this.handleCancel();
      }
   }

   handleConfirm() {
      this.onConfirm();
   }

   handleCancel() {
      this.onCancel();
   }
}
