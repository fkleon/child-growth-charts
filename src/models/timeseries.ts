import {LocalDate, Period} from '@js-joda/core';

interface Bucket<K, V> {
  key: K;
  values: V[];
}

interface DateHistogram<T> {
  buckets: Bucket<LocalDate, T>[];
}

function dateHistogram<T>(
  data: T[] = [],
  key: (v: T) => LocalDate,
  interval: Period = Period.ofWeeks(1)
): DateHistogram<T> {
  const buckets: Bucket<LocalDate, T>[] = [];

  if (data.length === 0) {
    return {buckets};
  }

  // sort input data
  const sorted = [...data].sort((a, b) => key(a).compareTo(key(b)));
  const minDate = key(sorted[0]);

  // first bucket
  buckets.push({key: minDate, values: [sorted[0]]});

  for (const datapoint of sorted.slice(1)) {
    const date = key(datapoint);
    let bucket = buckets[buckets.length - 1];
    let bucketEnd = bucket.key.plus(interval);

    // Add empty buckets if required
    while (!date.isBefore(bucketEnd)) {
      bucket = {key: bucketEnd, values: []};
      bucketEnd = bucketEnd.plus(interval);
      buckets.push(bucket);
    }

    // Datapoint belongs into current bucket
    bucket.values.push(datapoint);
  }

  return {buckets};
}

export {dateHistogram};
