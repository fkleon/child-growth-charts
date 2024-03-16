import m from 'mithril'

import { MitosisAttr, Child, IChildActions, Measurement, IMeasurementActions, MeasurementActions, Sex } from '../models/state'
import { ChronoUnit, LocalDate, Period } from '@js-joda/core';
import { DateInput } from './html';

const formatAge = (period: Period) => {

  let parts = []

  const years = period.years()
  const months = period.months()
  // TODO: week approximation problem
  const weeks = ~~(period.days() / 7)
  const days = period.days() % 7

  if (years > 0) {
    parts.push(`${years} year${years > 1 ? 's' : ''}`)
  }

  if (years < 2) {
    if (months > 0) {
      parts.push(`${months} month${months > 1 ? 's' : ''}`)
    }

    if (years < 1) {
      if (months < 3 && weeks > 0) {
        parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`)
      }

      if (months < 3) {
        if (weeks < 12 && days > 0) {
          parts.push(`${days} day${days > 1 ? 's' : ''}`)
        }
      }
    }
  }

  const u = period.units()
  if (period.isNegative()) {
    parts.push("🥚")
  } else if (!period.isZero() && period.months() == 0 && period.days() == 0) {
    parts.push("🎈")
  }

  return parts.length == 0 ? '🐣' : parts.join(', ')
} 

const ChildComponent: m.Component<MitosisAttr<Child, IChildActions>> = {
  oncreate({attrs: {state}, dom}) {
    // TODO: uncondiiona? disabe on import?
    (dom as HTMLElement).querySelector("input").focus()
  },
  view({attrs: {state, actions}}) {
    const name = state.name ?? 'Unnnamed'
    const age = state.age ? '(' + formatAge(state.age) + ' old)' : ''

    return m("details", {open: "open"},
        m("summary",
          `Child ${state.idx + 1}: ${name} ${age}`,
          m("a", {
            href: "#", class: "icon", onclick: (e: Event) => {
              e.preventDefault()
              actions.remove()
            }
          }, "✖"),
        ),
        m("form", { onsubmit: (e: SubmitEvent) => {
          e.preventDefault()
          actions.addMeasurement()
        }, },
        m("div", { class: "content" },
          m("fieldset",
           m("legend", "Details"),
            m("ul",
              m("li",
                m("label", { class: "main", for: `child-${state.idx}-dob`}, "Date of birth"),
                /*
                m(DateInput, {
                  state: {
                    id: `child-${state.idx}-dob`,
                    value: state.dateOfBirth,
                    required: true,
                    errorClass: "invalid",
                  },
                  actions: {
                    dateChanged: (date) => {
                      actions.update(state.name, date, state.sex)
                    },
                  },
                }),
                */
                m("input", { class: !state.dateOfBirth ? "invalid" : null,
                  type: "date", id: `child-${state.idx}-dob`, value: state.dateOfBirth, required: true,
                  onchange: (e: Event) => {
                    const value = (e.currentTarget as HTMLInputElement).value
                    try {
                      const dateOfBirth = value ? LocalDate.parse(value) : null
                      actions.update(state.name, dateOfBirth, state.sex)
                    } catch (e) {
                      console.error("Failed to parse DOB", e)
                    }
                  },
                }),
                m("div", { class: "error" }, "(required)"),
              ),
              m("li",
                m("label", { class: "main", for: `child-${state.idx}-name`}, "Name"),
                m("input", {
                  type: "text", id: `child-${state.idx}-name`, value: state.name,
                  onchange: (e: Event) => {
                    const name = (e.currentTarget as HTMLInputElement).value
                    actions.update(name, state.dateOfBirth, state.sex)
                  },
                }),
              ),
              m("li",
                m("label", { class: "main", for: `child-${state.idx}-sex`}, "Sex"),
                m("input", {
                  type: "radio", name: `child-${state.idx}-sex`, id: `child-${state.idx}-sex-female`,
                  value: "female", checked: state.sex == "female",
                  onchange: (e: Event) => {
                      const sex = ((e.currentTarget as HTMLInputElement).value as Sex)
                      actions.update(state.name, state.dateOfBirth, sex)
                  },
                }),
                m("label", { for: `child-${state.idx}-sex-female`}, "Girl"),
                m("input", {
                  type: "radio", name: `child-${state.idx}-sex`, id: `child-${state.idx}-sex-male`,
                  value: "male", checked: state.sex == "male",
                  onchange: (e: Event) => {
                      const sex = ((e.currentTarget as HTMLInputElement).value as Sex)
                      actions.update(state.name, state.dateOfBirth, sex)
                  },
                }),
                m("label", { for: `child-${state.idx}-sex-male`}, "Boy"),
              ),
              m("li",
                m("label", { class: "main", for: `child-${state.idx}-color`}, "Line colour"),
                m("input", {
                  type: "color", id: `child-${state.idx}-color`, value: null,
                  onchange: (e: Event) => {
                    const color = (e.currentTarget as HTMLInputElement).value
                    // TODO
                    console.log(color)
                  },
                }),
              ),
            ),
          ),
          m(MeasurementTableComponent, { state, actions })
        ),
      )
    )
  }
}

const MeasurementTableComponent: m.Component<MitosisAttr<Child, IChildActions>> = {
  view({attrs: {state, actions}}) {
    const rows = state.measurements.map((measurement, idx) => {
      measurement.idx = idx
      return m(MeasurementRowComponent, {
        state: measurement,
        actions: MeasurementActions(actions, measurement),
      })
    })

    return m("fieldset",
      m("legend", "Measurements"),
      m("table",
        m("thead",
          m("tr",
            m("th", "Date"),
            m("th", "Age"),
            m("th", "Weight (kg)"),
            m("th", "Length (cm)"),
            m("th", "Head circumference (cm)"),
          )
        ),
        m("tbody", rows),
        m("button", { type: "submit" }, "Add measurement"),
      )
    )
  }
}


const MeasurementRowComponent: m.Component<MitosisAttr<Measurement, IMeasurementActions>> = {
  oncreate({attrs: {state}, dom}) {
    // TODO: uncondiiona? disabe on import?
    if (state.focus) {
      (dom as HTMLElement).querySelector("input").focus()
    }
  },
  view({attrs: {state, actions}}) {
    return m("tr",
      m("td",
        m("input", {
          type: "date", name: `date-${state.idx}`, value: state.date, required: true,
          onchange: (e: Event) => {
            const date = LocalDate.parse((e.currentTarget as HTMLInputElement).value)
            actions.update(date, state.weight, state.length, state.head)
          },
        })),
      m("td",
        state.dateOfBirth ? formatAge(Period.between(state.dateOfBirth, state.date)) : "unknown",
        ),
      m("td",
        m("input", {
          type: "number", name: `weight-${state.idx}`, value: state.weight, min: 0,
          onchange: (e: Event) => {
            const weight = Number((e.currentTarget as HTMLInputElement).value)
            actions.update(state.date, weight, state.length, state.head)
          },
        })),
      m("td",
        m("input", {
          type: "number", name: `length-${state.idx}`, value: state.length,
          onchange: (e: Event) => {
            const length = Number((e.currentTarget as HTMLInputElement).value)
            actions.update(state.date, state.weight, length, state.head)
          },
        })),
      m("td",
        m("input", {
          type: "number", id: `head-${state.idx}`, value: state.head,
          onchange: (e: Event) => {
            const head = Number((e.currentTarget as HTMLInputElement).value)
            actions.update(state.date, state.weight, state.length, head)
          },
        })),    
      m("td",
        m("a", {
          href: "#", class: "icon", onclick: (e: Event) => {
            e.preventDefault()
            actions.remove()
          }
        }, "✖")),
      )
  }
}

export default ChildComponent