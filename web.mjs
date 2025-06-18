// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.


const calendarDiv = document.getElementById("calendar-container");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");


const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

monthNames.forEach((name, i) => {
  monthSelect.innerHTML += `<option value="${i}">${name}</option>`;
});
for (let y = 2000; y <= 2030; y++) {
  yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
}

function showCalendar(year, month) {
  calendarDiv.innerHTML = "";
  monthSelect.value = month;
  yearSelect.value = year;

  const table = document.createElement("table");
  table.innerHTML = "<tr>" + ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    .map(d => `<th>${d}</th>`).join("") + "</tr>";

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
        cell.textContent = day++;
      }
    }
  }
  calendarDiv.appendChild(table);
}

// Event listeners
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

showCalendar(currentYear, currentMonth);