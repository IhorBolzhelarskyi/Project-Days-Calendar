// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import {
  getGreeting,
  loadCommemorativeDays,
  calculateCommemorativeDate,
  getDateInAString
} from "./common.mjs";

import daysData from "./days.json" with { type: "json" };

window.onload = function () {
  document.querySelector("body").innerText = `${getGreeting()} - there are ${daysData.length} known days`;

  // Example: render current month
  const today = new Date();
  renderCalendar(today.getFullYear(), today.getMonth() + 1);
};

const calendarContainer = document.getElementById("calendar-container");

// Render the calendar grid for a specific year and month
export async function renderCalendar(year, month) {
  calendarContainer.innerHTML = "";

  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day-cell");

    const dateObj = new Date(year, month - 1, day); // JS months are 0-based
    const dateString = getDateInAString(dateObj);

    cell.dataset.date = dateString;
    cell.textContent = day;

    calendarContainer.appendChild(cell);
  }

  await displayCommemorativeDays(year, month);
}

// Load, calculate, and display commemorative day names
async function displayCommemorativeDays(year, month) {
  const days = await loadCommemorativeDays();

  days.forEach((day) => {
    const targetDate = calculateCommemorativeDate(year, day);
    if (!targetDate) return;

    const [targetYear, targetMonth] = targetDate.split("-").map(Number);

    if (targetYear !== year || targetMonth !== month) return;

    const cell = document.querySelector(`[data-date="${targetDate}"]`);
    if (cell) {
      const label = document.createElement("span");
      label.classList.add("commemorative-label");
      label.textContent = day.name;
      cell.appendChild(label);
    }
  });
}
