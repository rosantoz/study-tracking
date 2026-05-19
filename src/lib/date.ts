import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export function todayRange(now: Date = new Date()) {
  return { start: startOfDay(now), end: endOfDay(now) };
}

export function weekRange(now: Date = new Date()) {
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

export function monthRange(now: Date = new Date()) {
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

export function rangeForPeriod(period: "WEEKLY" | "MONTHLY", now: Date = new Date()) {
  return period === "WEEKLY" ? weekRange(now) : monthRange(now);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
