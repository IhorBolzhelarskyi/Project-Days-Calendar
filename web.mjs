// Import functions from common.mjs
import {
  loadCommemorativeDays,
  calculateCommemorativeDate,
  getDateInAString,
  fetchDescription
} from "./common.mjs";

// Import JSON data for commemorative days
import daysData from "./days.json" with { type: "json" };

// DOM Elements
const calendarDiv = document.getElementById("calendar-container");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const modal = document.getElementById("descriptionModal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalClose = document.getElementById("modalClose");

// Month list
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


let today = new Date();
let currentMonth = today.getMonth(); // 0-based index (0 = Jan)
let currentYear = today.getFullYear();

// Populate dropdowns
monthNames.forEach((name, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = name;
  monthSelect.appendChild(option);
});

for (let y = 2000; y <= 2030; y++) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

// Shows the current month and year on load
window.onload = () => {
  showCalendar(currentYear, currentMonth);
};

// Renders the calendar grid with commemorative days
async function showCalendar(year, month) {
  calendarDiv.innerHTML = ""; // Clears old calendar

  // Set the dropdowns to current values
  monthSelect.value = month;
  yearSelect.value = year;

  const table = document.createElement("table");

  // Create a header row with the day names
  table.innerHTML = "<tr>" + ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    .map(day => `<th>${day}</th>`).join("") + "</tr>";

  // Get first day of the month (e.g., 1st October)
  const firstDay = new Date(year, month, 1);
  let start = firstDay.getDay() - 1; // Adjust because JS starts week on Sunday
  if (start === -1) start = 6; // If it's Sunday, move to end of week

  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in that month
  let day = 1;

  // Create rows of calendar (7 columns per row)
  while (day <= daysInMonth) {
    const row = table.insertRow();
    for (let i = 0; i < 7; i++) {
      const cell = row.insertCell();
      if ((day === 1 && i < start) || day > daysInMonth) {
        cell.textContent = ""; // Empty cell for padding before/after month
      } else {
        const dateObj = new Date(year, month, day);
        const dateString = getDateInAString(dateObj); // Format: YYYY-MM-DD

        cell.textContent = day; // Display the day number
        cell.dataset.date = dateString; // Store the date on the cell
        cell.tabIndex = 0; // Make it keyboard focusable
        day++;
      }
    }
  }

  // Add the table to the page
  calendarDiv.appendChild(table);

  // Add labels and click events for commemorative days
  await displayCommemorativeDays(year, month + 1); // Add 1 to match human-readable month
}

// --- Add commemorative day labels and modal popup --- //
async function displayCommemorativeDays(year, month) {
  const days = await loadCommemorativeDays(); // Get days from file/API

  for (const day of days) {
    const rule = {
      month: monthNames.indexOf(day.monthName) + 1,
      weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day.dayName),
      occurrence: { first: 1, second: 2, third: 3, fourth: 4, last: 5 }[day.occurence]
    };

    const targetDate = calculateCommemorativeDate(year, rule); // Get actual date like 2025-10-31
    if (!targetDate) continue;

    const [y, m] = targetDate.split("-").map(Number);
    if (y !== year || m !== month) continue; // Skip if it's not this month

    const cell = document.querySelector(`[data-date="${targetDate}"]`);
    if (cell) {
      // ✅ Add line break before label
      cell.appendChild(document.createElement("br"));

      // Create the commemorative label
      const label = document.createElement("span");
      label.classList.add("commemorative-label");
      label.textContent = day.name;
      cell.appendChild(label);

      // Make the cell interactive
      cell.classList.add("clickable");
      cell.style.cursor = `pointer`;

      // Show popup with description when clicked
      cell.addEventListener("click", async () => {
        modalTitle.textContent = day.name;
        modalText.textContent = "Loading...";

        const text = await fetchDescription(day.descriptionURL);
        modalText.textContent = text;
        modal.showModal();
      });
    }
  }
}

// Navigation buttons
prevBtn.onclick = () => {
  if (--currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  showCalendar(currentYear, currentMonth);
};

nextBtn.onclick = () => {
  if (++currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  showCalendar(currentYear, currentMonth);
};

// Dropdown change handlers
monthSelect.onchange = () => {
  currentMonth = +monthSelect.value;
  showCalendar(currentYear, currentMonth);
};

yearSelect.onchange = () => {
  currentYear = +yearSelect.value;
  showCalendar(currentYear, currentMonth);
};

//  Modal close button
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.open) {
    modal.close();
  }
});

modalClose.addEventListener(`click`, () => {
  modal.close();
});

// Styling and a
const style = document.createElement("style");
style.innerHTML = `
  [tabindex]:focus-visible,
  button:focus-visible,
  select:focus-visible {
    outline: 2px solid black;
    outline-offset: 2px;
  }

  .commemorative-label {
    font-size: 0.75em;
    color: #333;
    display: block;
    margin-top: 2px;
    line-height: 1.1;
  }
`;
document.head.appendChild(style);
