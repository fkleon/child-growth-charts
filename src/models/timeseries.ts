import {LocalDate, Period} from '@js-joda/core';

// A bucket of grouped values.
interface Bucket<K, V> {
  key: K;
  values: V[];
}

// Timeseries bucketed by date
interface DateHistogram<T> {
  buckets: Bucket<LocalDate, T>[];
}

interface BucketAggregation<K> {
  key: K;
  value: number;
}

interface DateHistogramAggregation {
  buckets: BucketAggregation<LocalDate>[];
}

function dateHistogramAggregation<T>(
  dateHistogram: DateHistogram<T>,
  mapFn: (v: T) => number | undefined,
  aggregationFn: (...values: number[]) => number = Math.min
): DateHistogramAggregation {
  const aggregatedBuckets: BucketAggregation<LocalDate>[] = [];

  // aggregated values in date bucket
  for (const bucket of dateHistogram.buckets) {
    const numericValues = bucket.values
      .map(mapFn)
      .filter((v): v is number => !!v);

    const aggregatedValue = aggregationFn(...numericValues);
    aggregatedBuckets.push({key: bucket.key, value: aggregatedValue});
  }

  return {buckets: aggregatedBuckets};
}

function dateHistogram<T>(
  data: T[] = [],
  keyFn: (v: T) => LocalDate,
  interval: Period = Period.ofWeeks(1)
): DateHistogram<T> {
  const buckets: Bucket<LocalDate, T>[] = [];

  if (data.length === 0) {
    return {buckets};
  }

  // sort input data
  const sorted = [...data].sort((a, b) => keyFn(a).compareTo(keyFn(b)));
  const minDate = keyFn(sorted[0]);

  // first bucket
  buckets.push({key: minDate, values: [sorted[0]]});

  for (const datapoint of sorted.slice(1)) {
    const date = keyFn(datapoint);
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

export {dateHistogram, dateHistogramAggregation};
