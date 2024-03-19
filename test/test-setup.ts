/* eslint-disable @typescript-eslint/no-namespace */
import o from 'ospec';
import {JSDOM} from 'jsdom';

// Fill in the globals Mithril.js needs to operate. Also, the first two are often
// useful to have just in tests.
declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
      //requestAnimationFrame: any
    }
  }
}

// <!doctype html><html><body></body></html>
const {window} = new JSDOM('', {
  // So we can get `requestAnimationFrame`
  pretendToBeVisual: true,
});

global.document = window.document;
global.window = global.document.defaultView!;
//global.requestAnimationFrame = window.requestAnimationFrame

// Require Mithril.js to make sure it loads properly.
import 'mithril';

// And now, make sure JSDOM ends when the tests end.
o.after(() => {
  window.close();
});
