// This is a placeholder file which shows how you can define functions which can be used from both a browser script and a node script. You can delete the contents of the file once you have understood how it works.

export function getGreeting() {
  return "Hello";
}

export async function loadCommemorativeDays() {
  const res = await fetch("days.json");
  if (!res.ok) {
    throw new Error("Failed to load commemorative days");
  }
  const data = await res.json();
  return data;
}
