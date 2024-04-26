import m from 'mithril';

import {ChartComponent, ChartSelectorComponent} from './chart';

import ChildComponent from './child';
import {
  App,
  ChartActions,
  Child,
  ChildActions,
  IAppActions,
  Measurement,
  MitosisAttr,
} from '../models/state';
import {Series} from 'chartist';
import {ChronoUnit, LocalDate, Period} from '@js-joda/core';
import {exportState, importState} from '../models/export';
import {dateHistogram, dateHistogramAggregation} from '../models/timeseries';

function bucketInto(
  origin: LocalDate,
  measurements: Measurement[],
  timeUnit: ChronoUnit,
  maxBuckets: number,
  fieldAccessor: (m: Measurement) => number | undefined
): Series {
  // as timeseries
  let interval;

  switch (timeUnit) {
    case ChronoUnit.DAYS:
      interval = Period.ofDays(1);
      break;
    case ChronoUnit.WEEKS:
      interval = Period.ofWeeks(1);
      break;
    case ChronoUnit.MONTHS:
      interval = Period.ofMonths(1);
      break;
    default:
      throw 'Unsupported timeunit: ' + timeUnit;
  }

  const originMeasurement: Measurement = {idx: -1, date: origin};

  // Drop anything before origin
  const filteredMeasurements = measurements.filter(
    m => !m.date.isBefore(origin)
  );

  const normalised: Series = Array(maxBuckets).fill(null);

  const histogram = dateHistogram(
    [originMeasurement, ...filteredMeasurements],
    m => m.date,
    interval
  );

  const histogramAggregation = dateHistogramAggregation(
    histogram,
    fieldAccessor
  );

  for (const [n, bucket] of histogramAggregation.buckets.entries()) {
    if (n >= maxBuckets) {
      break;
    }

    // Filter missing values as null
    const aggregatedValue = Number.isFinite(bucket.value) ? bucket.value : null;

    normalised.splice(n, 1, aggregatedValue);
  }

  return normalised;
}

const AppComponent: m.Component<MitosisAttr<App, IAppActions>> = {
  oninit({attrs: {state}}) {
    // pass
  },

  view({attrs: {state, actions}}) {
    const children = state.children.map((child, idx) => {
      child.idx = idx;
      return m(ChildComponent, {
        state: child,
        actions: ChildActions(actions, child),
      });
    });

    // Populate chart data
    if (state.chart.config) {
      const {data, offset, timeUnit, sex, accessorFn} = state.chart.config!;
      const bucketCount = data.labels?.length ?? 0;

      const childData: Series[] = state.children
        .filter(c => c.dateOfBirth)
        .filter(c => c.sex == null || c.sex === sex)
        .map(c =>
          bucketInto(
            c.dateOfBirth!.plus(offset),
            c.measurements,
            timeUnit,
            bucketCount,
            accessorFn
          )
        );
      state.chart.currentData = childData;
    }

    const stateUrl = exportState(state.children);

    return [
      m(
        'header',
        m(
          'div',
          {
            class: 'logo',
            alt: 'Sketch of old school scales next to a measuring tape',
          },
          m('span', 'Interactive Child Growth Charts')
        )
      ),
      m('hr'),
      m('p', 'Because paper charts are hard.'),
      m(
        'fieldset',
        m('legend', 'Data management'),
        m(
          'ul',
          m(
            'li',
            m('label', {for: 'export', class: 'main'}, 'Export data'),
            m(
              'a',
              {id: 'export', href: stateUrl, download: 'growth-data.json'},
              '💾 Download'
            )
          ),
          m(
            'li',
            m('label', {for: 'import', class: 'main'}, 'Import data'),
            m('input', {
              type: 'file',
              id: 'import',
              accept: 'application/json',
              onchange: (e: Event) => {
                const name = (e.currentTarget as HTMLInputElement).value;
                const file = (e.currentTarget as HTMLInputElement).files?.[0];
                const reader = new FileReader();
                reader.onload = () => {
                  const state: Child[] = importState(reader.result as string);
                  actions.import(state);
                  // force redraw as this event is not managed by mithril
                  m.redraw();
                };
                if (file) {
                  reader.readAsText(file);
                  (e.currentTarget as HTMLInputElement).value = '';
                }
              },
            })
          )
        )
      ),
      m('h2', 'Children'),
      children,
      m(
        'button',
        {
          onclick: () => {
            actions.addChild();
          },
        },
        'Add child'
      ),
      m('h2', 'Growth Chart'),
      m(ChartSelectorComponent, {
        state: state.chart,
        actions: ChartActions(state.chart),
      }),
      m(ChartComponent, state.chart),
    ];
  },
};

export default AppComponent;
