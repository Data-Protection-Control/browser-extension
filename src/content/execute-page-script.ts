export function executePageScript(pageScriptContent: string) {
  const scriptElement = document.createElement('script');
  scriptElement.textContent = pageScriptContent;
  (document.head || document.documentElement).appendChild(scriptElement);
  scriptElement.remove();
}
