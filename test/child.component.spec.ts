/* eslint-disable @typescript-eslint/no-unused-vars */
import o from 'ospec';
import mq from 'mithril-query';
import ChildComponent from '../src/views/child';
import {
  Child,
  ChildActions,
  IChartActions,
  IChildActions,
  Measurement,
  Sex,
} from '../src/models/state';
import children from './mock';
import {LocalDate} from '@js-joda/core';

const stubChildActions: IChildActions = {
  update: function (
    name: string | null,
    dateOfBirth: LocalDate | undefined,
    sex: Sex | null
  ): void {
    throw new Error('Function not implemented.');
  },
  pickColour: function (hex: string): void {
    throw new Error('Function not implemented.');
  },
  addMeasurement: function (measurement?: Measurement | undefined): void {
    throw new Error('Function not implemented.');
  },
  removeMeasurement: function (idx: number): void {
    throw new Error('Function not implemented.');
  },
  remove: function (): void {
    throw new Error('Function not implemented.');
  },
};

o.spec('Child component', () => {
  o('renders child details', () => {
    const child: Child = children[0];

    const out = mq(ChildComponent, {
      state: child,
      actions: stubChildActions,
    });
    o(out.rootNode).notEquals(null);

    // Summary
    out.should.have(1, 'summary');
    out.should.contain('Ava');

    // DOB input
    out.should.have(
      1,
      'input[type="date"][id="child-0-dob"][value="2020-03-23"]'
    );
    // Name input
    out.should.have(1, 'input[type="text"][id="child-0-name"][value="Ava"]');
    // Sex inputs
    out.should.have(
      1,
      'input[type="radio"][name="child-0-sex"][value="female"]:checked'
    );
    out.should.have(1, 'input[type="radio"][name="child-0-sex"][value="male"]');
  });
});
