import mq from 'mithril-query';
import o from 'ospec';

import {LocalDate} from '@js-joda/core';

import {type DateAttrs, DateInput} from '../src/views/html';

o.spec('DateInput component', () => {
  o('renders with minimal state', () => {
    const value = LocalDate.of(2024, 3, 14);
    const attrs: DateAttrs = {
      initialValue: value,
      dateChanged: () => null,
    };
    const out = mq(DateInput, attrs);
    o(out.rootNode).notEquals(null);

    out.should.have(1, "input[value='2024-03-14']");
  });
});
