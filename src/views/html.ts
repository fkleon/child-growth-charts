import { LocalDate } from '@js-joda/core';
import m from 'mithril';
import { MitosisAttr } from '../models/state';

interface FieldSetAttrs {

}

interface DetailsComponentAttrs {
  open: boolean,
}

const FieldSetComponent: m.Component<any> = {
  view(vnode) {
    return m("fieldset",
      vnode.children
    )
  }
}

const DetailsComponent: m.Component<DetailsComponentAttrs> = {
  view(vnode) {
    return m("details", { open: vnode.attrs.open },
      vnode.children,
    )
  }
}

const RowComponent: m.Component<any> = {
  view(vnode) {
    return m("tr",
      vnode.children,
      m("td",
        m("a", { href: "#", onclick: () => vnode.attrs.actions.remove() }, "✖"),
        m("a", { href: "#", onclick: () => vnode.attrs.actions.remove() }, "✖"),
      )
    )
  }
}

interface DateAttrs {
  initialValue?: LocalDate,
  id?: string,
  required?: boolean,
  errorClass?: string,
  dateChanged(date: LocalDate | undefined): void,
}

/*
interface DateActions {
  dateChanged(date: LocalDate): void,
}

const DateState = (): DateAttrs => ({
  value: null,
  id: null,
  required: false,
  errorClass: "error",
})
*/

const DateInput: m.ClosureComponent<DateAttrs> = vnode => {

  const { id, required = false, errorClass = "error" } = vnode.attrs
  let { initialValue: value } = vnode.attrs
  let valid: boolean = validate()

  function validate() {
    return !required || value != null
  }

  function parse(date: string) {
    try {
      return LocalDate.parse(date)
    } catch (e) {
      return undefined
    }
  }

  return {
    view({attrs}) {
      return m("input", {
        type: "date", id: id,
        class: valid ? "" : errorClass,
        value: value, required: required,
        onchange: (e: Event) => {
          const newValue = (e.currentTarget as HTMLInputElement).value
          value = newValue ? parse(newValue) : undefined
          valid = validate()

          if (valid) {
            attrs.dateChanged(value)
          }
        }
      })
      /*
      m("input", { class: !state. ? "invalid" : null,
      type: "date", id: `child-${state.idx}-dob`, value: state.dateOfBirth, required: true,
      onchange: (e: Event) => {
        const value = (e.currentTarget as HTMLInputElement).value
        const dateOfBirth = parse(value)
        console.log("onchange dob", value, dateOfBirth)
      },
      */
    }
  }
}

export {
  DateAttrs,
  DateInput,
}