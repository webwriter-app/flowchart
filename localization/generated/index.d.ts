import { configureLocalization } from '@lit/localize';

/** Runtime localization for the widget, wired up in `index.js` of this folder. */
declare const localization: ReturnType<typeof configureLocalization>;

export default localization;
