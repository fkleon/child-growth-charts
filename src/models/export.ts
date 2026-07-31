import {LocalDate} from '@js-joda/core';

import {nextColour} from './constants';

// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
// Encoding UTF-8 ⇢ base64
function b64EncodeUnicode(str: string) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
}

// biome-ignore lint/suspicious/noExplicitAny: stdlib function
const reviver = (key: string, value: any): any => {
  if (key === 'dateOfBirth' || key === 'date') {
    return LocalDate.parse(value);
  }
  return value;
};

// Version of the persisted/exported state shape. Bump this and add a
// migration to `migrations` whenever the shape of the persisted data
// changes in a way that requires upgrading older data.
const CURRENT_VERSION = 2;

interface PersistedState<T> {
  version: number;
  children: T;
}

// Migrations operate on loosely-typed, versioned data of unknown shape,
// since they may need to read/transform data from any previous version.
// biome-ignore lint/suspicious/noExplicitAny: migrations operate on untrusted, versioned data
type Migration = (data: any) => any;

// Each migration upgrades data from its array index (the "from" version) to
// index + 1. Data exported before versioning existed has no envelope at all
// (a bare children array) - that is treated as version 0.
const migrations: Migration[] = [
  // v0 (bare children array, no envelope) -> v1 (versioned envelope)
  data => (Array.isArray(data) ? {version: 1, children: data} : data),
  // v1 -> v2: backfill a `colourHex` for children that don't have one yet,
  // e.g. exported before the colour picker was introduced. Children that
  // already have a colourHex are left untouched.
  data => ({
    version: 2,
    children: ((data.children as {colourHex?: string}[]) ?? []).reduce(
      (acc: {colourHex?: string}[], child) => {
        const colourHex =
          child.colourHex ?? nextColour(acc.map(c => c.colourHex));
        acc.push({...child, colourHex});
        return acc;
      },
      [],
    ),
  }),
];

// biome-ignore lint/suspicious/noExplicitAny: input is untrusted, parsed JSON of unknown version
function migrate(data: any): PersistedState<unknown> {
  let migrated = data;

  while ((migrated?.version ?? 0) < CURRENT_VERSION) {
    const step = migrations[migrated?.version ?? 0];
    if (!step) {
      throw new Error(
        `No migration available from version ${migrated?.version ?? 0}`,
      );
    }
    migrated = step(migrated);
  }

  if (migrated?.version !== CURRENT_VERSION) {
    throw new Error(`Unsupported data version: ${migrated?.version}`);
  }

  return migrated;
}

function exportState<T>(children: T): string {
  const state: PersistedState<T> = {version: CURRENT_VERSION, children};
  return JSON.stringify(state);
}

function exportStateBase64Url<T>(children: T): string {
  const serialisedState = exportState(children);
  const encodedState = b64EncodeUnicode(serialisedState);
  return `data:application/json;base64,${encodedState}`;
}

function importState<T>(serialisedState: string): T {
  const parsed = JSON.parse(serialisedState, reviver);
  const migrated = migrate(parsed);
  return migrated.children as T;
}

export {
  CURRENT_VERSION,
  exportState,
  exportStateBase64Url,
  importState,
  migrate,
  type PersistedState,
};
