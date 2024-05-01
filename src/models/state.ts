import {LocalDate, Period} from '@js-joda/core';
import charts, {ChartConfig} from '../data/who';
import {SeriesObject} from 'chartist';

// State and actions definitions
type MitosisAttr<S, A> = {
  state: S;
  actions: A;
};

// Root
interface App {
  children: Child[];
  chart: Chart;
}

const AppState = (): App => ({
  children: [ChildState()],
  chart: ChartState(),
});

interface IAppActions {
  addChild(child?: Child): void;
  removeChild(idx: number): void;

  import(state: Child[]): void;
}

const AppActions = (app: App): IAppActions => ({
  addChild: (child: Child = ChildState()) => {
    if (child.open) {
      app.children.forEach(c => (c.open = false));
    }
    app.children.push(child);
  },
  removeChild: (idx: number) => {
    app.children.splice(idx, 1);
  },
  import: children => {
    app.children = children;
  },
});

type Sex = 'female' | 'male';

// see chart.scss
const COLOURS = [
  '#0544d3',
  '#d17905',
  '#59922b',
  '#d70206',
  '#6b0392',
  '#f4c63d',
  '#453d3f',
  '#e6805e',
  '#dda458',
  '#eacf7d',
  '#86797d',
  '#b2c326',
  '#6188e2',
  '#a748ca',
];

// Child
interface Child {
  idx: number;
  name: string | null;
  dateOfBirth?: LocalDate;
  sex: Sex | null;
  open: boolean;
  colourHex?: string;
  age?: Period; // computed
  measurements: Measurement[];
}

interface IChildActions {
  update(
    name: string | null,
    dateOfBirth: LocalDate | undefined,
    sex: Sex | null
  ): void;
  pickColour(hex: string): void;
  addMeasurement(measurement?: Measurement): void;
  removeMeasurement(idx: number): void;
  remove(): void;
}

const ChildState = (): Child => ({
  idx: 0,
  open: true,
  name: null,
  dateOfBirth: undefined,
  sex: null,
  colourHex: COLOURS[0],
  age: undefined,
  measurements: [],
});

const ChildActions = (app: IAppActions, child: Child): IChildActions => ({
  update: (name: string, dateOfBirth: LocalDate, sex: Sex) => {
    child.name = name;
    child.dateOfBirth = dateOfBirth;
    child.sex = sex;
    if (dateOfBirth) {
      child.age = Period.between(dateOfBirth, LocalDate.now());
    }
    child.measurements.forEach(m => (m.dateOfBirth = dateOfBirth));
  },
  pickColour: (hex: string) => {
    child.colourHex = hex;
  },
  addMeasurement: (measurement: Measurement = MeasurementState(child)) => {
    child.measurements.push(measurement);
    child.measurements.sort((a, b) => a.date.compareTo(b.date));
  },
  removeMeasurement: (idx: number) => {
    child.measurements.splice(idx, 1);
  },
  remove: () => {
    app.removeChild(child.idx);
  },
});

// Measurement
interface Measurement {
  idx: number;
  date: LocalDate;
  weight?: number;
  length?: number;
  head?: number;

  dateOfBirth?: LocalDate;
}

interface IMeasurementActions {
  update(
    date: LocalDate,
    weight?: number,
    length?: number,
    head?: number
  ): void;
  remove(): void;
}

const MeasurementState = (child: Child): Measurement => ({
  idx: -1,
  date:
    child.measurements.at(-1)?.date.plusDays(1) ??
    child.dateOfBirth ??
    LocalDate.now(),
  weight: undefined,
  length: undefined,
  head: undefined,
  dateOfBirth: child.dateOfBirth,
});

const MeasurementActions = (
  childActions: IChildActions,
  measurement: Measurement
): IMeasurementActions => ({
  update: (
    date: LocalDate,
    weight?: number,
    length?: number,
    head?: number
  ) => {
    measurement.date = date;
    measurement.weight = weight;
    measurement.length = length;
    measurement.head = head;
  },
  remove: () => {
    childActions.removeMeasurement(measurement.idx);
  },
});

// Chart
interface Chart {
  name: string;
  config?: ChartConfig;
  data: SeriesObject[];
}

interface IChartActions {
  loadChart(name: string): void;
}

const ChartState = (): Chart => ({
  name: 'who-wfa-boys-13-weeks',
  config: undefined,
  data: [],
});

const ChartActions = (chart: Chart): IChartActions => ({
  loadChart: (name: string) => {
    const config = charts[name];
    if (config) {
      chart.name = name;
      chart.config = config;
    }
    console.log('Loaded chart: ', name);
  },
});

export {
  MitosisAttr,
  App,
  AppState,
  IAppActions,
  AppActions,
  Sex,
  Child,
  ChildState,
  IChildActions,
  ChildActions,
  Measurement,
  MeasurementState,
  IMeasurementActions,
  MeasurementActions,
  Chart,
  ChartState,
  IChartActions,
  ChartActions,
  COLOURS,
};
