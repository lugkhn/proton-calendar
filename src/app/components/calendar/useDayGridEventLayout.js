import { useMemo } from 'react';

import { toPercent } from './mouseHelpers/mathHelpers';
import { splitDayEventsInInterval } from './splitDayEventsInInterval';
import { layout } from './layout';

const useDayGridEventLayout = (rows, events, numberOfRows, dayEventHeight) => {
    return useMemo(() => {
        return rows.map((row) => {
            const columns = row.length;

            const eventsInRow = splitDayEventsInInterval({
                events: events,
                min: row[0],
                max: row[columns - 1]
            });

            const eventsLaidOut = layout(eventsInRow);

            let maxRows = 0;

            const eventsInRowSummary = eventsLaidOut.reduce((acc, { column: eventRow }, i) => {
                const { start, end } = eventsInRow[i];

                maxRows = Math.max(maxRows, eventRow + 1);

                // Special case for full day event since they push the whole row down.
                let dayIndex = start;
                for (; dayIndex < end; ++dayIndex) {
                    if (!acc[dayIndex]) {
                        acc[dayIndex] = { more: 0, events: [] };
                    }
                    acc[dayIndex].events.push(i);
                    if (eventRow >= numberOfRows) {
                        acc[dayIndex].more++;
                    }
                }
                return acc;
            }, {});

            const moreDays = Object.keys(eventsInRowSummary).reduce((acc, dayIndex) => {
                if (eventsInRowSummary[dayIndex].more <= 0) {
                    return acc;
                }
                acc.push({
                    idx: +dayIndex,
                    type: 'more',
                    style: {
                        top: `${numberOfRows * dayEventHeight}px`,
                        left: toPercent(dayIndex / columns),
                        height: `${dayEventHeight}px`,
                        width: toPercent(1 / columns)
                    }
                });
                return acc;
            }, []);

            const eventsInRowStyles = eventsLaidOut.reduce((acc, { column: eventRow }, i) => {
                const { start, end } = eventsInRow[i];

                if (eventRow >= numberOfRows) {
                    return acc;
                }

                const top = eventRow;
                const left = start / columns;
                const width = (end - start) / columns;

                acc.push({
                    idx: i,
                    type: 'event',
                    style: {
                        top: `${top * dayEventHeight}px`,
                        left: toPercent(left),
                        height: `${dayEventHeight}px`,
                        width: toPercent(width)
                    }
                });

                return acc;
            }, []);

            return {
                eventsInRow,
                eventsInRowStyles: eventsInRowStyles.concat(moreDays),
                eventsInRowSummary,
                maxRows
            };
        });
    }, [rows, events, numberOfRows]);
};

export default useDayGridEventLayout;
