import o from 'ospec';
import {formatAge} from '../src/models/format';
import {Period} from '@js-joda/core';

o.spec('Format age', () => {
  const testCases: [Period, string][] = [
    [Period.ofYears(-1), '🥚'],
    [Period.ofMonths(-1), '🥚'],
    [Period.ofDays(-1), '🥚'],
    [Period.ZERO, '🐣'],
    [Period.ofDays(1), '1 day'],
    [Period.ofDays(2), '2 days'],
    [Period.ofDays(31), '31 days'],
    [Period.ofWeeks(1), '7 days'],
    [Period.ofWeeks(1).plusDays(1), '8 days'],
    [Period.ofMonths(1), '1 month'],
    [Period.ofMonths(1).plusDays(1), '1 month and 1 day'],
    [Period.ofMonths(2), '2 months'],
    [Period.ofMonths(2).plusDays(2), '2 months and 2 days'],
    [Period.ofMonths(3), '3 months'],
    // only display days up to 3 months
    [Period.ofMonths(3).plusDays(1), '3 months'],
    [Period.ofYears(1), '1 year 🎈'],
    [Period.ofYears(1).plusMonths(1), '1 year and 1 month'],
    [Period.ofYears(1).plusMonths(1).plusDays(1), '1 year and 1 month'],
    [Period.ofYears(2), '2 years 🎈'],
    [Period.ofYears(19).plusMonths(11), '19 years and 11 months'],
    // only display months up to 20 years
    [Period.ofYears(20), '20 years 🎈'],
    [Period.ofYears(20).plusMonths(1), '20 years'],
    // really old
    [Period.ofYears(66_000_000), '🦖'],
    [Period.ofYears(4_500_000_000), '🌌'],
  ];

  testCases.forEach(([age, expectedFormat]) => {
    o(age.toString(), () => {
      o(formatAge(age)).equals(expectedFormat);
    });
  });
});
