/**
 * Page script RPC — expose functions to page’s scripts
 *
 * Normally, scripts of the web pages and content scripts of the browser
 * extension cannot see each other’s variables, except the naked DOM.
 * This module defines a remote procedure call system to let the web page
 * invoke functions that are executed in context of the content script.
 *
 * The exposed function exposed to the page will always be async.
 *
 * Example usage:
 *
 *     exposeToPage({
 *       'window.brewTea': async function brewTea(cups) { return `${cups} cups of tea!` }
 *     })
 *
 * More info, for Chromium: https://developer.chrome.com/docs/extensions/mv2/content_scripts/#host-page-communication
 * For Firefox, a simpler approach should also work, using exportFunction(): https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#exportfunction
 */

import { executePageScript, maybeClone } from "./execute-page-script";

interface RpcInvocationMessage {
  funcName: string;
  args: any[];
  nonce: string;
}

interface RpcResponseMessage {
  inResponseToNonce: string;
  rpcErrorMessage?: string,
  errorMessage?: string;
  returnValue?: any;
}

type AnyFunction = ((...args: any[]) => any) | undefined;

interface ListOfFunctions {
  [funcName: string]: AnyFunction;
}

export function exposeToPage(functions: ListOfFunctions) {
  // Create random event names, to avoid conflicts if exposeToPage is used multiple times.
  const randomString = Math.random().toString(36).slice(2);
  const rpcInvocationEventName = `__RPC_INVOCATION__${randomString}`;
  const rpcResponseEventName = `__RPC_RESPONSE__${randomString}`;

  // Make a listener for events that invokes the requested function
  async function rpcInvocationEventListener(event: CustomEvent<RpcInvocationMessage>) {
    const inResponseToNonce = event.detail.nonce;
    const funcName = event.detail.funcName;
    const args = event.detail.args;
    const func = functions[funcName];

    function sendResponse(responseMessage: RpcResponseMessage) {
      document.dispatchEvent(new CustomEvent(
        rpcResponseEventName,
        maybeClone({ detail: responseMessage }),
      ));
    }

    if (func === undefined) {
      console.error(`Received RPC for unknown function: ${funcName}`);
      sendResponse({
        inResponseToNonce,
        rpcErrorMessage: `No such function registered for RPC: ${funcName}`,
      });
    } else {
      // Run the function
      let returnValue: any;
      try {
        returnValue = await func(...args);
      } catch (error) {
        sendResponse({
          inResponseToNonce,
          errorMessage: error.message,
        });
      }

      // Return its result to the calling side
      sendResponse({
        inResponseToNonce,
        returnValue,
      });
    }
  }

  document.addEventListener(rpcInvocationEventName,
    (event) => {
      rpcInvocationEventListener(event as CustomEvent<RpcInvocationMessage>);
    }
  );

  // Compose a script to add to the page
  const pageScriptParts = [];

  // Make the page listen for responses from invoked remote functions.
  const pageScriptInitialiseEventListener = `
    const rpcCallsWaitingForResponse = {};

    function rpcResponseEventListener(event) {
      const responseMessage = event.detail;
      const nonce = responseMessage.inResponseToNonce;
      const callback = rpcCallsWaitingForResponse[nonce];
      callback(responseMessage);
      delete rpcCallsWaitingForResponse[nonce];
    }
    document.addEventListener('${rpcResponseEventName}', rpcResponseEventListener);
  `;
  pageScriptParts.push(pageScriptInitialiseEventListener);

  // Define the ‘proxy’ for each of the given functions
  Object.keys(functions).forEach((funcNameWithPath: string) => {
    // Define parent objects if needed
    if (funcNameWithPath.includes('.')) {
      pageScriptParts.push(`
        '${funcNameWithPath}'.split('.').slice(0, -1).reduce((obj, attr) => {
          if (obj[attr] === undefined) obj[attr] = {};
          return obj[attr];
        }, globalThis);
      `);
    }
    const funcNameWithoutPath = funcNameWithPath.split('.').slice(-1)[0];
    pageScriptParts.push(`
      globalThis.${funcNameWithPath} = async function ${funcNameWithoutPath}(...args) {
        const returnValue = new Promise((resolve, reject) => {
          // Coin a nonce to recognise which event brings the matching response.
          const nonce = Math.random().toString(36).slice(2);

          // Register this a callback for our response event
          rpcCallsWaitingForResponse[nonce] = function callback(responseMessage) {
            if (responseMessage.rpcErrorMessage) {
              reject(new Error('RPC Error: ' + responseMessage.rpcErrorMessage));
            } else if (responseMessage.errorMessage) {
              reject(new Error(responseMessage.errorMessage));
            } else {
              resolve(responseMessage.returnValue);
            }
          };

          // Trigger the content script and hope for the best
          const rpcInvocationMessage = { funcName: '${funcNameWithPath}', args, nonce };
          document.dispatchEvent(new CustomEvent(
            '${rpcInvocationEventName}',
            { detail: rpcInvocationMessage },
          ));
        });
        return await returnValue;
      }
    `);
  });

  const pageScriptContent = `(function(){
    ${pageScriptParts.join('\n')}
  })();`;
  executePageScript(pageScriptContent);
}
