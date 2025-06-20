// Import functions from common.mjs
import {
  loadCommemorativeDays,
  calculateCommemorativeDate,
  getDateInAString,
  fetchDescription
} from "./common.mjs";

// Import JSON data
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

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Populate dropdowns
monthNames.forEach((name, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = name;
  monthSelect.appendChild(option);
});

for (let y = 1900; y <= 2050; y++) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

window.onload = () => {
  showCalendar(currentYear, currentMonth);
};

let lastFocusedCell = null; //Track last focused cell

async function showCalendar(year, month) {
  calendarDiv.innerHTML = "";

  monthSelect.value = month;
  yearSelect.value = year;

  const table = document.createElement("table");
  table.setAttribute("role", "grid"); // Accessibility improvement

  const caption = document.createElement("caption"); // Calendar caption
  caption.textContent = `${monthNames[month]} ${year} Calendar`;
  caption.id = "calendar-caption";
  table.appendChild(caption);
  table.setAttribute("aria-labelledby", "calendar-caption");

  table.innerHTML += "<tr>" + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    .map(day => `<th scope="col">${day}</th>`).join("") + "</tr>";

  const firstDay = new Date(year, month, 1);
  let start = firstDay.getDay() - 1;
  if (start === -1) start = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let day = 1;

  while (day <= daysInMonth) {
    const row = table.insertRow();
    for (let i = 0; i < 7; i++) {
      const cell = row.insertCell();

      cell.classList.add("calendar-day"); // Add class for styling
      cell.setAttribute("role", "gridcell"); // Accessibility fix

      if ((day === 1 && i < start) || day > daysInMonth) {
        cell.textContent = "";
      } else {
        const dateObj = new Date(Date.UTC(year, month, day)); 

        const dateString = getDateInAString(dateObj); // Format: YYYY-MM-DD

        cell.textContent = day; // Display the day number
        cell.dataset.date = dateString; // Store the date on the cell
        cell.tabIndex = 0; // Make it keyboard focusable
        cell.setAttribute("role", "button"); // Make screen readers treat it as a button
        cell.setAttribute("aria-label", `Day ${day} of ${monthNames[month]} ${year}`);
        day++;
      }
    }
  }

  calendarDiv.appendChild(table);

  // Add labels and click events for commemorative days
  await displayCommemorativeDays(year, month + 1); // month + 1 because it's 0-based in JS
}

// Add commemorative day labels and modal popup
async function displayCommemorativeDays(year, month) {
  const days = await loadCommemorativeDays();

  for (const day of days) {
  const occurrenceMap = { first: 1, second: 2, third: 3, fourth: 4, last: 5 };

  const rule = {
    month: monthNames.indexOf(day.monthName) + 1,
    weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day.dayName),
    occurrence: occurrenceMap[day.occurence]  
  };
    const targetDate = calculateCommemorativeDate(year, rule);
    if (!targetDate) continue;

    const [y, m] = targetDate.split("-").map(Number);
    if (y !== year || m !== month) continue;

    const cell = document.querySelector(`[data-date="${targetDate}"]`);
    if (cell) {
      // Add line break before label
      cell.appendChild(document.createElement("br"));

      const label = document.createElement("span");
      label.classList.add("commemorative-label");
      label.textContent = day.name;
      cell.appendChild(label);

      cell.classList.add("clickable");
      cell.style.cursor = `pointer`;
      cell.setAttribute("role", "button"); 
      cell.setAttribute("aria-label", `${day.name} on ${targetDate}`); 

      cell.addEventListener("click", async () => {
        lastFocusedCell = cell; 
        modalTitle.textContent = day.name;
        modalText.textContent = "Loading...";
        const text = await fetchDescription(day.descriptionURL);
        modalText.textContent = text;
        modal.showModal();
        modalClose.focus(); 
      });

      cell.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lastFocusedCell = cell; 
          modalTitle.textContent = day.name;
          modalText.textContent = "Loading...";
          const text = await fetchDescription(day.descriptionURL);
          modalText.textContent = text;
          modal.showModal();
          modalClose.focus(); 
        }
      });
    }
  }
}

// Navigation
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

monthSelect.onchange = () => {
  currentMonth = +monthSelect.value;
  showCalendar(currentYear, currentMonth);
};

yearSelect.onchange = () => {
  currentYear = +yearSelect.value;
  showCalendar(currentYear, currentMonth);
};

// ESC closes modal and returns focus
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.open) {
    modal.close();
    if (lastFocusedCell) lastFocusedCell.focus();
  }
});

modalClose.addEventListener("click", () => {
  modal.close();
  if (lastFocusedCell) lastFocusedCell.focus(); 
});

// Styling and accessibility
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


  td.calendar-day {
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
  }

  td.clickable {
    background-color: #f9f9f9;
    }

  html {
    font-size: 100%;
    color-scheme: light dark;
  }

  body {
    font-family: system-ui, sans-serif;
    color: #000;
    background-color: #fff;
  }
`;
document.head.appendChild(style);