// generate-ical.mjs

// Import required modules
import fs from "fs"; // for file reading/writing
import fetch from "node-fetch"; // for HTTP requests (optional in Node 18+)
import { calculateCommemorativeDate, fetchDescription } from "./common.mjs";

// Load and parse the JSON file containing commemorative days data
const daysData = JSON.parse(fs.readFileSync("./days.json", "utf-8"));

// Main function that generates the ICS calendar file
async function generateICS() {
  // Start of the calendar file content
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "CALSCALE:GREGORIAN", "PRODID:-//YourApp//DaysCalendar//EN"];

  // Helper function to pad numbers with leading zeros (e.g., 5 -> "05")
  const pad = (n) => String(n).padStart(2, "0");

  // Generate a timestamp (DTSTAMP) in UTC, formatted as YYYYMMDDTHHMMSSZ
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";

  // Loop through years 2020 to 2030
  for (let year = 2020; year <= 2030; year++) {
    for (const day of daysData) {
      // Build rule object for date calculation based on JSON fields
      const rule = {
        month: new Date(`${day.monthName} 1, ${year}`).getMonth() + 1, // month index (1-12)
        weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day.dayName),
        occurrence: { first: 1, second: 2, third: 3, fourth: 4, last: 5 }[day.occurence],
        day: day.day, // used for fixed date events
      };

      // Calculate the actual date
      const dateStr = calculateCommemorativeDate(year, rule);
      if (!dateStr) continue; // skip if date couldn't be calculated

      // Extract year, month, day from date string (YYYY-MM-DD)
      const [y, m, d] = dateStr.split("-").map(Number);

      // Build the start date string in ICS format (YYYYMMDD)
      const startDate = `${y}${pad(m)}${pad(d)}`;

      // Compute the end date as the following day (ICS end date is exclusive)
      const endDateObj = new Date(Date.UTC(y, m - 1, d + 1));
      const endDate = `${endDateObj.getUTCFullYear()}${pad(endDateObj.getUTCMonth() + 1)}${pad(
        endDateObj.getUTCDate()
      )}`;

      // Fetch the full description from the provided URL
      let descriptionText;
      try {
        const res = await fetch(day.descriptionURL);
        descriptionText = res.ok
          ? (await res.text()).replace(/\r?\n/g, " ") // replace newlines with spaces
          : "Description not available.";
      } catch {
        descriptionText = "Description not available.";
      }

      // Generate a unique ID for the event
      const uid = `${day.name.replace(/\s+/g, "")}-${year}@yourapp`;

      // Add the event to the calendar content
      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${day.name}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${endDate}`,
        `DESCRIPTION:${descriptionText}`,
        "END:VEVENT"
      );
    }
  }

  // End of calendar content
  lines.push("END:VCALENDAR");

  // Write the ICS file using CRLF line endings (per ICS spec)
  fs.writeFileSync("commemorative-days.ics", lines.join("\r\n"));
  console.log("commemorative-days.ics has been generated");
}

// Execute the ICS generation function
generateICS().catch(console.error);
