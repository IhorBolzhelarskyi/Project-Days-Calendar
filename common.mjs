// This is a placeholder file which shows how you can define functions which can be used from both a browser script and a node script. You can delete the contents of the file once you have understood how it works.

export function getGreeting() {
  return "Hello";
}

feature / calculate - commemorative - dates;
/**
 * Calculates the actual date for rules like "2nd Tuesday of October"
 * @param {number} year - e.g. 2025
 * @param {object} rule - { month, weekday, occurrence } (1-based month, 0=Sunday)
 * @returns {string} date in "YYYY-MM-DD"
 */
export function calculateCommemorativeDate(year, rule) {
  const { month, weekday, occurrence, day } = rule;

  // If it's a fixed date (e.g., June 5), just return it
  if (day !== undefined) {
    const fixed = new Date(year, month - 1, day);
    return getDateInAString(fixed);
  }

  // Find the first day of the month
  const firstDay = new Date(year, month - 1, 1);
  let date = 1;

  // Count how many matching weekdays we pass
  let count = 0;

  while (true) {
    const current = new Date(year, month - 1, date);
    if (current.getMonth() !== month - 1) break; // next month
    if (current.getDay() === weekday) {
      count++;
      if (count === occurrence) {
        return getDateInAString(current);
      }
    }
    date++;
  }

  return null; // if not found
}
export async function loadCommemorativeDays() {
  const res = await fetch("days.json");
  if (!res.ok) {
    throw new Error("Failed to load commemorative days");
  }
  const data = await res.json();
  return data;
  main;
}
