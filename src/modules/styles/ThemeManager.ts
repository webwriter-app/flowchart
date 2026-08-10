import { GraphTheme } from "../../definitions/GraphTheme";

export class ThemeManager {
   private themes: GraphTheme[] = [];

   constructor() {
      this.addTheme({
         name: 'standard',
         startEndColor: '#FF6961',
         opColor: '#FFEC8B',
         decisionColor: '#4F94CD',
         connectorColor: '#C6CBC4',
         ioColor: '#49B675',
         subColor: '#C6CBC4',
      });
      this.addTheme({
         name: 'pastel',
         startEndColor: '#ffb3ba',
         opColor: '#ffffba',
         decisionColor: '#bae1ff',
         connectorColor: '#c0c5ce',
         ioColor: '#baffc9',
         subColor: '#c0c5ce',
      });
      this.addTheme({
         name: 'mono',
         startEndColor: '#87C3E7',
         opColor: '#87C3E7',
         decisionColor: '#87C3E7',
         connectorColor: '#87C3E7',
         ioColor: '#87C3E7',
         subColor: '#87C3E7',
      });
      this.addTheme({
         name: 's/w',
         startEndColor: '#FFFFFF',
         opColor: '#FFFFFF',
         decisionColor: '#FFFFFF',
         connectorColor: '#FFFFFF',
         ioColor: '#FFFFFF',
         subColor: '#FFFFFF',
      });
   }

   // Gibt das Theme mit dem Namen zurück, oder undefined wenn es keines gibt
   findTheme(name: string) {
      return this.themes.find(theme => theme.name === name);
   }

   // Gibt das Theme mit dem Namen zurück, bei einem unbekannten Namen das Standard-Theme
   getTheme(name: string): GraphTheme {
      return this.findTheme(name) ?? this.themes[0];
   }

   addTheme(theme: GraphTheme) {
      // Überprüfen, ob das Theme bereits existiert
      if (this.findTheme(theme.name)) {
         throw new Error('Theme mit diesem Namen existiert bereits');
      }
      this.themes.push(theme);
   }
}