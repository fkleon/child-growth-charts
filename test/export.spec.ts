import o from 'ospec';

import {LocalDate} from '@js-joda/core';

import {
  CURRENT_VERSION,
  exportState,
  importState,
  migrate,
} from '../src/models/export';

o.spec('Export/import versioning', () => {
  o('round-trips current version data', () => {
    const children = [{idx: 0, date: LocalDate.of(2024, 1, 1), name: 'Ava'}];
    const serialised = exportState(children);
    const imported = importState<typeof children>(serialised);

    o(imported.length).equals(1);
    o(imported[0].idx).equals(0);
    o(imported[0].name).equals('Ava');
    o(imported[0].date.toString()).equals('2024-01-01');
  });

  o('exports the current version', () => {
    const serialised = exportState([]);
    const parsed = JSON.parse(serialised);

    o(parsed.version).equals(CURRENT_VERSION);
  });

  o('migrates legacy data with no envelope (version 0)', () => {
    const legacy = [{idx: 0, name: 'Legacy child'}];
    const serialised = JSON.stringify(legacy);

    const imported = importState<typeof legacy>(serialised);

    o(imported.length).equals(1);
    o(imported[0].name).equals('Legacy child');
  });

  o('throws on data from an unsupported future version', () => {
    const future = {version: CURRENT_VERSION + 1, children: []};

    o(() => migrate(future)).throws(Error);
  });

  o('throws when no migration path exists for the given version', () => {
    const unknownShape = {version: -1, foo: 'bar'};

    o(() => migrate(unknownShape)).throws(Error);
  });
});
