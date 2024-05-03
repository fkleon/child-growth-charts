import {LocalDate, Period} from '@js-joda/core';

// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
// Encoding UTF-8 ⇢ base64
function b64EncodeUnicode(str: string) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reviver = (key: string, value: any): any => {
  if (key === 'dateOfBirth' || key === 'date') {
    return LocalDate.parse(value);
  }
  return value;
};

function exportState<T>(state: T): string {
  return JSON.stringify(state);
}

function exportStateBase64Url<T>(state: T): string {
  const serialisedState = exportState(state);
  const encodedState = b64EncodeUnicode(serialisedState);
  return `data:application/json;base64,${encodedState}`;
}

function importState<T>(state: string): T {
  return JSON.parse(state, reviver);
}

export {exportState, exportStateBase64Url, importState};
