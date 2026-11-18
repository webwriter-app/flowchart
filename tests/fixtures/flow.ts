/** A loop with a decision, in the Mermaid flowchart syntax the widget imports. */
export const flowMmd = "%% A loop with a decision\nflowchart TD\n    A([Start]) --> B[Read number]\n    B --> C{Is it even?}\n    C -->|Yes| D[/Print \"even\"/]\n    C -- No --> E[[Count up]]\n    E --> B\n    D --> F([End])\n";
