import Popup from "./Popup.svelte";
import "./tailwind.css";
import { remoteFunction } from 'webextension-rpc';

function close() {
  window.close(); // For pop-up
  remoteFunction('hidePopin')(); // For pop-in
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape') close();
});

const app = new Popup({
  target: document.body,
  props: {
    close,
  },
});

export default app;
