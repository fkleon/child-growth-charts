import { LocalDate, Period } from "@js-joda/core"

// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
// Encoding UTF-8 ⇢ base64
function b64EncodeUnicode(str: string) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

// convert a UTF-8 string to a string in which
// each 16-bit unit occupies only one byte
function toBinary(str: string) {
    const codeUnits = new Uint16Array(str.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = str.charCodeAt(i);
    }
    return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
  }

const reviver = (key: string, value: any): any => {
    if (key == "dateOfBirth" || key == "date") {
        return LocalDate.parse(value)
    }
    if (key == "age") {
        return Period.parse(value)
    }
    return value
}

function exportState<T>(state: T): string {
    const serialisedState = JSON.stringify(state)
    const encodedState = b64EncodeUnicode(serialisedState)
    return `data:application/json;base64,${encodedState}`
}

function importState<T>(state: string): T {
    return JSON.parse(state, reviver)
}

export {
    exportState,
    importState,
}