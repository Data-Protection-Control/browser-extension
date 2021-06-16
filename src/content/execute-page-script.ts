export function executePageScript(pageScriptContent: string) {
  const scriptElement = document.createElement('script');
  scriptElement.textContent = pageScriptContent;
  (document.head || document.documentElement).appendChild(scriptElement);
  scriptElement.remove();
}

export function maybeClone(value: any) {
  // In Firefox, we need to give the page script access to the content script object.
  // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#cloneinto
  // @ts-ignore
  if (globalThis.cloneInto) return cloneInto(value, window);
  // In Chromium, there is no such requirement.
  else return value;
}
