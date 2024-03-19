import m from 'mithril'

import { ChartComponent, ChartSelectorComponent } from './chart';

import ChildComponent from './child'
import { App, ChartActions, ChildActions, ChildState, IAppActions, Measurement, MitosisAttr } from '../models/state';
import { Series } from 'chartist';
import { ChronoUnit, LocalDate, Period } from '@js-joda/core';
import { ChartConfig } from '../data/who';
import { exportState, importState } from '../models/export';
import { dateHistogram } from '../models/timeseries';

function bucketInto(
  origin: LocalDate, measurement: Measurement[], timeUnit: ChronoUnit, maxBuckets: number,
  fieldAccessor: (m: Measurement) => number | undefined,
): Series {
  // as timeseries
  let interval

  switch(timeUnit) {
    case ChronoUnit.DAYS:
      interval = Period.ofDays(1)
      break;
    case ChronoUnit.WEEKS:
      interval = Period.ofWeeks(1)
      break;
    case ChronoUnit.MONTHS:
      interval = Period.ofMonths(1)
      break
    default:
      throw "Unsupported timeunit: " + timeUnit
  }

  const originMeasurement: Measurement = { idx: -1, focus: false, date: origin}

  // TODO pass min/max dates
  const histogram = dateHistogram(
    [originMeasurement, ...measurement],
    (m) => m.date,
    interval,
  )

  const normalised: Series = Array(maxBuckets).fill(null)
  for (const [n, bucket] of histogram.buckets.entries()) {
    if (n >= maxBuckets) {
      break;
    }
    // aggregated values in date bucket
    // TODO implement in timeseries.ts
    const numericValues = bucket.values
      .map((m) => fieldAccessor(m))
      .filter((v): v is number => !!v)

    // TODO: configurable aggregation function
    const aggregatedValue = numericValues.length ? Math.min(...numericValues) : null

    normalised.splice(n, 1, aggregatedValue)
  }

  return normalised
}

const AppComponent: m.Component<MitosisAttr<App, IAppActions>> = {

  oninit({attrs: {state}}) {
    state.children = [
      ChildState(),
    ]
  },

  view({attrs: {state, actions}}) {
    const children = state.children.map((child, idx) => {
      child.idx = idx
      return m(ChildComponent, {
        state: child,
        actions: ChildActions(actions, child),
      })
    })

    // TODO: wrong place here
    const chartState = state.chart
    const chartActions = ChartActions(state.chart)

    if (state.chart.config) {
      let accessor: (m: Measurement) => number | undefined;

      if (state.chart.name.includes('wfa')) {
        accessor = (m) => m.weight;
      } else if (state.chart.name.includes('hfa')) {
        accessor = (m) => m.length
      } else {
        accessor = (m) => m.head
      }

      const sex = state.chart.name.includes('girls') ? 'female' : 'male'

      const childData: Series[] = state.children
        .filter(c => c.dateOfBirth)
        .filter(c => (c.sex == null) || (c.sex == sex))
        .map(c => bucketInto(
          c.dateOfBirth!, c.measurements,
          state.chart.config!.timeUnit, state.chart.config!.data.labels?.length ?? 0,
          accessor)
        )
      chartState.currentData = childData;
    }
    
    const stateUrl = exportState(state.children)

    return [
      m("header",
        m("div", { class: "logo", alt: "Sketch of old school scales next to a measuring tape" },
          m("span", "Interactive Child Growth Charts")
        )),
      m("hr"),
      m("p", "Because paper charts are hard."),
      m("fieldset",
        m("legend", "Data management"),
        m("ul",
          m("li",
            m("label", { for: "export", class: "main" }, "Export data"),
            m("a", { id: "export", href: stateUrl, download: "growth-data.json" }, "💾 Download"),
          ),
          m("li",
            m("label", { for: "import", class: "main" }, "Import data"),
            m("input", { type: "file", id: "import", accept: "application/json",
              onchange: (e: Event) => {
                const name = (e.currentTarget as HTMLInputElement).value
                const file = (e.currentTarget as HTMLInputElement).files?.[0]
                const reader = new FileReader()
                reader.onload = (e) => {
                  const state: any[] = importState(reader.result as string)
                  actions.import(state)
                  // force redraw as this event is not managed by mithril
                  m.redraw()
                }
                if (file) {
                  reader.readAsText(file)
                }
              }
            }),
          ),
        ),
      ),
      m("h2", "Children"),
      children,
      m("button", {
        onclick: (e: Event) => {
          actions.addChild()
        }
      }, "Add child"),
      m("h2", "Growth Chart"),
      m(ChartSelectorComponent, {
        state: chartState,
        actions: chartActions,
      }),
      m(ChartComponent, chartState),
    ]
  }
}

export default AppComponent