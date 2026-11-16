export const NODES = [
  { id: "a", node: "start", text: "Start", x: 100, y: 60, connections: [] },
  { id: "b", node: "op", text: "Step", x: 100, y: 160, connections: [] },
];

export const block = (value: unknown) =>
  `<script type="application/json" slot="data">${JSON.stringify(value)}</script>`;

export const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export const until = async (fn: () => unknown, what = "condition") => {
  for (let i = 0; i < 600; i++) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error(`timed out waiting for ${what}`);
};

export const dataOf = (w: Element) => {
  const text = w.querySelector(':scope > script[type="application/json"][slot="data"]')?.textContent ?? "";
  return JSON.parse(text || "{}");
};

export const mount = document.createElement("div");
document.body.append(mount);

export function reset() {
  mount.innerHTML = "";
  document.designMode = "off";
}

export async function make({ edit = false, attrs = "", data = { graphNodes: NODES, taskList: [], helpList: [] } as unknown }: { edit?: boolean; attrs?: string; data?: unknown } = {}): Promise<any> {
  mount.innerHTML = `<webwriter-flowchart height="400" ${attrs} ${edit ? 'contenteditable=""' : ""}>${data ? block(data) : ""}</webwriter-flowchart>`;
  document.designMode = edit ? "on" : "off";
  const w = mount.firstElementChild as any;
  await w.updateComplete;
  await until(() => w.canvas ?? w.shadowRoot?.querySelector("canvas"), "canvas");
  await w.updateComplete;
  return w;
}

export const key = (target: EventTarget, name: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, composed: true, cancelable: true, ...init }));
