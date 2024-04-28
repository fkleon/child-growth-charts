import o from 'ospec';
import mq from 'mithril-query';
import {ChartSelectorComponent} from '../src/views/chart';
import {
  ChartState,
  ChartActions,
  MitosisAttr,
  IChartActions,
  Chart,
} from '../src/models/state';

o.spec('ChartSelectorComponent', () => {
  o('renders with minimal state', () => {
    const state = ChartState();
    const actions = ChartActions(state);
    const attrs: MitosisAttr<Chart, IChartActions> = {state, actions};

    const out = mq(ChartSelectorComponent, attrs);
    o(out.rootNode).notEquals(null);

    out.should.have(1, 'select');
  });
});
