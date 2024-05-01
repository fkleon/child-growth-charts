import {LocalDate} from '@js-joda/core';
import {Child, Measurement} from '../src/models/state';

const measurement: Measurement = {
  idx: 0,
  dateOfBirth: undefined,
  date: LocalDate.now(),
  weight: undefined,
  length: undefined,
  head: undefined,
};

// Child 1
measurement.dateOfBirth = LocalDate.of(2020, 3, 23);

const child0: Child = {
  idx: 0,
  open: true,
  name: 'Ava',
  dateOfBirth: measurement.dateOfBirth,
  sex: 'female',
  measurements: [],
};

child0.measurements = [
  {
    ...measurement,
    date: child0.dateOfBirth!,
    weight: 3.9,
    length: 52,
    head: 36,
  },
  {...measurement, date: LocalDate.of(2020, 3, 29), weight: 3.7, head: 36},
  {...measurement, date: LocalDate.of(2020, 4, 2), weight: 3.75, head: 37},
  {...measurement, date: LocalDate.of(2020, 4, 6), weight: 3.9, head: 37},
  {...measurement, date: LocalDate.of(2020, 4, 14), weight: 4.3, head: 37.5},
  {...measurement, date: LocalDate.of(2020, 4, 20), weight: 4.55, head: 38},
];

// Child 2
measurement.dateOfBirth = LocalDate.of(2022, 2, 10);

const child1: Child = {
  idx: 1,
  open: false,
  name: 'William',
  dateOfBirth: measurement.dateOfBirth,
  sex: 'male',
  measurements: [],
};
measurement.dateOfBirth = child1.dateOfBirth;

child1.measurements = [
  {
    ...measurement,
    date: child1.dateOfBirth!,
    weight: 4.1,
    length: 53,
    head: 35.5,
  },
  {
    ...measurement,
    date: LocalDate.of(2024, 2, 15),
    weight: 4.0,
    length: 54,
    head: 36,
  },
  {...measurement, date: LocalDate.of(2022, 2, 23), weight: 4.2, head: 36.5},
  {...measurement, date: LocalDate.of(2022, 2, 28), weight: 4.4, head: 37},
];

export default [child0, child1];
