// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

// import { getGreeting } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

// window.onload = function() {
//     document.querySelector("body").innerText = `${getGreeting()} - there are ${daysData.length} known days`;
// }

const modalWindow = document.querySelector("#descriptionModal");
const modalWindowTitle = document.querySelector("#modalTitle");
const modalWindowDescription = document.querySelector("#modalText");
const prevMonth = document.querySelector("#prev-month");
const closeBtn = document.querySelector('#modalClose');

prevMonth.addEventListener(`click`, async () => {
  async function fetchDescription(params) {
    const response = await fetch(`https://codeyourfuture.github.io/The-Piscine/days/${params}.txt`);
    const data = await response.text();
    return data;
  }
  const data = await fetchDescription(`binturongs`);
  console.log(data);
  renderDescription(daysData[0].name, data)
});
console.log(daysData);

function renderDescription(title, description) {
    modalWindowTitle.textContent = title;
    modalWindowDescription.textContent = description;
    modalWindow.showModal();
}

closeBtn.addEventListener(`click`,()=>{
    modalWindow.close(); 
})