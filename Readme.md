# ADPC prototype browser extension

This is a proof-of-concept implementation of the [Advanced Data Protection Control][1] (ADPC) mechanism, in the form of a browser extension. See the website, [dataprotectioncontrol.org][1], for more information.

[1]: https://www.dataprotectioncontrol.org/


## Try this extension

See <https://dataprotectioncontrol.org/prototype> for instructions to get it and try it out.


## Developing this extension

To build or work on the code yourself, clone this repository then install the dependencies using [yarn][] by running `yarn install`.

Run `yarn build` to bundle the code, or `yarn dev` to rebuild it continuosly while editing the source. Run `yarn start` to try run it in Firefox.


### Code anatomy

This browser extension is written using [TypeScript][] and [Svelte][], using [Rollup][] to bundle the scripts, [webextension-polyfill][] to support Chromium-based browsers, and a sprinkle of [bootstrap][] to make it prettier.

The extension’s background script (`src/background/`) listens to all HTTP requests to detect whether a website would like to request the user’s consent via the HTTP header-based approach. The content script (`src/content/`) makes the JavaScript API available to every webpage at `window.navigator.dataProtectionControl`, and communicates with the background script’s functions using [webextension-rpc][].

The main user interface components are the pop-up (`src/popup`) and the ‘control centre’ (`src/options`). Because the extension is unable to open the pop-up by itself (without the user having triggered it), a work-around is used to show the pop-up as a pop-in, i.e. by adding an `iframe` in the corner of the web page that loads the content of the pop-up.

All storage is in the browser extension’s `sync` storage area, where every website has its own entry with storage data related to that site, e.g. `data:example.org` would hold the consent requests and the user’s responses for `example.org`. Another entry in the storage is `userPreferences`.

[yarn]: https://yarnpkg.com
[TypeScript]: https://www.typescriptlang.org/
[Svelte]: https://svelte.dev/
[Rollup]: https://rollupjs.org/
[webextension-polyfill]: https://github.com/mozilla/webextension-polyfill/
[bootstrap]: https://getbootstrap.com/
[webextension-rpc]: https://code.treora.com/gerben/webextension-rpc
