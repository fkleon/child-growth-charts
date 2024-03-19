//import '../../test-setup-ts'

import o from "ospec"
import mq from "mithril-query"
import { LocalDate } from "@js-joda/core"
import { DateAttrs, DateInput } from "../views/html"



o.spec("DateInput", () => {
    o("things are working", () => {
        const value = LocalDate.of(2024, 3, 14)
        const attrs: DateAttrs = {
            initialValue: value,
            dateChanged: (date) => null,
        }
        var out = mq(DateInput, attrs)
        out.should.have(1, "input[value='2024-03-14']")
        o(true).equals(true)
    })
})

//o.run()