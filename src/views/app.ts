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
import {Series, SeriesObject} from 'chartist';
import {ChronoUnit, LocalDate, Period} from '@js-joda/core';
import {exportState, exportStateBase64Url, importState} from '../models/export';
import {dateHistogram, dateHistogramAggregation} from '../models/timeseries';
import {COLOURS, LOCAL_STORAGE_KEY} from '../models/constants';

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
  oninit({attrs: {actions}}) {
    // load state from local storage
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data !== null) {
      const state: Child[] = importState(data);
      actions.import(state);
    }
  },

  onupdate({attrs: {state}}) {
    // save state into local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, exportState(state.children));
  },

  view({attrs: {state, actions}}) {
    const children = state.children.map((child, idx) => {
      child.idx = idx;
      // TODO remove after colour picker is fully implemented
      child.colourHex = COLOURS[idx % COLOURS.length];
      return m(ChildComponent, {
        state: child,
        actions: ChildActions(actions, child),
      });
    });

    // Populate chart data
    if (state.chart.config) {
      const {data, offset, timeUnit, sex, accessorFn} = state.chart.config!;
      const bucketCount = data.labels?.length ?? 0;

      const childData: SeriesObject[] = state.children
        .filter(c => c.dateOfBirth)
        .filter(c => c.sex == null || c.sex === sex)
        .map(c => ({
          name: `child-${c.idx}`,
          className: `ct-series-${String.fromCharCode(97 + c.idx + 3)}`,
          data: bucketInto(
            c.dateOfBirth!.plus(offset),
            c.measurements,
            timeUnit,
            bucketCount,
            accessorFn
          ),
        }));

      state.chart.data = childData;
    }

    const {quote, author, source} = state.tagline;

    return [
      m(
        'header',
        m('.logo', {
          alt: 'Baby on weighing scales as pixel art',
        }),
        m(
          '.title-container',
          m('.title', 'Child Growth Charts'),
          m(
            '.tagline',
            m(
              'blockquote',
              m('p', quote),
              m('footer', `—${author}, `, m('cite', source))
            )
          )
        )
      ),
      m('h2#children', 'Children'),
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
      m('h2#growth-chart', 'Growth Chart'),
      m(ChartSelectorComponent, {
        state: state.chart,
        actions: ChartActions(state.chart),
      }),
      m(ChartComponent, state.chart),
      m('h2#your-data', 'Your Data'),
      m(DataManagementComponent, {state, actions}),
    ];
  },
};

const DataManagementComponent: m.Component<MitosisAttr<App, IAppActions>> = {
  view({attrs: {state, actions}}) {
    const stateUrl = exportStateBase64Url(state.children);

    return m(
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
    );
  },
};

export default AppComponent;
