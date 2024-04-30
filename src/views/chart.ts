import m from 'mithril';

import {LineChart, LineChartData, SeriesObject, SeriesValue} from 'chartist';
import charts from '../data/who';
import {Chart, IChartActions, MitosisAttr} from '../models/state';

const ChartSelectorComponent: m.Component<MitosisAttr<Chart, IChartActions>> = {
  oninit({attrs: {state, actions}}) {
    actions.loadChart(state.name);
  },
  view({attrs: {state, actions}}) {
    return m(
      'fieldset',
      m('legend', 'Child Growth Standard'),
      m(
        'ul',
        m(
          'li',
          m(
            'label',
            {for: 'chart-select'},
            'Select a ',
            m(
              'a',
              {
                href: 'https://www.who.int/tools/child-growth-standards/standards',
              },
              'WHO Child Growth Standard'
            ),
            ':'
          )
        ),
        m(
          'li',
          m(
            'select',
            {
              id: 'chart-select',
              onchange: (e: Event) =>
                actions.loadChart((e.currentTarget as HTMLSelectElement).value),
              value: state.name,
            },
            Object.entries(charts).map(([name, chart]) =>
              m('option', {value: name}, chart.label)
            )
          )
        )
      )
    );
  },
};

function ChartComponent(): m.Component<Chart> {
  let chart: LineChart;
  let data: LineChartData;

  function updateData(attrs: Chart) {
    const baseData = attrs.config?.data ?? {
      labels: [],
      series: [],
    };

    // base data contains the percentile lines
    // map percentiles to ct-series-{a,b,c}
    const percentileNameSequence = [0, 1, 2, 1];
    const base: SeriesObject<number>[] = baseData.series.map((s, i) => ({
      name: `percentile-${i}`,
      className: `ct-series-${String.fromCharCode(
        97 + percentileNameSequence[i % 4]
      )}`,
      data: s as SeriesValue<number>[],
    }));

    // series data contains the measurement lines
    data = {
      labels: baseData.labels,
      series: [...base, ...attrs.data],
    };
  }

  return {
    oninit({attrs}) {
      // TODO use named series
      updateData(attrs);
    },
    oncreate({dom, attrs}) {
      const chartElement = dom.querySelector('#chart');
      chart = new LineChart(chartElement, data, attrs.config?.options);
      m.redraw();
    },
    onupdate({attrs}) {
      updateData(attrs);
      chart?.update(data, attrs.config?.options);
    },
    view({attrs}) {
      return m(
        'fieldset',
        m('legend', attrs.config?.label),
        m('div', {id: 'chart'}),
        m(
          'ul',
          {class: 'ct-legend'},
          m('li', {class: 'ct-series-a'}, '3th & 97th percentile'),
          m('li', {class: 'ct-series-b'}, '15th & 85th percentile'),
          m('li', {class: 'ct-series-c'}, '50th percentile')
        )
      );
    },
  };
}

export {ChartSelectorComponent, ChartComponent};
