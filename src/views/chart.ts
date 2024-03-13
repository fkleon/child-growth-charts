import m from 'mithril';

import { LineChart, LineChartData, SeriesObject, SeriesPrimitiveValue, SeriesValue } from 'chartist';
import charts from "../data/who";
import { Chart, IChartActions, MitosisAttr } from '../models/state';

const ChartSelectorComponent: m.Component<MitosisAttr<Chart, IChartActions>> = {
    oninit({attrs: {state, actions}}) {
        actions.loadChart(state.name)
    },
    view({attrs: {state, actions}}) {
        return m("fieldset",
            m("legend", "Child Growth Standard"),
            m("ul",
                m("li",
                    m("label", { for: `chart-select`},
                        "Select a ",
                        m("a", { href: "https://www.who.int/tools/child-growth-standards/standards" }, "WHO Child Growth Standard"),
                        ":",
                    ),
                ),
                m("li",
                    m("select",
                        {
                            id: "chart-select",
                            onchange: (e: Event) => actions.loadChart((e.currentTarget as HTMLSelectElement).value),
                            value: state.name,
                        },
                        Object.entries(charts)
                            .map(([name, chart]) => m("option", { value: name }, chart.label))
                    )
                )
            )
        )

        /*
        return m("details", {open: "open"},
            m("summary", "Child Growth Standard"),
            m("p",
                m("label", { for: "chart-select" },
                    "Choose a ",
                    m("a", { href: "https://www.who.int/tools/child-growth-standards/standards" }, "WHO Child Growth Standard"),
                    " to plot:"
                )
            ),
            m("select",
                {
                    id: "chart-select",
                    onchange: (e: Event) => actions.loadChart((e.currentTarget as HTMLSelectElement).value),
                    value: state.name,
                },
                Object.entries(charts)
                    .map(([name, chart]) => m("option", { value: name }, chart.label))
            )
        )
        */
    }
}

function ChartComponent(): m.Component<Chart> {
    let chart: LineChart;
    let data: LineChartData;

    function updateData(attrs: Chart) {
        const base: SeriesObject<number>[] = attrs.config.data.series.map((s, i) => ({
            name: `percentile-${i}`,
            className: `ct-series-${String.fromCharCode(97 + i)}`,
            data: s as SeriesValue<number>[],
        }))
        const series: SeriesObject<number>[] = attrs.currentData
            .map((s, i) => ({
                name: `child-${i}`,
                className: `ct-series-${String.fromCharCode(97 + i + 6)}`,
                data: s as SeriesValue<number>[],
            }))
            //.map(s => s as number[])
            //.map(n => n as SeriesValue<number>[])
        data = {
            labels: attrs.config.data.labels,
            series: [...base, ...series],
            /*
            series: [
                {
                    name: "child-1",
                    className: "ct-series-g child-1",
                    data: dat[0]
                }
            ]
            */
            /*
            series: [
                ...attrs.config.data.series,
                ...attrs.currentData,
            ]
            */
        }
    }

    return {
        oninit({attrs}) {
            // TODO use named series
            console.log("init ChartComponent")
            updateData(attrs)
        },
        oncreate({dom, attrs}) {
            console.log("create ChartComponent")
            const chartElement = dom.querySelector("#chart")
            chart = new LineChart(chartElement, data, attrs.config.options);
            m.redraw()
        },
        onupdate({attrs}) {
            console.log("update ChartComponent", attrs)
            updateData(attrs)
            chart?.update(data, attrs.config.options)
        },
        view({attrs}) {
            return m("fieldset",
                m("legend", attrs.config.label),
                m("div", { id: 'chart' }),
                m("ul", { class: "ct-legend" },
                    m("li", { class: "ct-series-a" },
                        "3th & 97th percentile",
                    ),
                    m("li", { class: "ct-series-b" },
                        "15th & 85th percentile",
                    ),
                    m("li", { class: "ct-series-c" },
                        "50th percentile",
                    ),
                )
            )
        }
    }
}

export {
    ChartSelectorComponent,
    ChartComponent,
}