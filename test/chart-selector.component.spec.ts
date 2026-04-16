import mq from 'mithril-query';
import o from 'ospec';

import {
  type Chart,
  ChartActions,
  ChartState,
  type IChartActions,
  type MitosisAttr,
} from '../src/models/state';
import {ChartSelectorComponent} from '../src/views/chart';

o.spec('ChartSelectorComponent', () => {
  o('renders with minimal state', () => {
    const state = ChartState();
    const actions = ChartActions(state);
    const attrs: MitosisAttr<Chart, IChartActions> = {state, actions};

    const out = mq(ChartSelectorComponent, attrs);
    o(out.rootEl).notEquals(null);

    out.should.have(1, 'select');
  });
});
