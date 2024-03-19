import o from "ospec"
import { LocalDate, Period } from "@js-joda/core"
import { dateHistogram } from "./timeseries"

o.spec("Timeseries", () => {
    o("date histogram aggregation - no data", () => {
        const histogram = dateHistogram([], (v) => LocalDate.now());
        o(histogram.buckets.length).equals(0)
    })
    o("date histogram aggregation - multiple values in bucket", () => {
        const series = [
            { date: LocalDate.of(2024, 3, 1), weight: 3.1 },
            { date: LocalDate.of(2024, 3, 2), weight: 3.2 },
            // missing 2024-03-03
            // duplicate 2024-03-04
            { date: LocalDate.of(2024, 3, 4), weight: 3.3 },
            { date: LocalDate.of(2024, 3, 4), weight: 3.4 },
        ]

        const histogram = dateHistogram(series, (v) => v.date);
        
        o(histogram.buckets.length).equals(1)
        o(histogram.buckets[0].key.equals(LocalDate.of(2024, 3, 1))).equals(true)
        o(histogram.buckets[0].values.length).equals(4)
        o(histogram.buckets[0].values).deepEquals(series)
    })
    o("date histogram aggregation - unsorted data", () => {
        const series = [
            { date: LocalDate.of(2024, 3, 3), weight: 3.4 },
            { date: LocalDate.of(2024, 3, 1), weight: 3.1 },
            { date: LocalDate.of(2024, 3, 2), weight: 3.2 },
        ]

        const histogram = dateHistogram(series, (v) => v.date);
        
        o(histogram.buckets.length).equals(1)
        o(histogram.buckets[0].key.toString()).equals("2024-03-01")
        o(histogram.buckets[0].values.length).equals(3)
        o(histogram.buckets[0].values[0].date.toString()).equals("2024-03-01")
        o(histogram.buckets[0].values[0].weight).equals(3.1)
        o(histogram.buckets[0].values[1].date.toString()).equals("2024-03-02")
        o(histogram.buckets[0].values[1].weight).equals(3.2)
        o(histogram.buckets[0].values[2].date.toString()).equals("2024-03-03")
        o(histogram.buckets[0].values[2].weight).equals(3.4)
    })
    o("date histogram aggregation - duplicate dates", () => {
        const series = [1, 2, 3, 4]
        const histogram = dateHistogram(series, (v) => LocalDate.of(2024, 3, 19), Period.ofDays(1));
        
        o(histogram.buckets.length).equals(1)
        o(histogram.buckets[0].values.length).equals(4)
        o(histogram.buckets[0].values).deepEquals(series)
    })
    o("date histogram aggregation - multiple buckets", () => {
        const series = [
            { date: LocalDate.of(2024, 3, 1), weight: 1 },
            { date: LocalDate.of(2024, 3, 7), weight: 2 },
            { date: LocalDate.of(2024, 3, 8), weight: 3 },
            { date: LocalDate.of(2024, 3, 15), weight: 4 },
        ]
        const histogram = dateHistogram(series, (v) => v.date);
        
        o(histogram.buckets.length).equals(3)
        o(histogram.buckets[0].values.length).equals(2)
        o(histogram.buckets[1].values.length).equals(1)
        o(histogram.buckets[2].values.length).equals(1)
    })
    o("date histogram aggregation - multiple buckets with empty buckets", () => {
        const series = [
            { date: LocalDate.of(2024, 3, 1), weight: 1 },
            { date: LocalDate.of(2024, 3, 15), weight: 4 },
        ]
        const histogram = dateHistogram(series, (v) => v.date);
        
        o(histogram.buckets.length).equals(3)
        o(histogram.buckets[0].values.length).equals(1)
        o(histogram.buckets[1].values.length).equals(0)
        o(histogram.buckets[2].values.length).equals(1)
    })
})