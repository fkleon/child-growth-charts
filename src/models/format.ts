import {Period} from '@js-joda/core';

const listFormat = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
});

const pluralRules = new Intl.PluralRules('en');

const pluralSuffixes = new Map<Intl.LDMLPluralRule, string>([
  ['one', ''],
  ['other', 's'],
]);

const pluralise = (word: string, n: number) => {
  const rule = pluralRules.select(n);
  const suffix = pluralSuffixes.get(rule);
  return `${word}${suffix}`;
};

export const formatAge = (period: Period) => {
  const parts = [];

  const years = period.years();
  const months = period.months();
  const days = period.days();

  // Special dates
  if (period.isNegative()) {
    // not hatched yet
    return '🥚';
  } else if (period.isZero()) {
    // welcome!
    return '🐣';
  }

  if (period.years() >= 66_000_000 && period.years() <= 72_700_000) {
    return '🦖';
  }

  if (period.years() >= 4_500_000_000) {
    return '🌌';
  }

  // Always display years
  if (years > 0) {
    parts.push(`${years} ${pluralise('year', years)}`);
  }

  // Display months up to 20 years
  if (months > 0 && years < 20) {
    parts.push(`${months} ${pluralise('month', months)}`);
  }

  // Display days up to 3 months
  if (days > 0 && years < 1 && months < 3) {
    parts.push(`${days} ${pluralise('day', days)}`);
  }

  const formattedAge = listFormat.format(parts);

  // Birthday
  if (period.months() === 0 && period.days() === 0) {
    // birthday!
    return formattedAge + ' 🎈';
  } else {
    return formattedAge;
  }
};
