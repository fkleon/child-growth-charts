import m from 'mithril';

import {
  MitosisAttr,
  Child,
  IChildActions,
  Measurement,
  IMeasurementActions,
  MeasurementActions,
  Sex,
} from '../models/state';
import {LocalDate, Period, convert} from '@js-joda/core';
import {formatAge} from '../models/format';

const ChildComponent: m.Component<MitosisAttr<Child, IChildActions>> = {
  oncreate({dom}) {
    (dom as HTMLElement).querySelector('input')?.focus();
  },
  view({attrs: {state, actions}}) {
    const now = LocalDate.now();
    const name = state.name ?? 'Unnamed';
    const age = state.dateOfBirth
      ? Period.between(state.dateOfBirth, now)
      : null;

    const summary = `${name}${age ? `, ${formatAge(age)} old` : ''}`;

    return m(
      'details',
      {
        open: state.open,
        name: 'children',
        ontoggle: (e: ToggleEvent) => {
          state.open = e.newState === 'open';
        },
      },
      m(
        'summary',
        summary,
        m(
          'a',
          {
            href: '#',
            class: 'icon',
            onclick: (e: Event) => {
              e.preventDefault();

              // Require user confirmation if state contains data
              const needConfirm =
                state.dateOfBirth ||
                state.measurements.length ||
                state.name ||
                state.sex;

              if (!needConfirm || confirm(`Delete all data for '${name}'?`)) {
                actions.remove();
              }
            },
          },
          '✖'
        )
      ),
      m(
        'form',
        {
          onsubmit: (e: SubmitEvent) => {
            e.preventDefault();
            actions.addMeasurement();
          },
        },
        m(
          'div',
          {class: 'content'},
          m(
            'fieldset',
            m('legend', 'Details'),
            m(
              'ul',
              m(
                'li',
                m(
                  'label',
                  {class: 'main', for: `child-${state.idx}-dob`},
                  'Date of birth'
                ),
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
                m('input', {
                  className: !state.dateOfBirth ? 'invalid' : undefined,
                  type: 'date',
                  id: `child-${state.idx}-dob`,
                  value: state.dateOfBirth,
                  required: true,
                  onchange: (e: Event) => {
                    const value = (e.currentTarget as HTMLInputElement).value;
                    try {
                      const dateOfBirth = value ? LocalDate.parse(value) : null;
                      actions.update(
                        state.name,
                        dateOfBirth ?? state.dateOfBirth,
                        state.sex
                      );
                    } catch (e) {
                      console.error('Failed to parse DOB', e);
                    }
                  },
                }),
                m('div', {class: 'error'}, '(required)')
              ),
              m(
                'li',
                m(
                  'label',
                  {class: 'main', for: `child-${state.idx}-name`},
                  'Name'
                ),
                m('input', {
                  type: 'text',
                  id: `child-${state.idx}-name`,
                  value: state.name,
                  onchange: (e: Event) => {
                    const name = (e.currentTarget as HTMLInputElement).value;
                    actions.update(name, state.dateOfBirth, state.sex);
                  },
                })
              ),
              m(
                'li',
                m(
                  'label',
                  {class: 'main', for: `child-${state.idx}-sex`},
                  'Sex'
                ),
                m('input', {
                  type: 'radio',
                  name: `child-${state.idx}-sex`,
                  id: `child-${state.idx}-sex-female`,
                  value: 'female',
                  checked: state.sex === 'female',
                  onchange: (e: Event) => {
                    const sex = (e.currentTarget as HTMLInputElement)
                      .value as Sex;
                    actions.update(state.name, state.dateOfBirth, sex);
                  },
                }),
                m('label', {for: `child-${state.idx}-sex-female`}, 'Girl'),
                m('input', {
                  type: 'radio',
                  name: `child-${state.idx}-sex`,
                  id: `child-${state.idx}-sex-male`,
                  value: 'male',
                  checked: state.sex === 'male',
                  onchange: (e: Event) => {
                    const sex = (e.currentTarget as HTMLInputElement)
                      .value as Sex;
                    actions.update(state.name, state.dateOfBirth, sex);
                  },
                }),
                m('label', {for: `child-${state.idx}-sex-male`}, 'Boy')
              ),
              m(
                'li',
                m(
                  'label',
                  {class: 'main', for: `child-${state.idx}-color`},
                  'Line colour'
                ),
                m('input', {
                  type: 'color',
                  id: `child-${state.idx}-color`,
                  value: state.colourHex,
                  // TODO enable this when colour is used in chart component
                  readonly: true,
                  disabled: true,
                  onchange: (e: Event) => {
                    const hex = (e.currentTarget as HTMLInputElement).value;
                    actions.pickColour(hex);
                  },
                })
              )
            )
          ),
          m(MeasurementTableComponent, {state, actions})
        )
      )
    );
  },
};

const MeasurementTableComponent: m.Component<
  MitosisAttr<Child, IChildActions>
> = {
  view({attrs: {state, actions}}) {
    const rows = state.measurements.map((measurement, idx) => {
      measurement.idx = idx;
      return m(MeasurementRowComponent, {
        state: measurement,
        actions: MeasurementActions(actions, measurement),
      });
    });

    return m(
      'fieldset',
      m('legend', 'Measurements'),
      m(
        'table',
        m('caption', 'Growth measurements'),
        m(
          'thead',
          m(
            'tr',
            m('th', 'Date'),
            m('th', 'Age'),
            m('th', 'Weight (kg)'),
            m('th', 'Length (cm)'),
            m('th', 'Head circumference (cm)')
          )
        ),
        m('tbody', rows),
        m('button', {type: 'submit'}, 'Add measurement')
      )
    );
  },
};

const MeasurementRowComponent: m.Component<
  MitosisAttr<Measurement, IMeasurementActions>
> = {
  oncreate({dom}) {
    (dom as HTMLElement).querySelector('input')?.focus();
  },
  view({attrs: {state, actions}}) {
    return m(
      'tr',
      m(
        'td',
        {'data-label': 'Date of measurement'},
        m('input', {
          type: 'date',
          name: `date-${state.idx}`,
          value: state.date,
          required: true,
          onchange: (e: Event) => {
            const value = (e.currentTarget as HTMLInputElement).value;
            try {
              const date = value ? LocalDate.parse(value) : null;
              actions.update(
                date ?? state.date,
                state.weight,
                state.length,
                state.head
              );
            } catch (e) {
              console.error('Failed to parse date', e);
            }
          },
        })
      ),
      m(
        'td',
        {'data-label': 'Age at measurement'},
        state.dateOfBirth
          ? formatAge(Period.between(state.dateOfBirth, state.date))
          : 'unknown'
      ),
      m(
        'td',
        {'data-label': 'Weight (kg)'},
        m('input', {
          type: 'number',
          name: `weight-${state.idx}`,
          value: state.weight,
          min: 0,
          step: 0.001,
          onchange: (e: Event) => {
            const weight = Number((e.currentTarget as HTMLInputElement).value);
            actions.update(state.date, weight, state.length, state.head);
          },
        })
      ),
      m(
        'td',
        {'data-label': 'Length (cm)'},
        m('input', {
          type: 'number',
          name: `length-${state.idx}`,
          value: state.length,
          step: 0.1,
          onchange: (e: Event) => {
            const length = Number((e.currentTarget as HTMLInputElement).value);
            actions.update(state.date, state.weight, length, state.head);
          },
        })
      ),
      m(
        'td',
        {'data-label': 'Head circumference (cm)'},
        m('input', {
          type: 'number',
          name: `head-${state.idx}`,
          value: state.head,
          step: 0.1,
          onchange: (e: Event) => {
            const head = Number((e.currentTarget as HTMLInputElement).value);
            actions.update(state.date, state.weight, state.length, head);
          },
        })
      ),
      m(
        'td',
        {'data-label': 'Remove'},
        m(
          'a',
          {
            href: '#',
            class: 'icon',
            onclick: (e: Event) => {
              e.preventDefault();

              // Require user confirmation if state contains data
              const needConfirm = state.head || state.length || state.weight;

              if (
                !needConfirm ||
                confirm(
                  `Delete measurements for '${convert(state.date)
                    .toDate()
                    .toLocaleDateString()}'?`
                )
              ) {
                actions.remove();
              }
            },
          },
          '✖'
        )
      )
    );
  },
};

export default ChildComponent;
