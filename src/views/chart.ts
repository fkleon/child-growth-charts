import m from 'mithril';

import {
  LineChart,
  type LineChartData,
  type SeriesObject,
  type SeriesValue,
} from 'chartist';

import charts from '../data/who';
import type {Chart, IChartActions, MitosisAttr} from '../models/state';

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
              'WHO Child Growth Standard',
            ),
            ':',
          ),
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
              m('option', {value: name}, chart.label),
            ),
          ),
        ),
      ),
    );
  },
};

type ChartComponentAttrs = Chart & {
  /** Colour and display label per child series name (e.g. `child-0`), used
      to style the corresponding line/points and legend entry to match the
      colour picked for that child. */
  childColours?: Record<string, {label: string; colour: string}>;
};

function ChartComponent(): m.Component<ChartComponentAttrs> {
  let chart: LineChart;
  let data: LineChartData;
  let childColours: Record<string, {label: string; colour: string}> = {};

  function updateData(attrs: ChartComponentAttrs) {
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
        97 + percentileNameSequence[i % 4],
      )}`,
      data: s as SeriesValue<number>[],
    }));

    // series data contains the measurement lines
    data = {
      labels: baseData.labels,
      series: [...base, ...attrs.data],
    };

    childColours = attrs.childColours ?? {};
  }

  // Applies the colour picked for a child to that child's line/points,
  // overriding the CSS-class based colouring used for the fixed set of
  // percentile series.
  function applySeriesColour(context: {
    type: string;
    series?: {name?: string};
    element: {attr(attributes: Record<string, string>): unknown};
  }) {
    const name = context.series?.name;
    const colour = name ? childColours[name]?.colour : undefined;

    if (colour && (context.type === 'line' || context.type === 'point')) {
      context.element.attr({style: `stroke: ${colour}`});
    }
  }

  return {
    oninit({attrs}) {
      // TODO use named series
      updateData(attrs);
    },
    oncreate({dom, attrs}) {
      const chartElement = dom.querySelector('#chart');
      chart = new LineChart(chartElement, data, attrs.config?.options);
      chart.on('draw', applySeriesColour);
      m.redraw();
    },
    onupdate({attrs}) {
      updateData(attrs);
      chart?.update(data, attrs.config?.options);
    },
    view({attrs}) {
      const childLegend = Object.values(childColours).map(({label, colour}) =>
        m('li', {style: `border-left: 12px solid ${colour}`}, label),
      );

      return m(
        'fieldset',
        m('legend', attrs.config?.label),
        m('div', {id: 'chart'}),
        m(
          'ul',
          {class: 'ct-legend'},
          m('li', {class: 'ct-series-a'}, '3th & 97th percentile'),
          m('li', {class: 'ct-series-b'}, '15th & 85th percentile'),
          m('li', {class: 'ct-series-c'}, '50th percentile'),
          childLegend,
        ),
      );
    },
  };
}

export {ChartComponent, ChartSelectorComponent};
