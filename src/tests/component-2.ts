import o from "ospec"
import mq from "mithril-query"
import { ChartSelectorComponent } from "../views/chart"
import { ChartState, ChartActions, MitosisAttr, IChartActions, Chart } from "../models/state"

o.spec("ChartSelectorComponent", () => {
    o("things are working", () => {
        
        const state = ChartState()
        const actions = ChartActions(state)
        const attrs: MitosisAttr<Chart, IChartActions> = { state, actions }

        var out = mq(ChartSelectorComponent, attrs)

        out.should.have(1, "select")
        o(true).equals(true)
    })
})

//o.run()