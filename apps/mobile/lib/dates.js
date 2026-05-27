import { DateTime, Interval } from "luxon";

export const getCurrentMonthYear = () => {
  const now = DateTime.now();

  return now
    .startOf("month")
    .toLocaleString({ month: "long", year: "numeric" });
};

export const getDaysUntilNextMonth = () => {
  const now = DateTime.now();

  const nextMonthStart = now.plus({ months: 1 }).startOf("month");

  return Math.ceil(
    Interval.fromDateTimes(now, nextMonthStart).length("days"),
  );
}

export function formatTargetDate(targetDate) {
  if (!targetDate) return null;
  const [year, month] = targetDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${year}`;
}