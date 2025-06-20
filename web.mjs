import {
  loadCommemorativeDays,
  calculateCommemorativeDate,
  getDateInAString,
  fetchDescription
} from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

// DOM elements
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
let currentMonth = today.getMonth();
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
  monthSelect.value = month;
  yearSelect.value = year;

  const table = document.createElement("table");
  table.innerHTML = "<tr>" + ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    .map(day => `<th>${day}</th>`).join("") + "</tr>";

  const firstDay = new Date(year, month, 1);
  let start = firstDay.getDay() - 1;
  if (start === -1) start = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let day = 1;

  while (day <= daysInMonth) {
    const row = table.insertRow();
    for (let i = 0; i < 7; i++) {
      const cell = row.insertCell();
      if ((day === 1 && i < start) || day > daysInMonth) {
        cell.textContent = "";
      } else {
        const dateObj = new Date(year, month, day);
        const dateString = getDateInAString(dateObj);

        cell.textContent = day;
        cell.dataset.date = dateString;
        cell.tabIndex = 0; // Makes the cell focusable
        day++;
      }
    }
  }

  calendarDiv.appendChild(table);
  await displayCommemorativeDays(year, month + 1); // January is 0, so month + 1 for display
}

// Loads and highlight commemorative days
async function displayCommemorativeDays(year, month) {
  const days = await loadCommemorativeDays(); 

  for (const day of days) {
        const rule = {
      month: monthNames.indexOf(day.monthName) + 1, 
      weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day.dayName),
      occurrence: { first: 1, second: 2, third: 3, fourth: 4, last: 5 }[day.occurence]
    };
    const targetDate = calculateCommemorativeDate(year, rule);
    if (!targetDate) continue;

    const [y, m] = targetDate.split("-").map(Number);
    if (y !== year || m !== month) continue;

    const cell = document.querySelector(`[data-date="${targetDate}"]`);
    if (cell) {
      const label = document.createElement("span");
      label.classList.add("commemorative-label");
      label.textContent = day.name;
      cell.appendChild(label);

      cell.classList.add("clickable");
      cell.style.cursor =`pointer`;
      // Shows modal on click
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

// Navigation events
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

// Modal close button
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.open) {
    modal.close();
  }
});

modalClose.addEventListener(`click`,()=>{
  modal.close();
})

const style = document.createElement("style");
style.innerHTML = `
  [tabindex]:focus-visible,
  button:focus-visible,
  select:focus-visible {
    outline: 2px solid black;
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);