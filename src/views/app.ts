import m from 'mithril'

import { ChartComponent, ChartSelectorComponent } from './chart';

import ChildComponent from './child'
import { App, ChartActions, ChildActions, ChildState, IAppActions, Measurement, MitosisAttr } from '../models/state';
import { Series } from 'chartist';
import { LocalDate } from '@js-joda/core';
import { ChartConfig } from '../data/who';
import { exportState, importState } from '../models/export';

function normaliseInto(
  origin: LocalDate, config: ChartConfig, measurements: Measurement[], fieldAccessor: (m: Measurement) => number) {

  const timeUnit = config.timeUnit
  const count = config.data.labels.length
  const normalised = Array(count).fill(null)

  for (const m of measurements) {
    // TODO: improve this by finding closest measurement
    const n = timeUnit.between(origin, m.date)
    const v = fieldAccessor(m)
    if (n > count) {
      continue
    }
    normalised.splice(n, 1, v)
  }
  
  //console.log("Normalised data", measurements, normalised)
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

    if (state.chart.config?.timeUnit) {
      let accessor: (m: Measurement) => number;

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
        .map(c => normaliseInto(c.dateOfBirth, state.chart.config, c.measurements, accessor))
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
                const file = (e.currentTarget as HTMLInputElement).files[0]
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
      m("a", {
        href: "#", onclick: (e: Event) => {
          e.preventDefault()
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