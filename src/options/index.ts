import 'bootstrap/dist/css/bootstrap.min.css';
import OptionsPage from "./OptionsPage.svelte";

function main() {
  new OptionsPage({
    target: document.body,
  });
}

main();

export {}
