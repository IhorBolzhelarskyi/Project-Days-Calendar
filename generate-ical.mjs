// This is a placeholder file which shows how you can access functions and data defined in other files. You can delete the contents of the file once you have understood how it works.
// It can be run with `node`.

import fs from "fs";
import fetch from "node-fetch";
import { createEvents } from "ics";
import { calculateCommemorativeDate, fetchDescription } from "./common.mjs";

/**
 * Read and parse the days.json file into a JavaScript array.
 * Uses fs.readFileSync + JSON.parse because JSON import assertions
 * may not be supported in all Node.js environments.
 */
const daysData = JSON.parse(fs.readFileSync("./days.json", "utf-8"));

//  Fetches full text description from a given URL

// Main function that generates an iCalendar file covering years 2020–2030
async function generateICal() {
  const events = [];

  for (let year = 2020; year <= 2030; year++) {
    for (const day of daysData) {
      // Build the rule object from JSON fields
      const rule = {
        month: new Date(`${day.monthName} 1, ${year}`).getMonth() + 1, // 1–12
        weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day.dayName),
        occurrence: { first: 1, second: 2, third: 3, fourth: 4, last: 5 }[day.occurence],
      };

      // Calculate date in "YYYY-MM-DD" format
      const dateStr = calculateCommemorativeDate(year, rule);
      if (!dateStr) continue; // skip if no valid date

      // Split into numeric components for the ics library
      const [y, m, d] = dateStr.split("-").map(Number);
      // Fetch the full plain-text description
      const descriptionText = await fetchDescription(day.descriptionURL);

      // Push an ics event object
      events.push({
        title: day.name,
        start: [y, m, d],
        description: descriptionText.replace(/\r?\n/g, " "),
      });
    }
  }

  // Use ics.createEvents to build the .ics file content
  createEvents(events, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }
    // Write the output file synchronously
    fs.writeFileSync("commemorative-days.ics", value);
    console.log("commemorative-days.ics has been created.");
  });
}

// run iCal file generation process
generateICal();
