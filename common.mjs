// This is a placeholder file which shows how you can define functions which can be used from both a browser script and a node script. You can delete the contents of the file once you have understood how it works.

// convert new Date() object to string format
export function getDateInAString(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the actual date for rules like "2nd Tuesday of October"
 * @param {number} year - e.g. 2025
 * @param {object} rule - { month, weekday, occurrence, day }
 * @returns {string} date in "YYYY-MM-DD"
 */
export function calculateCommemorativeDate(year, rule) {
  const { month, weekday, occurrence, day } = rule;

  // Handle fixed-date rules (e.g., June 5)
  if (day !== undefined) {
    const fixed = new Date(Date.UTC(year, month - 1, day));
    return getDateInAString(fixed);
  }

  // Handle weekday-based rules (e.g., 2nd Tuesday of October)
  let count = 0;

  for (let d = 1; d <= 31; d++) {
    const current = new Date(Date.UTC(year, month - 1, d));
    if (current.getUTCMonth() !== month - 1) break;

    if (current.getUTCDay() === weekday) {
      count++;
      if (count === occurrence) {
        return getDateInAString(current);
      }
    }
  }

  return null;
}

export async function loadCommemorativeDays() {
  const res = await fetch("days.json");
  if (!res.ok) {
    throw new Error("Failed to load commemorative days");
  }
  const data = await res.json();
  return data;
}


//  Fetches full text description from a given URL
export async function fetchDescription(url) {
  try {
    const res = await fetch(url);
    return res.ok ? await res.text() : "Description not available.";
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return "Description not available.";
  }
}
